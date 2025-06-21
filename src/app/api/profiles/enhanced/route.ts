import { prisma } from '@/lib/prisma'
import { getTapestryProfile, getFollowers, getFollowing } from '@/lib/tapestry'
import { NextRequest, NextResponse } from 'next/server'

// GET handler for fetching enhanced profile data with social counts
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username')

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 })
  }

  try {
    // 1. Get basic profile from local DB
    const localUser = await prisma.user.findUnique({
      where: { username },
    })

    // 2. Get enhanced data from Tapestry
    const [tapestryProfile, followers, following] = await Promise.allSettled([
      getTapestryProfile({ username }),
      getFollowers({ username }),
      getFollowing({ username })
    ])

    // 3. Combine the data
    const enhancedProfile = {
      // Basic profile data (from local DB or Tapestry)
      ...(localUser || {
        username,
        bio: null,
        image: null,
        solanaWalletAddress: null,
        fromTapestry: true
      }),
      
      // Social counts from Tapestry
      socialCounts: {
        followers: followers.status === 'fulfilled' && followers.value?.profiles ? 
          (followers.value.profiles.length || 0) : 0,
        following: following.status === 'fulfilled' && following.value?.profiles ? 
          (following.value.profiles.length || 0) : 0,
      },

      // Raw Tapestry data if available
      tapestryData: {
        profile: tapestryProfile.status === 'fulfilled' ? tapestryProfile.value : null,
        followers: followers.status === 'fulfilled' ? followers.value : null,
        following: following.status === 'fulfilled' ? following.value : null,
      },

      // Metadata
      dataSource: {
        local: !!localUser,
        tapestry: tapestryProfile.status === 'fulfilled' && !!tapestryProfile.value,
        socialData: followers.status === 'fulfilled' || following.status === 'fulfilled'
      }
    }

    return NextResponse.json(enhancedProfile)

  } catch (error: any) {
    console.error('Error fetching enhanced profile:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch enhanced profile' },
      { status: 500 },
    )
  }
} 