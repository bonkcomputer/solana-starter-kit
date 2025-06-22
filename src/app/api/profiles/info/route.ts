import { prisma } from '@/lib/prisma'
import { getTapestryProfile } from '@/lib/tapestry'
import { socialfi } from '@/utils/socialfi'
import { NextRequest, NextResponse } from 'next/server'

// GET handler for fetching a profile by username or privyDid
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username')
  const privyDid = searchParams.get('privyDid')

  if (!username && !privyDid) {
    return NextResponse.json({ error: 'Username or privyDid is required' }, { status: 400 })
  }

  try {
    // 1. Check for the user in the local Prisma DB first.
    let localUser = null
    
    if (privyDid) {
      // Query by privyDid
      console.log('🔍 Checking Prisma DB for privyDid:', privyDid)
      localUser = await prisma.user.findUnique({
        where: { privyDid },
      })
    } else if (username) {
      // Query by username
      console.log('🔍 Checking Prisma DB for username:', username)
      localUser = await prisma.user.findUnique({
        where: { username },
      })
    }

    if (localUser) {
      console.log('✅ Found user in local DB:', localUser.username)
      
      // 2. Try to get additional information from Tapestry (social counts, etc.)
      try {
        const tapestryProfile = await getTapestryProfile({ username: localUser.username })
        if (tapestryProfile && tapestryProfile.profile && tapestryProfile.socialCounts) {
          // Merge local user data with Tapestry social data
          const enhancedProfile = {
            ...localUser,
            socialCounts: tapestryProfile.socialCounts,
            tapestryProfile: tapestryProfile.profile,
            source: 'prisma_with_tapestry'
          }
          console.log('✅ Enhanced profile with Tapestry data for:', localUser.username)
          return NextResponse.json(enhancedProfile)
        }
      } catch (tapestryError: any) {
        console.warn('⚠️ Failed to fetch Tapestry profile data:', tapestryError.message)
      }
      
      // Return local user data even if Tapestry fails
      console.log('✅ Returning local profile data for:', localUser.username)
      return NextResponse.json({
        ...localUser,
        source: 'prisma_only'
      })
    }
    
    // 3. If not found locally and we have a username, try to get from Tapestry directly
    if (username) {
      console.log('🔍 User not found in Prisma, checking Tapestry for username:', username)
      try {
        const tapestryProfile = await getTapestryProfile({ username })
        if (tapestryProfile && tapestryProfile.profile) {
          console.log('✅ Found profile in Tapestry for:', username)
          
          // Handle different possible Tapestry profile structures
          let profileData: any = null
          
          // Check if profile is an array or object
          if (Array.isArray(tapestryProfile.profile) && tapestryProfile.profile.length > 0) {
            profileData = tapestryProfile.profile[0]
          } else if (tapestryProfile.profile && typeof tapestryProfile.profile === 'object') {
            profileData = tapestryProfile.profile
          }
          
          // Return Tapestry profile data in our expected format
          const tapestryUser = {
            username: profileData?.properties?.username || profileData?.username || username,
            bio: profileData?.properties?.bio || profileData?.bio || null,
            image: profileData?.properties?.image || profileData?.image || null,
            solanaWalletAddress: profileData?.properties?.ownerWallet || profileData?.ownerWallet || null,
            socialCounts: tapestryProfile.socialCounts || { followers: [0], following: [0] },
            tapestryProfile: tapestryProfile.profile,
            source: 'tapestry_only' // Flag to indicate this is from Tapestry only
          }
          return NextResponse.json(tapestryUser)
        }
      } catch (tapestryError: any) {
        console.warn('⚠️ Failed to fetch from Tapestry:', tapestryError.message)
      }
    }
    
    // 4. If privyDid was provided but no user found, this is definitely a new user
    if (privyDid) {
      console.log('🆕 New user detected - privyDid not found in either database:', privyDid)
      return NextResponse.json({ 
        error: 'User not found',
        isNewUser: true,
        privyDid: privyDid
      }, { status: 404 })
    }
    
    console.log('❌ User not found in any database for:', username || privyDid)
    return NextResponse.json({ error: 'User not found' }, { status: 404 })

  } catch (error: any) {
    console.error('❌ Error fetching profile info:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile' },
      { status: 500 },
    )
  }
}

// PUT handler for updating a profile
export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username')
  const body = await req.json()
  const { bio, image, privyDid, properties } = body

  if (!username || !privyDid) {
    return NextResponse.json({ error: 'Username and privyDid are required' }, { status: 400 })
  }

  try {
    // 1. Update on Tapestry first
    await socialfi.profiles.profilesUpdate(
      {
        apiKey: process.env.TAPESTRY_API_KEY || '',
        id: username,
      },
      { 
        bio, 
        image,
        ...(properties && { properties }) // Include custom properties if provided
      }
    )

    // 2. Update our local Prisma database
    const updatedUser = await prisma.user.update({
      where: { privyDid },
      data: {
        bio,
        image,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error: any) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 },
    )
  }
}

