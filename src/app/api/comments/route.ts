import { prisma } from '@/lib/prisma'
import { createTapestryComment } from '@/lib/tapestry'
import { NextRequest, NextResponse } from 'next/server'

// GET handler for fetching comments for a specific profile
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const profileId = searchParams.get('profileId')

  if (!profileId) {
    return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 })
  }

  try {
    const comments = await prisma.comment.findMany({
      where: { profileId },
      include: {
        author: {
          select: {
            username: true,
            image: true,
          },
        },
        likes: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('[GET Comments Error]:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch comments'
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

    let tapestryId = null

    // 1. Try to write to Tapestry first using enhanced function
    try {
      const tapestryComment = await createTapestryComment({
        authorUsername,
        targetUsername: profileUsername,
        text,
      })

      // The Tapestry SDK's response structure might be different.
      // Assuming the created comment object is available at `tapestryComment.comment`
      tapestryId = (tapestryComment as any)?.comment?.id;
      if (!tapestryId) {
        console.warn('Could not get comment ID from Tapestry response, continuing with local creation');
      }
    } catch (tapestryError: any) {
      console.warn('Tapestry comment creation failed, continuing with local creation:', tapestryError.message)
    }

    // 2. Write to our local Prisma database (always do this)
    const newComment = await prisma.comment.create({
      data: {
        text,
        authorId, // The author's privyDid
        profileId, // The privyDid of the profile being commented on
        tapestryCommentId: tapestryId, // Will be null if Tapestry failed
      },
    })

    return NextResponse.json(newComment)
  } catch (error) {
    console.error('[POST Comment Error]:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create comment'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
