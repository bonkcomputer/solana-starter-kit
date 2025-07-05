import { prisma } from '@/lib/prisma'
import { 
  PointActionType, 
  POINT_VALUES, 
  STREAK_MULTIPLIERS, 
  DEFAULT_ACHIEVEMENTS,
  IAwardPointsResponse,
  IAchievement,
  IUserPoints,
  IPointsLeaderboard,
  IReferralStats
} from '@/models/points.models'

/**
 * Awards points to a user for a specific action
 */
export async function awardPoints(
  userId: string, 
  actionType: PointActionType, 
  metadata?: any,
  skipPoints?: boolean
): Promise<IAwardPointsResponse> {
  try {
    const actionConfig = POINT_VALUES[actionType]
    
    // If skipPoints is true, only check achievements
    if (skipPoints) {
      const achievementsUnlocked = await checkAchievements(userId)
      return {
        success: true,
        pointsAwarded: 0,
        newTotal: 0,
        achievementsUnlocked
      }
    }
    
    // Check daily limits
    if (actionConfig.dailyLimit) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const dailyCount = await prisma.pointTransaction.count({
        where: {
          userId,
          actionType,
          createdAt: {
            gte: today
          }
        }
      })
      
      if (dailyCount >= actionConfig.dailyLimit) {
        return {
          success: false,
          pointsAwarded: 0,
          newTotal: 0
        }
      }
    }
    
    // Get current user data
    const user = await prisma.user.findUnique({
      where: { privyDid: userId },
      include: {
        pointTransactions: true
      }
    })
    
    if (!user) {
      throw new Error('User not found')
    }
    
    let pointsToAward = actionConfig.points
    let streakInfo: { currentStreak: number; streakBonus?: number } | undefined
    
    // Handle daily login and streak bonuses
    if (actionType === PointActionType.DAILY_LOGIN) {
      const { newStreak, streakBonus } = await calculateStreak(userId)
      
      if (streakBonus > 0) {
        // Award streak bonus separately
        await prisma.pointTransaction.create({
          data: {
            userId,
            points: streakBonus,
            actionType: PointActionType.STREAK_BONUS,
            description: `${newStreak} day streak bonus!`,
            metadata: { streak: newStreak, multiplier: getStreakMultiplier(newStreak) }
          }
        })
        pointsToAward += streakBonus
      }
      
      streakInfo = { currentStreak: newStreak, streakBonus }
    }
    
    // Create point transaction
    await prisma.pointTransaction.create({
      data: {
        userId,
        points: pointsToAward - (streakInfo?.streakBonus || 0), // Base points only
        actionType,
        description: actionConfig.description,
        metadata
      }
    })
    
    // Update user total points
    const newTotal = user.totalPoints + pointsToAward
    await prisma.user.update({
      where: { privyDid: userId },
      data: { totalPoints: newTotal }
    })
    
    // Check for new achievements
    const achievementsUnlocked = await checkAchievements(userId)
    
    // Award achievement points if any were unlocked
    let achievementPoints = 0
    if (achievementsUnlocked.length > 0) {
      for (const achievement of achievementsUnlocked) {
        await prisma.pointTransaction.create({
          data: {
            userId,
            points: achievement.pointsReward,
            actionType: PointActionType.ACHIEVEMENT_UNLOCKED,
            description: `Achievement: ${achievement.name}`,
            metadata: { achievementId: achievement.id }
          }
        })
        achievementPoints += achievement.pointsReward
      }
      
      // Update total with achievement points
      await prisma.user.update({
        where: { privyDid: userId },
        data: { totalPoints: newTotal + achievementPoints }
      })
    }
    
    return {
      success: true,
      pointsAwarded: pointsToAward + achievementPoints,
      newTotal: newTotal + achievementPoints,
      achievementsUnlocked,
      streakInfo
    }
  } catch (error) {
    console.error('Error awarding points:', error)
    throw error
  }
}

/**
 * Calculates and updates user streak
 */
