import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()

    if (!query) {
      return NextResponse.json({ error: 'A query is required' }, { status: 400 })
    }

    // Search the local Prisma database for users where the username contains the query string.
    // This is a case-insensitive search.
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: query,
          mode: 'insensitive',
        },
      },
      take: 50, // Limit the number of results
    })

    return NextResponse.json(users)
  } catch (error: any) {
    console.error('Error searching profiles:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to search profiles' },
      { status: 500 },
    )
  }
}
