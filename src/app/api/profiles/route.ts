import { prisma } from '@/lib/prisma';
import { createTapestryProfile, getTapestryIdentity } from '@/lib/tapestry';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { privyDid, username, bio, image, solanaWalletAddress, embeddedWalletAddress } = await req.json();

    if (!privyDid || !username || !solanaWalletAddress) {
      return NextResponse.json(
        { error: 'Privy DID, username, and wallet address are required' },
        { status: 400 },
      );
    }

    // Try to create profile on Tapestry first, but don't fail if it doesn't work
    let tapestryProfile = null;
    try {
      tapestryProfile = await createTapestryProfile({
        walletAddress: solanaWalletAddress,
        username,
        bio,
        image,
        execution: 'FAST_UNCONFIRMED'
      });
    } catch (tapestryError: any) {
      console.warn('Tapestry profile creation failed, continuing with local creation:', tapestryError.message);
    }

    // Always create/update in local database
    const localUser = await prisma.user.upsert({
      where: { privyDid },
      update: {
        username,
        bio,
        image,
        solanaWalletAddress,
        embeddedWalletAddress,
      },
      create: {
        privyDid,
        username,
        bio,
        image,
        solanaWalletAddress,
        embeddedWalletAddress,
      },
    });

    return NextResponse.json({
      success: true,
      user: localUser,
      tapestryProfile: tapestryProfile || null
    });

  } catch (error: any) {
    console.error("Error in profile creation:", error);
    if (error.code === 'P2002') {
      // Check which field caused the unique constraint violation
      if (error.meta?.target?.includes('username')) {
        return NextResponse.json(
          { error: 'Username already exists. Please choose a different username.' },
          { status: 409 },
        );
      }
      if (error.meta?.target?.includes('privyDid')) {
        return NextResponse.json(
          { error: 'User already has a profile.' },
          { status: 409 },
        );
      }
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create profile' },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const walletAddress = searchParams.get('walletAddress');

  if (!walletAddress) {
    return NextResponse.json(
      { error: 'Wallet address is required' },
      { status: 400 },
    );
  }

  try {
    console.log('Fetching profiles for wallet:', walletAddress);
    
    // Query local database first
    const profiles = await prisma.user.findMany({
      where: {
        OR: [
          { solanaWalletAddress: walletAddress },
          { embeddedWalletAddress: walletAddress },
        ],
      },
    });

    console.log('Found profiles in local DB:', profiles.length);

    if (profiles.length === 0) {
      // Try to fetch from Tapestry as backup using enhanced function
      try {
        if (process.env.TAPESTRY_API_KEY) {
          const tapestryResponse = await getTapestryIdentity({ walletAddress });
          
          if (tapestryResponse?.identities && Array.isArray(tapestryResponse.identities) && tapestryResponse.identities.length > 0) {
            console.log('Found profiles in Tapestry:', tapestryResponse.identities.length);
            // Return Tapestry profiles in expected format
            const formattedTapestryProfiles = tapestryResponse.identities
              .filter((identity: any) => identity.profiles?.[0]?.username) // Only include profiles with usernames
              .map((identity: any) => ({
                profile: {
                  username: identity.profiles[0].username,
                  image: identity.profiles[0]?.image || null,
                  bio: identity.profiles[0]?.bio || null,
                },
                wallets: {
                  address: walletAddress,
                  embeddedAddress: null,
                }
              }));
            
            // Only return Tapestry profiles if we found valid profiles with usernames
            if (formattedTapestryProfiles.length > 0) {
              return NextResponse.json({ profiles: formattedTapestryProfiles });
            }
            // If no valid Tapestry profiles found, fall through to check local database
          }
        }
      } catch (tapestryError: any) {
        console.warn('Tapestry lookup failed:', tapestryError.message);
      }
      
      return NextResponse.json({ profiles: [] });
    }

    // Format local profiles
    const formattedProfiles = profiles.map(p => ({
      profile: {
        username: p.username,
        image: p.image,
        bio: p.bio,
      },
      wallets: {
        address: p.solanaWalletAddress,
        embeddedAddress: p.embeddedWalletAddress,
      }
    }));

    return NextResponse.json({ profiles: formattedProfiles });
  } catch (error: any) {
    console.error("Error fetching profiles:", error);
    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 },
    );
  }
}

export const dynamic = 'force-dynamic';