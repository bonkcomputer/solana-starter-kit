import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { initializeAchievements } from '@/services/points'

// GET - Get user achievements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const action = searchParams.get('action')

    if (action === 'init') {
      // Initialize default achievements
      await initializeAchievements()
      return NextResponse.json({ message: 'Achievements initialized' })
    }

    if (action === 'all') {
      // Get all available achievements
      const achievements = await prisma.achievement.findMany({
        orderBy: [
          { category: 'asc' },
          { pointsReward: 'asc' }
        ]
      })

      return NextResponse.json(
        achievements.map(a => ({
          ...a,
          createdAt: a.createdAt.toISOString()
        }))
      )
    }

    // Get user's achievements
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true
      },
      orderBy: { unlockedAt: 'desc' }
    })

    return NextResponse.json(
      userAchievements.map(ua => ({
        id: ua.id,
        userId: ua.userId,
        achievementId: ua.achievementId,
        unlockedAt: ua.unlockedAt.toISOString(),
        achievement: {
          ...ua.achievement,
          createdAt: ua.achievement.createdAt.toISOString()
        }
      }))
    )
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    )
  }
} 