import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { inngest } from "@/api/inngest";

// POST handler for "liking" a comment
export async function POST(request: NextRequest) {
  try {
    const { userId, commentId, username, tapestryCommentId } = await request.json()

    if (!userId || !commentId || !username || !tapestryCommentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1. Write to our local Prisma database immediately
    const newLike = await prisma.like.create({
      data: {
        userId,   // The user's privyDid
        commentId, // The comment's CUID from our DB
      },
    })

    // 2. Send an event to Inngest for background sync
    await inngest.send({
        name: "comment/liked",
        data: { username, tapestryCommentId, likeId: newLike.id },
    });

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

    // 1. Delete from our local Prisma database immediately
    await prisma.like.deleteMany({
      where: {
        userId,
        commentId,
      },
    })

    // 2. Send an event to Inngest for background sync
    await inngest.send({
        name: "comment/unliked",
        data: { username, tapestryCommentId },
    });

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE Like Error]:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete like'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
