import { NextResponse } from 'next/server'
import { initializeAchievements } from '@/services/points'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // Initialize default achievements
    await initializeAchievements()
    
    // Get count of achievements
    const achievementCount = await prisma.achievement.count()
    
    return NextResponse.json({
      message: 'Points system initialized successfully',
      achievementsCreated: achievementCount
    })
  } catch (error) {
    console.error('Error initializing points system:', error)
    return NextResponse.json(
      { error: 'Failed to initialize points system' },
      { status: 500 }
    )
  }
} 