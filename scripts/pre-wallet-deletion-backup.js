#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

console.log('🛡️ Creating Pre-Wallet-Deletion Backup...\n');

async function createBackup() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '..', 'backups');
    
    // Create backups directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const backupFile = path.join(backupDir, `pre-wallet-deletion-backup-${timestamp}.json`);
    
    console.log('📊 Fetching current database state...');
    
    // Fetch all critical data
    const [users, comments, points, achievements, referrals] = await Promise.all([
      prisma.user.findMany({
        include: {
          comments: true,
          points: true,
          achievements: true,
          referrals: true
        }
      }),
      prisma.comment.findMany(),
      prisma.point.findMany(),
      prisma.achievement.findMany(),
      prisma.referral.findMany()
    ]);
    
    const backupData = {
      timestamp: new Date().toISOString(),
      purpose: 'Pre-wallet-deletion backup',
      counts: {
        users: users.length,
        comments: comments.length,
        points: points.length,
        achievements: achievements.length,
        referrals: referrals.length
      },
      data: {
        users,
        comments,
        points,
        achievements,
        referrals
      }
    };
    
    // Save backup
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    
    console.log('✅ Backup created successfully!');
    console.log('   File:', backupFile);
    console.log('   Size:', (fs.statSync(backupFile).size / 1024 / 1024).toFixed(2) + ' MB');
    console.log('\n📊 Backup Contents:');
    console.log('   Users:', backupData.counts.users);
    console.log('   Comments:', backupData.counts.comments);
    console.log('   Points:', backupData.counts.points);
    console.log('   Achievements:', backupData.counts.achievements);
    console.log('   Referrals:', backupData.counts.referrals);
    
    // Also create a CSV backup of users for easy reference
    const usersCsvFile = path.join(backupDir, `users-backup-${timestamp}.csv`);
    const csvHeader = 'id,privyDid,username,email,solanaWalletAddress,embeddedWalletAddress,createdAt,updatedAt\n';
    const csvData = users.map(user => 
      `"${user.id}","${user.privyDid}","${user.username}","${user.email || ''}","${user.solanaWalletAddress || ''}","${user.embeddedWalletAddress || ''}","${user.createdAt}","${user.updatedAt}"`
    ).join('\n');
    
    fs.writeFileSync(usersCsvFile, csvHeader + csvData);
    console.log('   CSV Users:', usersCsvFile);
    
    console.log('\n🛡️ Your data is safely backed up!');
    console.log('   You can now proceed with wallet deletion.');
    
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   • Ensure database is accessible');
    console.log('   • Check disk space');
    console.log('   • Verify Prisma configuration');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createBackup();
