import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

async function checkDatabase() {
  console.log('🔍 Checking database contents...\n')
  
  try {
    // Check users
    const userCount = await prisma.user.count()
    console.log(`👥 Users: ${userCount}`)
    
    if (userCount > 0) {
      const users = await prisma.user.findMany({
        select: {
          privyDid: true,
          username: true,
          totalPoints: true,
          createdAt: true,
          _count: {
            select: {
              authoredComments: true,
              likes: true,
              followers: true,
              referrals: true
            }
          }
        },
        take: 5
      })
      
      console.log('\n📋 Sample users:')
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.username} (${user.privyDid})`)
        console.log(`   Points: ${user.totalPoints}`)
        console.log(`   Created: ${user.createdAt.toISOString()}`)
        console.log(`   Comments: ${user._count.authoredComments}`)
        console.log(`   Likes: ${user._count.likes}`)
        console.log(`   Followers: ${user._count.followers}`)
        console.log(`   Referrals: ${user._count.referrals}`)
        console.log('')
      })
    }
    
    // Check achievements
    const achievementCount = await prisma.achievement.count()
    console.log(`🏅 Achievements: ${achievementCount}`)
    
    // Check point transactions
    const transactionCount = await prisma.pointTransaction.count()
    console.log(`💰 Point transactions: ${transactionCount}`)
    
    // Check comments
    const commentCount = await prisma.comment.count()
    console.log(`💬 Comments: ${commentCount}`)
    
    // Check likes
    const likeCount = await prisma.like.count()
    console.log(`❤️  Likes: ${likeCount}`)
    
    // Check follows
    const followCount = await prisma.follow.count()
    console.log(`👥 Follows: ${followCount}`)
    
    console.log('\n✅ Database check completed!')
    
  } catch (error) {
    console.error('❌ Error checking database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script if called directly
if (require.main === module) {
  checkDatabase()
}

export { checkDatabase } 