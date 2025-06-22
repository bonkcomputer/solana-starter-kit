import { prisma } from "@/lib/prisma";
import { createTapestryProfile, getTapestryProfile } from "@/lib/tapestry";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const {
    username,
    bio,
    image,
    embeddedWalletAddress,
    solanaWalletAddress,
    privyDid,
    execution = 'FAST_UNCONFIRMED' // Default to fastest execution
  } = await req.json();

  if (!privyDid || !username || !solanaWalletAddress) {
    return NextResponse.json(
      { error: "Privy DID, username, and wallet address are required" },
      { status: 400 }
    );
  }

  try {
    // 1. First check if user already exists in Prisma DB
    const existingUser = await prisma.user.findUnique({
      where: { privyDid }
    });

    if (existingUser) {
      console.log('User already exists in Prisma DB:', existingUser.username);
      return NextResponse.json(
        { 
          error: "User with this privyDid already exists",
          existingProfile: existingUser
        },
        { status: 409 }
      );
    }

    // 2. Check if username is already taken
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUsername) {
      console.log('Username already taken:', username);
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 }
      );
    }

    // 3. Check if profile exists on Tapestry only (migration case)
    let tapestryProfile = null;
    try {
      const existingTapestryProfile = await getTapestryProfile({ username });
      if (existingTapestryProfile && existingTapestryProfile.profile) {
        console.log('Found existing Tapestry profile for username:', username);
        tapestryProfile = existingTapestryProfile;
      }
    } catch (_tapestryError: any) {
      console.log('No existing Tapestry profile found, will create new one');
    }

    // 4. Create or get profile on Tapestry
    if (!tapestryProfile) {
      console.log('Creating new Tapestry profile for:', username);
      tapestryProfile = await createTapestryProfile({
        walletAddress: solanaWalletAddress,
        username,
        bio,
        image,
        execution
      });

      if (!tapestryProfile) {
        throw new Error("Failed to create profile on Tapestry.");
      }
    } else {
      console.log('Using existing Tapestry profile for:', username);
    }

    // 5. Create user in local Prisma database
    console.log('Creating new Prisma user for:', username);
    const newUser = await prisma.user.create({
      data: {
        privyDid,
        username,
        bio,
        image,
        embeddedWalletAddress,
        solanaWalletAddress,
      },
    });

    console.log('✅ Successfully created profile for:', username);
    return NextResponse.json({ 
      tapestryProfile, 
      prismaUser: newUser,
      execution: execution,
      isNewTapestryProfile: !tapestryProfile // Indicates if we created a new Tapestry profile
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error creating profile:", error);

    if (error.code === "P2002") {
      // Check which field caused the unique constraint violation
      if (error.meta?.target.includes("username")) {
        return NextResponse.json(
          { error: "Username already exists" },
          { status: 409 }
        );
      }
      if (error.meta?.target.includes("privyDid")) {
        return NextResponse.json(
          { error: "User with this privyDid already exists" },
          { status: 409 }
        );
      }
    }

    // Generic error for other issues
    return NextResponse.json(
      { error: "Failed to create profile", details: error.message },
      { status: 500 }
    );
  }
}