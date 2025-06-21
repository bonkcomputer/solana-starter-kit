import { prisma } from '@/lib/prisma'
import { createTapestryLike, deleteTapestryLike } from '@/lib/tapestry'
import { NextRequest, NextResponse } from 'next/server'

// POST handler for "liking" a comment
export async function POST(request: NextRequest) {
  try {
    const { userId, commentId, username, tapestryCommentId } = await request.json()

    if (!userId || !commentId || !username || !tapestryCommentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1. Try to write to Tapestry first using enhanced function
    try {
      await createTapestryLike({
        username,
        tapestryCommentId,
      })
    } catch (tapestryError: any) {
      console.warn('Tapestry like creation failed, continuing with local creation:', tapestryError.message)
    }

    // 2. Write to our local Prisma database (always do this)
    const newLike = await prisma.like.create({
      data: {
        userId,   // The user's privyDid
        commentId, // The comment's CUID from our DB
      },
    })

    return NextResponse.json(newLike)
  } catch (error) {
    console.error('[POST Like Error]:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create like'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// DELETE handler for "unliking" a comment
export async function DELETE(request: NextRequest) {
  try {
    const { userId, commentId, username, tapestryCommentId } = await request.json()

    if (!userId || !commentId || !username || !tapestryCommentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1. Try to delete from Tapestry first using enhanced function
    try {
      await deleteTapestryLike({
        username,
        tapestryCommentId,
      })
    } catch (tapestryError: any) {
      console.warn('Tapestry like deletion failed, continuing with local deletion:', tapestryError.message)
    }

    // 2. Delete from our local Prisma database (always do this)
    await prisma.like.deleteMany({
      where: {
        userId,
        commentId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE Like Error]:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete like'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
