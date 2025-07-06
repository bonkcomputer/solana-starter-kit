const { PrismaClient } = require('../src/generated/prisma');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backupDatabase() {
  try {
    console.log('🔄 Starting database backup...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '..', 'backups');
    
    // Create backups directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Backup Users
    const users = await prisma.user.findMany({
      include: {
        authoredComments: true,
        profileComments: true,
        followers: true,
        following: true,
        likes: true,
        pointTransactions: true,
        referrals: true,
        achievements: true
      }
    });
    
    const usersBackupPath = path.join(backupDir, `users-backup-${timestamp}.json`);
    fs.writeFileSync(usersBackupPath, JSON.stringify(users, null, 2));
    console.log(`✅ Users backed up to: ${usersBackupPath}`);
    
    // Backup Comments
    const comments = await prisma.comment.findMany({
      include: {
        author: true,
        profileOwner: true,
        likes: true
      }
    });
    
    const commentsBackupPath = path.join(backupDir, `comments-backup-${timestamp}.json`);
    fs.writeFileSync(commentsBackupPath, JSON.stringify(comments, null, 2));
    console.log(`✅ Comments backed up to: ${commentsBackupPath}`);
    
    // Backup Point Transactions
    const pointTransactions = await prisma.pointTransaction.findMany({
      include: {
        user: true
      }
    });
    
    const pointsBackupPath = path.join(backupDir, `points-backup-${timestamp}.json`);
    fs.writeFileSync(pointsBackupPath, JSON.stringify(pointTransactions, null, 2));
    console.log(`✅ Point transactions backed up to: ${pointsBackupPath}`);
    
    // Backup Achievements
    const achievements = await prisma.achievement.findMany();
    const userAchievements = await prisma.userAchievement.findMany({
      include: {
        user: true,
        achievement: true
      }
    });
    
    const achievementsBackupPath = path.join(backupDir, `achievements-backup-${timestamp}.json`);
    fs.writeFileSync(achievementsBackupPath, JSON.stringify({
      achievements,
      userAchievements
    }, null, 2));
    console.log(`✅ Achievements backed up to: ${achievementsBackupPath}`);
    
    // Create a summary file
    const summary = {
      timestamp,
      backupDate: new Date().toISOString(),
      counts: {
        users: users.length,
        comments: comments.length,
        pointTransactions: pointTransactions.length,
        achievements: achievements.length,
        userAchievements: userAchievements.length
      },
      files: [
        `users-backup-${timestamp}.json`,
        `comments-backup-${timestamp}.json`,
        `points-backup-${timestamp}.json`,
        `achievements-backup-${timestamp}.json`
      ]
    };
    
    const summaryPath = path.join(backupDir, `backup-summary-${timestamp}.json`);
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`📋 Backup summary created: ${summaryPath}`);
    
    console.log('\n🎉 Database backup completed successfully!');
    console.log(`📊 Backup Summary:`);
    console.log(`   Users: ${summary.counts.users}`);
    console.log(`   Comments: ${summary.counts.comments}`);
    console.log(`   Point Transactions: ${summary.counts.pointTransactions}`);
    console.log(`   Achievements: ${summary.counts.achievements}`);
    console.log(`   User Achievements: ${summary.counts.userAchievements}`);
    
  } catch (error) {
    console.error('💥 Backup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the backup
if (require.main === module) {
  backupDatabase()
    .then(() => {
      console.log('✅ Backup process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Backup process failed:', error);
      process.exit(1);
    });
}

module.exports = { backupDatabase };
