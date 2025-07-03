import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { inngest } from "@/api/inngest";

interface FollowRequestBody {
  followerPrivyDid: string
  followeePrivyDid: string
  followerUsername: string
  followeeUsername: string
}

export async function POST(req: NextRequest) {
  try {
    const { 
      followerPrivyDid, 
      followeePrivyDid, 
      followerUsername, 
      followeeUsername 
    }: FollowRequestBody = await req.json()

    if (!followerPrivyDid || !followeePrivyDid || !followerUsername || !followeeUsername) {
      return NextResponse.json(
        { error: 'Follower and followee information is required' },
        { status: 400 },
      )
    }

    // 1. Create the follow relationship in the local Prisma database
    const followRelationship = await prisma.follow.create({
      data: {
        followerId: followerPrivyDid,
        followingId: followeePrivyDid,
      },
    })

    // 2. Send an event to Inngest for background sync
    await inngest.send({
        name: "user/followed",
        data: { 
            followerUsername, 
            followeeUsername,
            followerId: followerPrivyDid,
            followeeId: followeePrivyDid,
        },
    });

    return NextResponse.json(followRelationship)
  } catch (error: any) {
    console.error('Error processing follow request:', error)
    if (error.code === 'P2002') { // Unique constraint violation - already following
      return NextResponse.json({ error: 'Already following' }, { status: 409 })
    }
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 },
    )
  }
}
