const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function checkDatabaseState() {
  try {
    console.log('🔍 Checking current database state...\n');
    
    // Get total user count
    const totalUsers = await prisma.user.count();
    console.log(`📊 Total Users: ${totalUsers}\n`);
    
    // Get all users with their key information
    const users = await prisma.user.findMany({
      select: {
        privyDid: true,
        username: true,
        bio: true,
        solanaWalletAddress: true,
        embeddedWalletAddress: true,
        lastUsernameChange: true,
        createdAt: true,
        isOG: true,
        ogReason: true,
        totalPoints: true,
        totalTradingVolume: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('👥 All Users in Database:');
    console.log('=' .repeat(80));
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username}`);
      console.log(`   PrivyDid: ${user.privyDid}`);
      console.log(`   Created: ${user.createdAt.toISOString()}`);
      console.log(`   Solana Wallet: ${user.solanaWalletAddress || 'N/A'}`);
      console.log(`   Embedded Wallet: ${user.embeddedWalletAddress || 'N/A'}`);
      console.log(`   Bio: ${user.bio ? (user.bio.length > 60 ? user.bio.substring(0, 60) + '...' : user.bio) : 'N/A'}`);
      console.log(`   Last Username Change: ${user.lastUsernameChange || 'Never'}`);
      console.log(`   OG Status: ${user.isOG ? '✅ OG' : '❌ Not OG'} ${user.ogReason ? `(${user.ogReason})` : ''}`);
      console.log(`   Points: ${user.totalPoints || 0}`);
      console.log(`   Trading Volume: $${user.totalTradingVolume || 0}`);
      console.log('   ' + '-'.repeat(75));
    });

    // Check for users with recent username changes
    console.log('\n🕒 Recent Username Changes:');
    const recentChanges = users.filter(user => user.lastUsernameChange);
    if (recentChanges.length > 0) {
      recentChanges.forEach(user => {
        const daysAgo = Math.floor((Date.now() - new Date(user.lastUsernameChange).getTime()) / (1000 * 60 * 60 * 24));
        console.log(`   ${user.username}: ${daysAgo} days ago`);
      });
    } else {
      console.log('   No recent username changes found');
    }

    // Check for users with bios
    console.log('\n📝 Users with Bios:');
    const usersWithBios = users.filter(user => user.bio);
    console.log(`   ${usersWithBios.length} out of ${totalUsers} users have bios`);
    
    // Check for OG users
    console.log('\n👑 OG Users:');
    const ogUsers = users.filter(user => user.isOG);
    console.log(`   ${ogUsers.length} out of ${totalUsers} users are OG`);
    if (ogUsers.length > 0) {
      const ogReasons = {};
      ogUsers.forEach(user => {
        if (user.ogReason) {
          ogReasons[user.ogReason] = (ogReasons[user.ogReason] || 0) + 1;
        }
      });
      console.log('   OG Reasons breakdown:');
      Object.entries(ogReasons).forEach(([reason, count]) => {
        console.log(`     ${reason}: ${count} users`);
      });
    }

    // Check for users with wallet addresses
    console.log('\n💼 Wallet Address Statistics:');
    const usersWithSolana = users.filter(user => user.solanaWalletAddress);
    const usersWithEmbedded = users.filter(user => user.embeddedWalletAddress);
    console.log(`   Solana Wallets: ${usersWithSolana.length}/${totalUsers}`);
    console.log(`   Embedded Wallets: ${usersWithEmbedded.length}/${totalUsers}`);

    // Check for duplicate usernames (should be 0)
    console.log('\n🔍 Data Integrity Checks:');
    const usernames = users.map(u => u.username);
    const duplicateUsernames = usernames.filter((username, index) => usernames.indexOf(username) !== index);
    console.log(`   Duplicate usernames: ${duplicateUsernames.length} ${duplicateUsernames.length > 0 ? `(${duplicateUsernames.join(', ')})` : ''}`);

    // Check for duplicate privyDids (should be 0)
    const privyDids = users.map(u => u.privyDid);
    const duplicatePrivyDids = privyDids.filter((privyDid, index) => privyDids.indexOf(privyDid) !== index);
    console.log(`   Duplicate privyDids: ${duplicatePrivyDids.length} ${duplicatePrivyDids.length > 0 ? `(${duplicatePrivyDids.join(', ')})` : ''}`);

    // Check for users without wallet addresses
    const usersWithoutWallets = users.filter(user => !user.solanaWalletAddress && !user.embeddedWalletAddress);
    console.log(`   Users without any wallet: ${usersWithoutWallets.length}`);

    console.log('\n✅ Database state check completed!');
    
  } catch (error) {
    console.error('❌ Error checking database state:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseState(); 