async function calculateStreak(userId: string): Promise<{ newStreak: number; streakBonus: number }> {
  const user = await prisma.user.findUnique({
    where: { privyDid: userId }
  })
  
  if (!user) throw new Error('User not found')
  
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  let newStreak = 1
  let streakBonus = 0
  
  if (user.lastLoginDate) {
    const lastLogin = new Date(user.lastLoginDate)
    lastLogin.setHours(0, 0, 0, 0)
    yesterday.setHours(0, 0, 0, 0)
    
    if (lastLogin.getTime() === yesterday.getTime()) {
      // Consecutive day
      newStreak = user.currentStreak + 1
    } else if (lastLogin.getTime() < yesterday.getTime()) {
      // Streak broken
      newStreak = 1
    } else {
      // Already logged in today
      newStreak = user.currentStreak
    }
  }
  
  // Calculate streak bonus
  const multiplier = getStreakMultiplier(newStreak)
  if (multiplier > 1) {
    streakBonus = Math.floor(POINT_VALUES[PointActionType.STREAK_BONUS].points * (multiplier - 1))
  }
  
  // Update user streak data
  await prisma.user.update({
    where: { privyDid: userId },
    data: {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, user.longestStreak),
      lastLoginDate: today
    }
  })
  
  return { newStreak, streakBonus }
}

/**
 * Gets streak multiplier based on streak length
 */
function getStreakMultiplier(streak: number): number {
  const thresholds = Object.keys(STREAK_MULTIPLIERS)
    .map(Number)
    .sort((a, b) => b - a) // Sort descending
  
  for (const threshold of thresholds) {
    if (streak >= threshold) {
      return STREAK_MULTIPLIERS[threshold as keyof typeof STREAK_MULTIPLIERS]
    }
  }
  
  return 1
}

/**
 * Checks and awards new achievements for a user
 */
async function checkAchievements(userId: string): Promise<IAchievement[]> {
  const user = await prisma.user.findUnique({
    where: { privyDid: userId },
    include: {
      pointTransactions: true,
      achievements: {
        include: {
          achievement: true
        }
      },
      referrals: true
    }
  })
  
  if (!user) return []
  
  // Get all available achievements
  const allAchievements = await prisma.achievement.findMany()
  
  // Get user's current achievements
  const userAchievementIds = user.achievements.map(ua => ua.achievementId)
  
  const newAchievements: IAchievement[] = []
  
  for (const achievement of allAchievements) {
    // Skip if user already has this achievement
    if (userAchievementIds.includes(achievement.id)) continue
    
    const requirement = achievement.requirement as any
    let qualified = false
    
    // Check different types of requirements
    if (requirement.action) {
      // Action-based achievement
      const actionCount = user.pointTransactions.filter(
        t => t.actionType === requirement.action
      ).length
      qualified = actionCount >= requirement.count
      
    } else if (requirement.streak) {
      // Streak-based achievement
      qualified = user.currentStreak >= requirement.streak
      
    } else if (requirement.referrals) {
      // Referral-based achievement
      qualified = user.referrals.length >= requirement.referrals
      
    } else if (requirement.totalPoints) {
      // Total points achievement
      qualified = user.totalPoints >= requirement.totalPoints
    }
    
    if (qualified) {
      // Award achievement
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id
        }
      })
      
      newAchievements.push({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        pointsReward: achievement.pointsReward,
        category: achievement.category,
        requirement: achievement.requirement,
        createdAt: achievement.createdAt.toISOString()
      })
    }
  }
  
  return newAchievements
}

/**
 * Gets user points information
 */
export async function getUserPoints(userId: string): Promise<IUserPoints | null> {
  const user = await prisma.user.findUnique({
    where: { privyDid: userId }
  })
  
  if (!user) return null
  
  // Get today's points
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const todayPoints = await prisma.pointTransaction.aggregate({
    where: {
      userId,
      createdAt: {
        gte: today
      }
    },
    _sum: {
      points: true
    }
  })
  
  // Get user rank
  const rank = await getUserRank(userId)
  
  return {
    totalPoints: user.totalPoints,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    lastLoginDate: user.lastLoginDate?.toISOString(),
    referralCode: user.referralCode,
    referredBy: user.referredBy || undefined,
    rank,
    todayPoints: todayPoints._sum.points || 0
  }
}

/**
 * Gets user's rank on the leaderboard
 */
async function getUserRank(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { privyDid: userId }
  })
  
  if (!user) return 0
  
  const usersWithHigherPoints = await prisma.user.count({
    where: {
      totalPoints: {
        gt: user.totalPoints
      }
    }
  })
  
  return usersWithHigherPoints + 1
}

