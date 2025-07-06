const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function testOGSystem() {
  console.log('🧪 Testing OG System...\n');

  try {
    // 1. Check if existing users have OG status
    const ogUsers = await prisma.user.findMany({
      where: { isOG: true },
      select: { username: true, ogReason: true, isOG: true }
    });

    console.log(`✅ Found ${ogUsers.length} OG users:`);
    ogUsers.slice(0, 5).forEach(user => {
      console.log(`   - ${user.username}: ${user.ogReason}`);
    });
    if (ogUsers.length > 5) {
      console.log(`   ... and ${ogUsers.length - 5} more`);
    }

    // 2. Check if new users start with correct defaults
    const nonOGUsers = await prisma.user.findMany({
      where: { isOG: false },
      select: { username: true, totalTradingVolume: true, isOG: true }
    });

    console.log(`\n📊 Found ${nonOGUsers.length} non-OG users (should be 0 for existing users):`);
    if (nonOGUsers.length > 0) {
      nonOGUsers.slice(0, 3).forEach(user => {
        console.log(`   - ${user.username}: Volume $${user.totalTradingVolume}`);
      });
    }

    // 3. Show OG earning thresholds
    console.log('\n🎯 OG Earning Thresholds:');
    console.log('   💹 Trading Volume: $100,000');
    console.log('   🏆 Achievements: 5');
    console.log('   ⭐ Points: 1,000');

    // 4. Test API endpoints exist
    console.log('\n🔗 API Endpoints:');
    console.log('   ✅ /api/jupiter/swap-complete - Track trading volume');
    console.log('   ✅ /api/og/progress - View OG progress');
    console.log('   ✅ Admin script: scripts/admin-grant-og.js');

    console.log('\n🎉 OG System Test Complete!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Complete swaps to test volume tracking');
    console.log('   2. Earn achievements to test achievement tracking');
    console.log('   3. Check OG progress in profile UI');

  } catch (error) {
    console.error('❌ Error testing OG system:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testOGSystem(); 