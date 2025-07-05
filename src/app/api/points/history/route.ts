import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const skip = (page - 1) * limit

    const [transactions, totalCount] = await Promise.all([
      prisma.pointTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          points: true,
          actionType: true,
          description: true,
          createdAt: true,
          metadata: true
        }
      }),
      prisma.pointTransaction.count({
        where: { userId }
      })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      transactions: transactions.map(t => ({
        ...t,
        createdAt: t.createdAt.toISOString()
      })),
      totalPages,
      currentPage: page,
      totalCount
    })
  } catch (error) {
    console.error('Error fetching points history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch points history' },
      { status: 500 }
    )
  }
} 