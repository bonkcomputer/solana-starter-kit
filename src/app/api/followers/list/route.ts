import { prisma } from '@/lib/prisma'
import { getFollowers, getFollowing } from '@/lib/tapestry'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username')
  const type = searchParams.get('type') // 'followers' or 'following'

  if (!username || !type) {
    return NextResponse.json(
      { error: 'Username and type are required' },
      { status: 400 },
    )
  }

  try {
    let tapestryProfiles = []
    let tapestryCall
    // 1. Fetch from Tapestry
    if (type === 'followers') {
      tapestryCall = await getFollowers({ username })
    } else {
      tapestryCall = await getFollowing({ username })
    }

    tapestryProfiles = tapestryCall.profiles || []

    const tapestryUsernames = tapestryProfiles.map((p: any) => p.profile?.username).filter(Boolean)

    if (tapestryUsernames.length === 0) {
      return NextResponse.json({
        list: [],
      })
    }

    // 2. Get full profiles from our Prisma DB for the usernames from Tapestry
    const prismaProfiles = await prisma.user.findMany({
      where: {
        username: {
          in: tapestryUsernames,
        },
      },
      select: {
        privyDid: true,
        username: true,
        bio: true,
        image: true,
        solanaWalletAddress: true,
      },
    })

    // Return the enriched profiles from our database
    return NextResponse.json({ list: prismaProfiles })

  } catch (error: any) {
    console.error(`Error fetching ${type} for ${username}:`, error)
    // Fallback to Prisma if Tapestry fails for resilience
    try {
      const user = await prisma.user.findUnique({ where: { username } })
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      let data;
      if (type === 'followers') {
        data = await prisma.follow.findMany({
          where: { followingId: user.privyDid },
          include: { follower: true },
        })
        return NextResponse.json({ list: data.map(d => d.follower) })

      } else { // following
        data = await prisma.follow.findMany({
          where: { followerId: user.privyDid },
          include: { following: true },
        })
        return NextResponse.json({ list: data.map(d => d.following) })
      }
    } catch (dbError: any) {
        console.error(`Prisma fallback error:`, dbError)
        return NextResponse.json({ error: 'Failed to fetch social graph data' }, { status: 500 })
    }
  }
} 