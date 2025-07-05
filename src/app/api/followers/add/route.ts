import { prisma } from '@/lib/prisma'
import { followUser } from '@/lib/tapestry'
import { awardPoints } from '@/services/points'
import { PointActionType } from '@/models/points.models'
import { NextRequest, NextResponse } from 'next/server'

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

    // 1. Follow on Tapestry first
    try {
      await followUser({
        followerUsername,
        followeeUsername,
      })
    } catch (tapestryError: any) {
      console.warn('Tapestry follow failed, continuing with local creation:', tapestryError.message)
    }

    // 2. Create the follow relationship in the local Prisma database
    const followRelationship = await prisma.follow.create({
      data: {
        followerId: followerPrivyDid,
        followingId: followeePrivyDid,
      },
    })

    // 3. Award points for following a user
    try {
      const pointsResult = await awardPoints(
        followerPrivyDid,
        PointActionType.FOLLOW_USER,
        { 
          followeeUsername, 
          followeePrivyDid,
          followId: followRelationship.followerId + '-' + followRelationship.followingId
        }
      );
      console.log('✅ Awarded follow points:', pointsResult.pointsAwarded);
    } catch (pointsError) {
      console.error('Failed to award follow points:', pointsError);
      // Don't fail the entire request if points fail
    }

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
