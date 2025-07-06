const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function checkDatabaseStatus() {
  try {
    console.log('📊 Database Status Check');
    console.log('========================');
    
    // Check Users
    const userCount = await prisma.user.count();
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        privyDid: true,
        username: true,
        createdAt: true,
        solanaWalletAddress: true,
        totalPoints: true
      }
    });
    
    console.log(`👥 Users: ${userCount} total`);
    console.log('📅 Recent users:');
    recentUsers.forEach(user => {
      console.log(`   - ${user.username} (${user.privyDid.slice(0, 8)}...) - ${user.createdAt.toLocaleDateString()}`);
    });
    
    // Check Comments
    const commentCount = await prisma.comment.count();
    console.log(`💬 Comments: ${commentCount} total`);
    
    // Check Point Transactions
    const pointTransactionCount = await prisma.pointTransaction.count();
    const totalPointsAwarded = await prisma.pointTransaction.aggregate({
      _sum: { points: true }
    });
    console.log(`🎯 Point Transactions: ${pointTransactionCount} total`);
    console.log(`💰 Total Points Awarded: ${totalPointsAwarded._sum.points || 0}`);
    
    // Check Achievements
    const achievementCount = await prisma.achievement.count();
    const userAchievementCount = await prisma.userAchievement.count();
    console.log(`🏆 Achievements: ${achievementCount} defined, ${userAchievementCount} earned`);
    
    // Check Follows
    const followCount = await prisma.follow.count();
    console.log(`👥 Follows: ${followCount} total`);
    
    // Check Likes
    const likeCount = await prisma.like.count();
    console.log(`❤️  Likes: ${likeCount} total`);
    
    // Database health indicators
    console.log('\n🏥 Database Health:');
    
    // Check for users with empty usernames
    const usersWithEmptyUsernames = await prisma.user.count({
      where: { username: '' }
    });
    if (usersWithEmptyUsernames > 0) {
      console.log(`⚠️  ${usersWithEmptyUsernames} users with empty usernames`);
    } else {
      console.log('✅ All users have valid usernames');
    }
    
    // Check for duplicate usernames
    const duplicateUsernames = await prisma.user.groupBy({
      by: ['username'],
      _count: { username: true },
      having: { username: { _count: { gt: 1 } } }
    });
    if (duplicateUsernames.length > 0) {
      console.log(`⚠️  ${duplicateUsernames.length} duplicate usernames found`);
    } else {
      console.log('✅ All usernames are unique');
    }
    
    // Check for users with wallet addresses
    const usersWithWallets = await prisma.user.count({
      where: {
        OR: [
          { solanaWalletAddress: { not: null } },
          { embeddedWalletAddress: { not: null } }
        ]
      }
    });
    console.log(`💼 ${usersWithWallets}/${userCount} users have wallet addresses`);
    
    console.log('\n✅ Database status check completed!');
    
  } catch (error) {
    console.error('❌ Database status check failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the status check
if (require.main === module) {
  checkDatabaseStatus()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Status check failed:', error);
      process.exit(1);
    });
}

module.exports = { checkDatabaseStatus };
