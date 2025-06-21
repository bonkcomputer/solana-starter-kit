import { prisma } from "@/lib/prisma";
import { socialfi } from "@/utils/socialfi";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const {
    username,
    bio,
    image,
    embeddedWalletAddress,
    solanaWalletAddress,
    privyDid,
  } = await req.json();

  if (!privyDid || !username || !solanaWalletAddress) {
    return NextResponse.json(
      { error: "Privy DID, username, and wallet address are required" },
      { status: 400 }
    );
  }

  try {
    // 1. Create profile on Tapestry
    const tapestryProfile = await socialfi.profiles.findOrCreateCreate(
      {
        apiKey: process.env.TAPESTRY_API_KEY || "",
      },
      {
        walletAddress: solanaWalletAddress,
        username,
        bio,
        image,
        blockchain: "SOLANA",
      }
    );

    if (!tapestryProfile) {
      throw new Error("Failed to create profile on Tapestry.");
    }

    // 2. Create user in local Prisma database
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

    return NextResponse.json({ tapestryProfile, prismaUser: newUser }, { status: 201 });
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