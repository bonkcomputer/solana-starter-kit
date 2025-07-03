import { prisma } from '@/lib/prisma'
import { getTapestryCommentsAndLikes } from '@/lib/tapestry'
import { NextRequest, NextResponse } from 'next/server'
import { inngest } from "@/api/inngest"

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

    // 1. Write to our local Prisma database immediately
    const newComment = await prisma.comment.create({
      data: {
        text,
        authorId,
        profileId,
      },
    });

    // 2. Send an event to Inngest for background sync
    await inngest.send({
        name: "comment/created",
        data: { 
            commentData: newComment,
            authorUsername,
            profileUsername,
        },
    });

    return NextResponse.json(newComment);
  } catch (error) {
    console.error('[POST Comment Error]:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create comment'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
