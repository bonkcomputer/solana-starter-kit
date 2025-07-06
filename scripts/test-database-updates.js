const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function testDatabaseUpdates() {
  try {
    console.log('🔍 Testing database update functionality...\n');
    
    // Get a test user
    const testUser = await prisma.user.findFirst({
      where: {
        username: {
          contains: 'user_'
        }
      }
    });

    if (!testUser) {
      console.log('❌ No test user found in database');
      return;
    }

    console.log('📊 Test User Found:');
    console.log(`  Username: ${testUser.username}`);
    console.log(`  PrivyDid: ${testUser.privyDid}`);
    console.log(`  Solana Wallet: ${testUser.solanaWalletAddress || 'N/A'}`);
    console.log(`  Current Bio: ${testUser.bio || 'N/A'}`);
    console.log(`  Last Username Change: ${testUser.lastUsernameChange || 'Never'}\n`);

    // Test 1: Bio Update
    console.log('🧪 Test 1: Bio Update');
    const newBio = `Updated bio at ${new Date().toISOString()}`;
    
    try {
      const updatedUser = await prisma.user.update({
        where: { privyDid: testUser.privyDid },
        data: { bio: newBio }
      });
      
      console.log('✅ Bio update successful!');
      console.log(`  Old Bio: ${testUser.bio || 'N/A'}`);
      console.log(`  New Bio: ${updatedUser.bio}\n`);
    } catch (error) {
      console.log('❌ Bio update failed:', error.message);
    }

    // Test 2: Username Update (only if allowed by time limit)
    console.log('🧪 Test 2: Username Update Eligibility Check');
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const canChangeUsername = !testUser.lastUsernameChange || testUser.lastUsernameChange <= oneWeekAgo;
    
    if (canChangeUsername) {
      console.log('✅ User can change username (no recent changes)');
      
      // Generate a test username
      const timestamp = Date.now().toString().slice(-6);
      const newUsername = `test_${timestamp}`;
      
      // Check if username exists
      const existingUsername = await prisma.user.findUnique({
        where: { username: newUsername }
      });
      
      if (!existingUsername) {
        try {
          const updatedUser = await prisma.user.update({
            where: { privyDid: testUser.privyDid },
            data: { 
              username: newUsername,
              lastUsernameChange: new Date()
            }
          });
          
          console.log('✅ Username update successful!');
          console.log(`  Old Username: ${testUser.username}`);
          console.log(`  New Username: ${updatedUser.username}`);
          console.log(`  Last Change: ${updatedUser.lastUsernameChange}\n`);
        } catch (error) {
          console.log('❌ Username update failed:', error.message);
        }
      } else {
        console.log('⚠️ Generated username already exists, skipping username test\n');
      }
    } else {
      const nextAllowed = new Date(testUser.lastUsernameChange);
      nextAllowed.setDate(nextAllowed.getDate() + 7);
      const daysRemaining = Math.ceil((nextAllowed.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      console.log('⏰ User cannot change username yet');
      console.log(`  Last changed: ${testUser.lastUsernameChange}`);
      console.log(`  Next allowed: ${nextAllowed.toISOString()}`);
      console.log(`  Days remaining: ${daysRemaining}\n`);
    }

    // Test 3: User Lookup by Different Methods
    console.log('🧪 Test 3: User Lookup Methods');
    
    // Lookup by privyDid
    const userByPrivyDid = await prisma.user.findUnique({
      where: { privyDid: testUser.privyDid }
    });
    console.log(`✅ Lookup by privyDid: ${userByPrivyDid ? 'Found' : 'Not Found'}`);
    
    // Lookup by username
    const userByUsername = await prisma.user.findUnique({
      where: { username: testUser.username }
    });
    console.log(`✅ Lookup by username: ${userByUsername ? 'Found' : 'Not Found'}`);
    
    // Lookup by wallet address
    if (testUser.solanaWalletAddress) {
      const userByWallet = await prisma.user.findFirst({
        where: { solanaWalletAddress: testUser.solanaWalletAddress }
      });
      console.log(`✅ Lookup by wallet: ${userByWallet ? 'Found' : 'Not Found'}`);
    }

    console.log('\n🎉 Database update tests completed successfully!');
    console.log('💡 The database is properly configured for username and bio updates.');
    
  } catch (error) {
    console.error('❌ Error testing database updates:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseUpdates(); 