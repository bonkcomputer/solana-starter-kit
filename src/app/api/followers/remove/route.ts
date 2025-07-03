import { prisma } from '@/lib/prisma'
import { unfollowUser } from '@/lib/tapestry'
import { NextRequest, NextResponse } from 'next/server'
import { inngest } from "@/api/inngest";

interface UnfollowRequestBody {
  followerPrivyDid: string;
  followeePrivyDid: string;
  followerUsername: string;
  followeeUsername: string;
}

export async function POST(req: NextRequest) {
  try {
    const {
      followerPrivyDid,
      followeePrivyDid,
      followerUsername,
      followeeUsername,
    }: UnfollowRequestBody = await req.json();

    if (!followerPrivyDid || !followeePrivyDid || !followerUsername || !followeeUsername) {
      return NextResponse.json(
        { error: 'Follower and followee information is required' },
        { status: 400 },
      )
    }

    // 1. Unfollow on Tapestry first. This is the source of truth.
    try {
      await unfollowUser({
        followerUsername,
        followeeUsername,
      })
    } catch (tapestryError: any) {
      console.error('Tapestry unfollow failed. Aborting local update.', tapestryError.message)
      // If the primary action fails, we should not update our local DB.
      return NextResponse.json({ error: 'Failed to perform unfollow action on-chain.' }, { status: 500 });
    }

    // 2. Delete the follow relationship in the local Prisma database
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: followerPrivyDid,
          followingId: followeePrivyDid,
        },
      },
    })

    // 3. Send an event to Inngest for background sync
    await inngest.send({
        name: "user/unfollowed",
        data: { followerUsername, followeeUsername },
    });

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error processing unfollow request:', error)
    if (error.code === 'P2025') { // Record to delete not found
      return NextResponse.json({ error: 'Not following' }, { status: 404 })
    }
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 },
    )
  }
}