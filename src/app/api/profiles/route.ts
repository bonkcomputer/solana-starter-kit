import { prisma } from '@/lib/prisma';
import { socialfi } from '@/utils/socialfi';
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

    const tapestryProfile = await socialfi.profiles.findOrCreateCreate(
      {
        apiKey: process.env.TAPESTRY_API_KEY || '',
      },
      {
        walletAddress: solanaWalletAddress,
        username,
        bio,
        image,
        blockchain: 'SOLANA',
      },
    );

    if (!tapestryProfile) {
        throw new Error('Failed to create profile on Tapestry.');
    }

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

    return NextResponse.json(localUser);

  } catch (error: any) {
    console.error("Error in profile creation:", error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A user with this DID or username already exists in the local database.' },
        { status: 409 },
      );
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
    const profiles = await prisma.user.findMany({
      where: {
        OR: [
          { solanaWalletAddress: walletAddress },
          { embeddedWalletAddress: walletAddress },
        ],
      },
    });

    if (profiles.length === 0) {
      return NextResponse.json({ profiles: [] });
    }

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
    }))

    return NextResponse.json({ profiles: formattedProfiles });
  } catch (error: any) {
    console.error("Error fetching profiles:", error);
    return NextResponse.json(
      { error: 'Failed to fetch profiles from local database' },
      { status: 500 },
    );
  }
}

export const dynamic = 'force-dynamic';