import { PrismaClient } from '@/generated/prisma'
import { PointActionType, POINT_VALUES } from '../models/points.models'

const prisma = new PrismaClient()



async function calculateRetroactivePoints() {
  console.log('🔄 Starting retroactive points calculation...\n')
  
  try {
    // First, initialize achievements if they don't exist
    const achievementCount = await prisma.achievement.count()
    if (achievementCount === 0) {
      console.log('📋 No achievements found, initializing defaults...')
      const { initializeAchievements } = await import('./init-achievements')
      await initializeAchievements()
    }

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        privyDid: true,
        username: true,
        createdAt: true,
        totalPoints: true,
        referralCode: true,
        referredBy: true,
        _count: {
          select: {
            authoredComments: true,
            likes: true,
            followers: true,
            referrals: true
          }
        }
      }
    })

    console.log(`👥 Found ${users.length} users to process\n`)

    let totalPointsAwarded = 0
    let usersProcessed = 0

    for (const user of users) {
      console.log(`\n🔍 Processing user: ${user.username} (${user.privyDid})`)
      
      // Skip if user already has points (already processed)
      if (user.totalPoints > 0) {
        console.log(`   ⏭️  User already has ${user.totalPoints} points, skipping`)
        continue
      }

      let userPointsAwarded = 0
      const transactions: Array<{
        userId: string
        actionType: PointActionType
        points: number
        description: string
      }> = []

      // 1. Profile Creation Points
      transactions.push({
        userId: user.privyDid,
        actionType: PointActionType.PROFILE_CREATION,
        points: POINT_VALUES.PROFILE_CREATION.points,
        description: 'Profile created'
      })
      userPointsAwarded += POINT_VALUES.PROFILE_CREATION.points
      console.log(`   ✅ Profile creation: +${POINT_VALUES.PROFILE_CREATION.points} points`)

      // 2. Comment Points
      const commentPoints = user._count.authoredComments * POINT_VALUES.COMMENT_CREATED.points
      if (user._count.authoredComments > 0) {
        transactions.push({
          userId: user.privyDid,
          actionType: PointActionType.COMMENT_CREATED,
          points: commentPoints,
          description: `${user._count.authoredComments} comments posted`
        })
        userPointsAwarded += commentPoints
        console.log(`   💬 Comments (${user._count.authoredComments}): +${commentPoints} points`)
      }

      // 3. Like Points
      const likePoints = user._count.likes * POINT_VALUES.LIKE_GIVEN.points
      if (user._count.likes > 0) {
        transactions.push({
          userId: user.privyDid,
          actionType: PointActionType.LIKE_GIVEN,
          points: likePoints,
          description: `${user._count.likes} likes given`
        })
        userPointsAwarded += likePoints
        console.log(`   ❤️  Likes (${user._count.likes}): +${likePoints} points`)
      }

      // 4. Follow Points
      const followPoints = user._count.followers * POINT_VALUES.FOLLOW_USER.points
      if (user._count.followers > 0) {
        transactions.push({
          userId: user.privyDid,
          actionType: PointActionType.FOLLOW_USER,
          points: followPoints,
          description: `${user._count.followers} users followed`
        })
        userPointsAwarded += followPoints
        console.log(`   👥 Follows (${user._count.followers}): +${followPoints} points`)
      }

      // 5. Referral Points (for referrer)
      const referralPoints = user._count.referrals * POINT_VALUES.REFERRAL_BONUS.points
      if (user._count.referrals > 0) {
        transactions.push({
          userId: user.privyDid,
          actionType: PointActionType.REFERRAL_BONUS,
          points: referralPoints,
          description: `${user._count.referrals} users referred`
        })
        userPointsAwarded += referralPoints
        console.log(`   🎯 Referrals (${user._count.referrals}): +${referralPoints} points`)
      }

      // 6. Referral Bonus (for referee)
      if (user.referredBy) {
        const refereePoints = POINT_VALUES.REFERRAL_BONUS.points / 2 // 250 points for being referred
        transactions.push({
          userId: user.privyDid,
          actionType: PointActionType.REFERRAL_BONUS,
          points: refereePoints,
          description: 'Joined via referral'
        })
        userPointsAwarded += refereePoints
        console.log(`   🎁 Referee bonus: +${refereePoints} points`)
      }

      // 7. Daily Login Points (estimate based on account age)
      const accountAgeInDays = Math.floor(
        (new Date().getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      )
      // Assume user logged in roughly 30% of days (conservative estimate)
      const estimatedLoginDays = Math.max(1, Math.floor(accountAgeInDays * 0.3))
      const loginPoints = estimatedLoginDays * POINT_VALUES.DAILY_LOGIN.points
      
      if (estimatedLoginDays > 0) {
        transactions.push({
          userId: user.privyDid,
          actionType: PointActionType.DAILY_LOGIN,
          points: loginPoints,
          description: `Estimated ${estimatedLoginDays} login days`
        })
        userPointsAwarded += loginPoints
        console.log(`   📅 Login days (${estimatedLoginDays}): +${loginPoints} points`)
      }

      // Create all transactions and update user
      if (transactions.length > 0) {
        await prisma.$transaction(async (tx) => {
          // Create point transactions
          await tx.pointTransaction.createMany({
            data: transactions.map(t => ({
              userId: t.userId,
              actionType: t.actionType,
              points: t.points,
              description: t.description,
              createdAt: user.createdAt // Use user's creation date for historical accuracy
            }))
          })

          // Update user total points
          await tx.user.update({
            where: { privyDid: user.privyDid },
            data: {
              totalPoints: userPointsAwarded,
              currentStreak: estimatedLoginDays > 0 ? Math.min(estimatedLoginDays, 7) : 0,
              longestStreak: estimatedLoginDays > 0 ? Math.min(estimatedLoginDays, 30) : 0,
              lastLoginDate: new Date()
            }
          })
        })

        totalPointsAwarded += userPointsAwarded
        usersProcessed++
        console.log(`   🎉 Total points awarded: ${userPointsAwarded}`)
      }
    }

    console.log('\n📊 RETROACTIVE POINTS SUMMARY')
    console.log('================================')
    console.log(`👥 Users processed: ${usersProcessed}`)
    console.log(`🎯 Total points awarded: ${totalPointsAwarded.toLocaleString()}`)
    console.log(`📈 Average points per user: ${Math.round(totalPointsAwarded / usersProcessed)}`)

    // Show top users by points
    console.log('\n🏆 TOP USERS BY POINTS:')
    const topUsers = await prisma.user.findMany({
      select: {
        username: true,
        totalPoints: true
      },
      orderBy: {
        totalPoints: 'desc'
      },
      take: 10
    })

    topUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username}: ${user.totalPoints.toLocaleString()} points`)
    })

    // Check for achievements
    console.log('\n🏅 Checking for achievements...')
    const { awardPoints } = await import('../services/points')
    
    // This will trigger achievement checking for all users
    for (const user of users.slice(0, 5)) { // Check first 5 users as example
      try {
        await awardPoints(user.privyDid, PointActionType.DAILY_LOGIN, undefined, true) // Skip points, just check achievements
        console.log(`   ✅ Checked achievements for ${user.username}`)
      } catch (error) {
        console.log(`   ⚠️  Error checking achievements for ${user.username}:`, error)
      }
    }

    console.log('\n✅ Retroactive points calculation completed successfully!')

  } catch (error) {
    console.error('❌ Error calculating retroactive points:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script if called directly
if (require.main === module) {
  calculateRetroactivePoints()
}

export { calculateRetroactivePoints } 