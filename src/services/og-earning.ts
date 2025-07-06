import { prisma } from '@/lib/prisma'

export interface OGEarningCriteria {
  minTradingVolume: number // $100k USD
  minAchievements: number // 5 achievements
  minPoints: number // 1000 points
}

export const OG_EARNING_THRESHOLDS: OGEarningCriteria = {
  minTradingVolume: 100000, // $100k USD
  minAchievements: 5,
  minPoints: 1000
}

/**
 * Check if a user qualifies for OG status based on their activity
 */
export async function checkAndGrantOGStatus(privyDid: string): Promise<{
  granted: boolean
  reason?: string
  previouslyOG: boolean
}> {
  try {
    // Get user data with achievements
    const user = await prisma.user.findUnique({
      where: { privyDid },
      include: {
        achievements: true
      }
    })

    if (!user) {
      return { granted: false, previouslyOG: false }
    }

    // If already OG, return early
    if (user.isOG) {
      return { granted: false, previouslyOG: true }
    }

    // Check trading volume criteria
    if (user.totalTradingVolume >= OG_EARNING_THRESHOLDS.minTradingVolume) {
      await prisma.user.update({
        where: { privyDid },
        data: {
          isOG: true,
          ogReason: 'High trading volume'
        }
      })
      console.log(`🎉 Granted OG status to ${user.username} for trading volume: $${user.totalTradingVolume.toLocaleString()}`)
      return { granted: true, reason: 'High trading volume', previouslyOG: false }
    }

    // Check achievements criteria
    if (user.achievements.length >= OG_EARNING_THRESHOLDS.minAchievements) {
      await prisma.user.update({
        where: { privyDid },
        data: {
          isOG: true,
          ogReason: 'Achievement master'
        }
      })
      console.log(`🎉 Granted OG status to ${user.username} for achievements: ${user.achievements.length}`)
      return { granted: true, reason: 'Achievement master', previouslyOG: false }
    }

    // Check points criteria
    if (user.totalPoints >= OG_EARNING_THRESHOLDS.minPoints) {
      await prisma.user.update({
        where: { privyDid },
        data: {
          isOG: true,
          ogReason: 'High contributor'
        }
      })
      console.log(`🎉 Granted OG status to ${user.username} for points: ${user.totalPoints}`)
      return { granted: true, reason: 'High contributor', previouslyOG: false }
    }

    return { granted: false, previouslyOG: false }

  } catch (error) {
    console.error('Error checking OG status:', error)
    return { granted: false, previouslyOG: false }
  }
}

/**
 * Update user's trading volume and check for OG eligibility
 */
export async function updateTradingVolumeAndCheckOG(
  privyDid: string, 
  tradeVolumeUSD: number
): Promise<{
  newTotalVolume: number
  ogGranted: boolean
  ogReason?: string
}> {
  try {
    // Update trading volume
    const updatedUser = await prisma.user.update({
      where: { privyDid },
      data: {
        totalTradingVolume: {
          increment: tradeVolumeUSD
        }
      }
    })

    // Check if they now qualify for OG
    const ogResult = await checkAndGrantOGStatus(privyDid)

    return {
      newTotalVolume: updatedUser.totalTradingVolume,
      ogGranted: ogResult.granted,
      ogReason: ogResult.reason
    }

  } catch (error) {
    console.error('Error updating trading volume:', error)
    throw error
  }
}

/**
 * Admin function to manually grant OG status
 */
export async function manuallyGrantOGStatus(
  privyDid: string,
  reason: string = 'Manual admin grant'
): Promise<boolean> {
  try {
    await prisma.user.update({
      where: { privyDid },
      data: {
        isOG: true,
        ogReason: reason
      }
    })
    
    const user = await prisma.user.findUnique({
      where: { privyDid },
      select: { username: true }
    })
    
    console.log(`👑 Manually granted OG status to ${user?.username} - Reason: ${reason}`)
    return true

  } catch (error) {
    console.error('Error manually granting OG status:', error)
    return false
  }
}

/**
 * Get OG earning progress for a user
 */
export async function getOGProgress(privyDid: string): Promise<{
  isOG: boolean
  progress: {
    tradingVolume: { current: number; required: number; percentage: number }
    achievements: { current: number; required: number; percentage: number }
    points: { current: number; required: number; percentage: number }
  }
} | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { privyDid },
      include: {
        achievements: true
      }
    })

    if (!user) return null

    const tradingProgress = Math.min(100, (user.totalTradingVolume / OG_EARNING_THRESHOLDS.minTradingVolume) * 100)
    const achievementProgress = Math.min(100, (user.achievements.length / OG_EARNING_THRESHOLDS.minAchievements) * 100)
    const pointsProgress = Math.min(100, (user.totalPoints / OG_EARNING_THRESHOLDS.minPoints) * 100)

    return {
      isOG: user.isOG,
      progress: {
        tradingVolume: {
          current: user.totalTradingVolume,
          required: OG_EARNING_THRESHOLDS.minTradingVolume,
          percentage: tradingProgress
        },
        achievements: {
          current: user.achievements.length,
          required: OG_EARNING_THRESHOLDS.minAchievements,
          percentage: achievementProgress
        },
        points: {
          current: user.totalPoints,
          required: OG_EARNING_THRESHOLDS.minPoints,
          percentage: pointsProgress
        }
      }
    }

  } catch (error) {
    console.error('Error getting OG progress:', error)
    return null
  }
} 