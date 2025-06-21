import { prisma } from '@/lib/prisma'
import { socialfi } from '@/utils/socialfi'
import { NextRequest, NextResponse } from 'next/server'

// GET handler for fetching a profile by username
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username')

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 })
  }

  try {
    // 1. Check for the user in the local Prisma DB first.
    const localUser = await prisma.user.findUnique({
      where: { username },
    })

    if (localUser) {
      console.log('Found user in local DB:', localUser.username)
      return NextResponse.json(localUser)
    }
    
    // 2. If not found locally, check Tapestry
    // Note: This part has the same challenge as before. If a user exists on Tapestry
    // but not in our DB, we can't easily create them without their privyDid.
    // For now, we'll assume that any profile being requested should already exist in our DB.
    
    return NextResponse.json({ error: 'User not found' }, { status: 404 })

  } catch (error: any) {
    console.error('Error fetching profile info:', error.message)
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
  const { bio, image, privyDid } = body

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
      { bio, image }, // Only send the fields Tapestry cares about
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
