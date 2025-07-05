import { NextRequest, NextResponse } from 'next/server'
import { getLeaderboard } from '@/services/points'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const period = searchParams.get('period') as 'daily' | 'weekly' | 'monthly' | 'all' || 'all'
    const userId = searchParams.get('userId') || undefined

    // Validate period
    const validPeriods = ['daily', 'weekly', 'monthly', 'all']
    if (!validPeriods.includes(period)) {
      return NextResponse.json(
        { error: 'Invalid period. Must be one of: daily, weekly, monthly, all' },
        { status: 400 }
      )
    }

    const leaderboard = await getLeaderboard(limit, period, userId)

    return NextResponse.json(leaderboard)
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
} 