const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function testUserLookup() {
  try {
    console.log('🔍 Testing user lookup functionality...');
    
    // Get a sample of users to test with
    const users = await prisma.user.findMany({
      take: 5,
      select: {
        privyDid: true,
        username: true,
        solanaWalletAddress: true,
        embeddedWalletAddress: true,
        bio: true
      }
    });

    console.log(`📊 Found ${users.length} users to test with:`);
    
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.username}`);
      console.log(`     privyDid: ${user.privyDid}`);
      console.log(`     solanaWallet: ${user.solanaWalletAddress || 'N/A'}`);
      console.log(`     embeddedWallet: ${user.embeddedWalletAddress || 'N/A'}`);
      console.log(`     bio: ${user.bio ? user.bio.substring(0, 50) + '...' : 'N/A'}`);
      console.log('');
    });

    console.log('✅ User lookup test completed successfully!');
    console.log('💡 Users with these credentials should be able to update usernames and bios.');
    
  } catch (error) {
    console.error('❌ Error testing user lookup:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testUserLookup(); 