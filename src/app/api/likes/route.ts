import { prisma } from '@/lib/prisma'
import { socialfi } from '@/utils/socialfi'
import { NextRequest, NextResponse } from 'next/server'

// POST handler for "liking" a comment
export async function POST(request: NextRequest) {
  try {
    const { userId, commentId, username, tapestryCommentId } = await request.json()

    if (!userId || !commentId || !username || !tapestryCommentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1. Write to Tapestry first
    await socialfi.likes.likesCreate(
      {
        apiKey: process.env.TAPESTRY_API_KEY || '',
        nodeId: tapestryCommentId, // Tapestry needs its own internal ID for the comment
      },
      { startId: username },
    )

    // 2. Write to our local Prisma database
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
    
    // 1. Delete from Tapestry first
    await socialfi.likes.likesDelete(
      {
        apiKey: process.env.TAPESTRY_API_KEY || '',
        nodeId: tapestryCommentId,
      },
      { startId: username },
    )

    // 2. Delete from our local Prisma database
    await prisma.like.delete({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE Like Error]:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to unlike'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
