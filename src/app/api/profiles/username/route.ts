import { prisma } from '@/lib/prisma'
import { updateTapestryUsername } from '@/lib/tapestry'
import { validateUsername } from '@/utils/username-validation'
import { NextRequest, NextResponse } from 'next/server'

// PUT handler for updating username with weekly limit validation
export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { newUsername, privyDid } = body

  if (!newUsername || !privyDid) {
    return NextResponse.json(
      { error: 'New username and privyDid are required' },
      { status: 400 }
    )
  }

  // Validate username format and rules
  const usernameValidation = validateUsername(newUsername)
  if (!usernameValidation.isValid) {
    return NextResponse.json(
      { error: usernameValidation.error },
      { status: 400 }
    )
  }

  try {
    // 1. Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { privyDid },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // 2. Check if new username is already taken
    const usernameExists = await prisma.user.findUnique({
      where: { username: newUsername },
    })

    if (usernameExists && usernameExists.privyDid !== privyDid) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 409 }
      )
    }

    // 3. Check if user can change username (once per week limit)
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    if (existingUser.lastUsernameChange && existingUser.lastUsernameChange > oneWeekAgo) {
      const nextAllowedChange = new Date(existingUser.lastUsernameChange)
      nextAllowedChange.setDate(nextAllowedChange.getDate() + 7)
      
      return NextResponse.json(
        { 
          error: 'Username can only be changed once per week',
          nextAllowedChange: nextAllowedChange.toISOString(),
          daysRemaining: Math.ceil((nextAllowedChange.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        },
        { status: 429 }
      )
    }

    // 4. Update username on Tapestry first
    try {
      await updateTapestryUsername({
        oldUsername: existingUser.username,
        newUsername: newUsername,
      })
    } catch (tapestryError: any) {
      console.warn('Tapestry username update failed, but continuing with local update:', tapestryError.message)
      // We will still update our local DB even if Tapestry fails
      // to maintain app functionality. A sync process could fix this later.
    }

    // 5. Update username in local Prisma database
    const updatedUser = await prisma.user.update({
      where: { privyDid },
      data: {
        username: newUsername,
        lastUsernameChange: new Date(),
      },
    })

    console.log('✅ Username updated successfully:', {
      oldUsername: existingUser.username,
      newUsername: newUsername,
      privyDid: privyDid
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Username updated successfully'
    })

  } catch (error: any) {
    console.error('❌ Error updating username:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to update username' },
      { status: 500 }
    )
  }
}

// GET handler to check if user can change username
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const privyDid = searchParams.get('privyDid')

  if (!privyDid) {
    return NextResponse.json(
      { error: 'privyDid is required' },
      { status: 400 }
    )
  }

  try {
    const user = await prisma.user.findUnique({
      where: { privyDid },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const canChange = !user.lastUsernameChange || user.lastUsernameChange <= oneWeekAgo
    
    let nextAllowedChange = null
    let daysRemaining = 0

    if (!canChange && user.lastUsernameChange) {
      nextAllowedChange = new Date(user.lastUsernameChange)
      nextAllowedChange.setDate(nextAllowedChange.getDate() + 7)
      daysRemaining = Math.ceil((nextAllowedChange.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    }

    return NextResponse.json({
      canChange,
      currentUsername: user.username,
      lastUsernameChange: user.lastUsernameChange,
      nextAllowedChange,
      daysRemaining
    })

  } catch (error: any) {
    console.error('❌ Error checking username change eligibility:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to check username change eligibility' },
      { status: 500 }
    )
  }
} 