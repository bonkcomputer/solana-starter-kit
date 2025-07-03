import { prisma } from '@/lib/prisma'
import { createTapestryComment, getTapestryCommentsAndLikes } from '@/lib/tapestry'
import { NextRequest, NextResponse } from 'next/server'

// GET handler for fetching comments for a specific profile
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const profileUsername = searchParams.get('profileUsername') // Switched to username for Tapestry
  const profileId = searchParams.get('profileId') // Kept for author mapping

  if (!profileUsername || !profileId) {
    return NextResponse.json({ error: 'Profile username and ID are required' }, { status: 400 })
  }

  try {
    // 1. Fetch comments from Tapestry as the source of truth
    const tapestryComments = await getTapestryCommentsAndLikes({ targetUsername: profileUsername });

    // 2. Sync Tapestry comments with the local Prisma database
    if (tapestryComments && tapestryComments.length > 0) {
        const authorUsernames = tapestryComments.map((c: any) => c.author?.username).filter(Boolean);
        const authors = await prisma.user.findMany({
            where: { username: { in: authorUsernames } },
            select: { privyDid: true, username: true }
        });
        const authorMap = new Map(authors.map(a => [a.username, a.privyDid]));

        for (const tapComment of tapestryComments) {
            if (!tapComment.author?.username) continue; // Safety check for author
            const authorDid = authorMap.get(tapComment.author.username);
            if (!authorDid) continue; // Skip if we can't map author

            await prisma.comment.upsert({
                where: { tapestryCommentId: tapComment.comment.id },
                update: {
                    text: tapComment.comment.text,
                 }, // No fields to update, just ensure it exists
                create: {
                    tapestryCommentId: tapComment.comment.id,
                    text: tapComment.comment.text,
                    authorId: authorDid,
                    profileId: profileId, // The privyDid of the profile being commented on
                },
            });
            // The batch comment fetching from Tapestry does not include likes.
            // Likes will be handled via their own API route and synced on write.
        }
    }

    // 3. Fetch the fully hydrated comments from Prisma
    const comments = await prisma.comment.findMany({
      where: { profileId },
      include: {
        author: {
          select: {
            username: true,
            image: true,
          },
        },
        likes: {
            include: {
                user: {
                    select: {
                        username: true,
                    }
                }
            }
        }
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
