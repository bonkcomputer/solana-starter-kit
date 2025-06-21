import { prisma } from '@/lib/prisma'
import { socialfi } from '@/utils/socialfi'
import { NextRequest, NextResponse } from 'next/server'

// GET handler for fetching comments
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  // We'll fetch comments based on the profile's privyDid
  const profileId = searchParams.get('profileId')

  if (!profileId) {
    return NextResponse.json({ error: 'profileId is required' }, { status: 400 })
  }

  try {
    // Fetch comments from the local Prisma database, including author and like information
    const comments = await prisma.comment.findMany({
      where: { profileId },
      include: {
        author: {
          select: {
            username: true,
            image: true,
          },
        },
        likes: true, // Include likes for each comment
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('[GET Comments Error]:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// POST handler for creating a new comment
export async function POST(request: NextRequest) {
  try {
    const { authorId, profileId, text, authorUsername, profileUsername } = await request.json()

    if (!authorId || !profileId || !text || !authorUsername || !profileUsername) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1. Write to Tapestry first
    const tapestryComment = await socialfi.comments.commentsCreate(
      { apiKey: process.env.TAPESTRY_API_KEY || '' },
      {
        profileId: authorUsername, // Tapestry uses usernames
        targetProfileId: profileUsername,
        text,
      },
    )

    // The Tapestry SDK's response structure might be different.
    // Assuming the created comment object is available at `tapestryComment.comment`
    const tapestryId = (tapestryComment as any)?.comment?.id;
    if (!tapestryId) {
        // Or handle this more gracefully, maybe by not creating the local comment
        // if the Tapestry one fails in a way that doesn't throw an error.
        throw new Error('Could not get comment ID from Tapestry response.');
    }

    // 2. Write to our local Prisma database
    const newComment = await prisma.comment.create({
      data: {
        text,
        authorId, // The author's privyDid
        profileId, // The privyDid of the profile being commented on
        tapestryCommentId: tapestryId,
      },
    })

    return NextResponse.json(newComment)
  } catch (error) {
    console.error('[POST Comment Error]:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create comment'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