/**
 * Gets the points leaderboard
 */
export async function getLeaderboard(
  limit: number = 50,
  period: 'daily' | 'weekly' | 'monthly' | 'all' = 'all',
  userId?: string
): Promise<IPointsLeaderboard> {
  
  if (period !== 'all') {
    const now = new Date()
    const startDate = new Date()
    
    switch (period) {
      case 'daily':
        startDate.setHours(0, 0, 0, 0)
        break
      case 'weekly':
        startDate.setDate(now.getDate() - 7)
        break
      case 'monthly':
        startDate.setMonth(now.getMonth() - 1)
        break
    }
    
    // For period-based leaderboards, we need to calculate points in that period
    // This is complex, so for now we'll use total points
    // TODO: Implement period-specific point calculations
  }
  
  const users = await prisma.user.findMany({
    where: {
      totalPoints: {
        gt: 0
      }
    },
    orderBy: {
      totalPoints: 'desc'
    },
    take: limit,
    select: {
      privyDid: true,
      username: true,
      image: true,
      totalPoints: true
    }
  })
  
  const leaderboardUsers = users.map((user, index) => ({
    ...user,
    image: user.image || undefined,
    rank: index + 1,
    pointsThisPeriod: user.totalPoints // TODO: Calculate period-specific points
  }))
  
  const totalUsers = await prisma.user.count({
    where: {
      totalPoints: {
        gt: 0
      }
    }
  })
  
  let userRank: number | undefined
  if (userId) {
    userRank = await getUserRank(userId)
  }
  
  return {
    users: leaderboardUsers,
    userRank,
    totalUsers
  }
}

/**
 * Processes a referral signup
 */
export async function processReferral(referralCode: string, newUserId: string): Promise<boolean> {
  try {
    // Find referrer
    const referrer = await prisma.user.findUnique({
      where: { referralCode }
    })
    
    if (!referrer) return false
    
    // Update new user with referrer
    await prisma.user.update({
      where: { privyDid: newUserId },
      data: { referredBy: referrer.privyDid }
    })
    
    // Award points to both users
    await awardPoints(referrer.privyDid, PointActionType.REFERRAL_BONUS, {
      referredUserId: newUserId,
      type: 'referrer'
    })
    
    await awardPoints(newUserId, PointActionType.REFERRAL_BONUS, {
      referrerId: referrer.privyDid,
      type: 'referee',
      points: 250 // Referee gets fewer points
    })
    
    return true
  } catch (error) {
    console.error('Error processing referral:', error)
    return false
  }
}

/**
 * Gets referral statistics for a user
 */
export async function getReferralStats(userId: string): Promise<IReferralStats | null> {
  const user = await prisma.user.findUnique({
    where: { privyDid: userId },
    include: {
      referrals: {
        select: {
          privyDid: true,
          username: true,
          image: true,
          createdAt: true
        }
      }
    }
  })
  
  if (!user) return null
  
  // Calculate total referral points earned
  const referralPoints = await prisma.pointTransaction.aggregate({
    where: {
      userId,
      actionType: PointActionType.REFERRAL_BONUS
    },
    _sum: {
      points: true
    }
  })
  
  return {
    totalReferrals: user.referrals.length,
    totalReferralPoints: referralPoints._sum.points || 0,
    referrals: user.referrals.map(referral => ({
      privyDid: referral.privyDid,
      username: referral.username,
      image: referral.image || undefined,
      signupDate: referral.createdAt.toISOString(),
      pointsEarned: 500 // TODO: Calculate actual points earned from this referral
    })),
    referralCode: user.referralCode
  }
}

/**
 * Checks if a referral code is valid
 */
export async function checkReferralCode(referralCode: string): Promise<{ valid: boolean; referrer?: { username: string; image?: string } }> {
  const referrer = await prisma.user.findUnique({
    where: { referralCode },
    select: {
      username: true,
      image: true
    }
  })
  
  return {
    valid: !!referrer,
    referrer: referrer ? {
      username: referrer.username,
      image: referrer.image || undefined
    } : undefined
  }
}

/**
 * Initialize default achievements in the database
 */
export async function initializeAchievements(): Promise<void> {
  for (const achievement of DEFAULT_ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: achievement,
      create: achievement
    })
  }
} 