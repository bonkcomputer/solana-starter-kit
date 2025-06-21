import { prisma } from '@/lib/prisma'
import { getFollowState } from '@/lib/tapestry'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const startId = searchParams.get('startId') // followerPrivyDid
  const endId = searchParams.get('endId')     // followeePrivyDid
  const followerUsername = searchParams.get('followerUsername')
  const followeeUsername = searchParams.get('followeeUsername')

  if (!startId || !endId) {
    return NextResponse.json(
      { error: 'startId and endId are required' },
      { status: 400 },
    )
  }

  try {
    // 1. Check local Prisma database first (faster)
    const localFollowRelationship = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: startId,
          followingId: endId,
        },
      },
    })

    const isFollowingLocally = !!localFollowRelationship

    // 2. Also check Tapestry if usernames are provided (for verification)
    let tapestryFollowState = null
    if (followerUsername && followeeUsername) {
      try {
        tapestryFollowState = await getFollowState({
          followerUsername,
          followeeUsername,
        })
      } catch (tapestryError: any) {
        console.warn('Tapestry follow state check failed:', tapestryError.message)
      }
    }

    // Return combined state information
    return NextResponse.json({
      isFollowing: isFollowingLocally,
      localState: isFollowingLocally,
      tapestryState: tapestryFollowState,
      dataSource: {
        local: true,
        tapestry: !!tapestryFollowState
      }
    })
  } catch (error: any) {
    console.error('Error verifying follow state:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify follow state' },
      { status: 500 },
    )
  }
}
