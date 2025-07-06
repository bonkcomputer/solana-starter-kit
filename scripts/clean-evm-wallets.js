const { PrismaClient } = require('../src/generated/prisma');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

/**
 * Clean EVM wallets and ensure users only have Solana wallets
 * 
 * Based on Privy Dashboard screenshots, identify users with EVM wallets
 * and provide instructions to remove EVM wallets while keeping/generating Solana wallets
 */

// Users identified from Privy Dashboard screenshots that have EVM wallets
const USERS_WITH_EVM_WALLETS = [
  {
    // From screenshot 1 - cyberryda@gmail.com has both EVM and Solana wallets
    email: 'cyberryda@gmail.com',
    privyId: 'cmc7fvo1400qlk10nttr0vax0',
    hasEVM: true,
    hasSolana: true, // Has both, need to remove EVM
    action: 'remove_evm_keep_solana'
  },
  {
    // From screenshot 2 - highlighted user with 0x2A8C83fE6d74228a83b...9c37f
    privyId: 'cmc6f5alu01bula0m7ndf4s7x', // Based on CSV order and date
    hasEVM: true,
    evmAddress: '0x2A8C83fE6d74228a83b...9c37f',
    action: 'remove_evm_ensure_solana'
  },
  {
    // From screenshot 2 - highlighted user with 0xbc536fb6e7A8b728c52c...0f99
    privyId: 'cmc6l7y3y00ttla0m8dp2qphi', // Based on CSV order and date  
    hasEVM: true,
    evmAddress: '0xbc536fb6e7A8b728c52c...0f99',
    action: 'remove_evm_ensure_solana'
  },
  {
    // From screenshot 3 - highlighted user with 0xA8ddFC42a8270c51...9c37
    privyId: 'cmc6mk7rg00dhl40nhwx6v9vq', // Based on CSV order and date
    hasEVM: true, 
    evmAddress: '0xA8ddFC42a8270c51...9c37',
    action: 'remove_evm_ensure_solana'
  },
  {
    // From screenshot 3 - highlighted user with 0x94D4E3dAcC3E7f96497...af2f2
    privyId: 'cmc8oixe100vdjp0mlq2m98hs', // Based on CSV order and date
    hasEVM: true,
    evmAddress: '0x94D4E3dAcC3E7f96497...af2f2', 
    action: 'remove_evm_ensure_solana'
  },
  {
    // From screenshot 3 - highlighted user with 0x6C4a4aA7795e99e2227...6AF5c
    privyId: 'cmcb0329v001vjl0lck1wpsz2', // Based on CSV order and date
    hasEVM: true,
    evmAddress: '0x6C4a4aA7795e99e2227...6AF5c',
    action: 'remove_evm_ensure_solana'
  },
  {
    // From screenshot 3 - highlighted user with 0x2A8C83fE6d74228a83b...9c37f (bottom)
    privyId: 'cmcb29j19005ijp0n6rsp06v8', // Based on CSV order and date
    hasEVM: true,
    evmAddress: '0x2A8C83fE6d74228a83b...9c37f',
    action: 'remove_evm_ensure_solana'
  }
];

// All email users who might have dual wallets (need to check)
const EMAIL_USERS_TO_CHECK = [
  'pickslabs@gmail.com',
  'cyberryda@gmail.com', 
  'clarityvision2030@gmail.com',
  'ruggedwojak@proton.me',
  'ordinalservice@gmail.com',
  'soulsete@naver.com',
  'farfouch2@gmail.com',
  'camden26@hotmail.com',
  'allisobhan4@gmail.com',
  'bonkcomputer6@gmail.com',
  'boredgucciape@gmail.com'
];

async function analyzeAndCleanWallets() {
  console.log('🧹 Analyzing wallets for cleanup...');
  console.log('===================================');
  
  const results = {
    usersWithEVMToRemove: [],
    emailUsersNeedingSolana: [],
    alreadyClean: [],
    notFound: [],
    errors: []
  };

  // Check users identified with EVM wallets
  console.log('\n🔍 Checking users with identified EVM wallets...');
  console.log('================================================');
  
  for (const user of USERS_WITH_EVM_WALLETS) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { privyDid: user.privyId },
        select: {
          privyDid: true,
          username: true,
          solanaWalletAddress: true,
          embeddedWalletAddress: true
        }
      });

      if (!dbUser) {
        console.log(`❌ User ${user.privyId} not found in database`);
        results.notFound.push(user);
        continue;
      }

      const userInfo = {
        ...user,
        dbUser,
        currentSolanaWallet: dbUser.solanaWalletAddress,
        currentEmbeddedWallet: dbUser.embeddedWalletAddress
      };

      if (dbUser.solanaWalletAddress && !dbUser.embeddedWalletAddress) {
        console.log(`✅ User ${dbUser.username} already clean (Solana only): ${dbUser.solanaWalletAddress}`);
        results.alreadyClean.push(userInfo);
      } else {
        console.log(`🔧 User ${dbUser.username} needs EVM removal:`);
        console.log(`   Solana: ${dbUser.solanaWalletAddress || 'MISSING - NEEDS GENERATION'}`);
        console.log(`   EVM: ${dbUser.embeddedWalletAddress || 'None in DB'}`);
        console.log(`   Action: ${user.action}`);
        results.usersWithEVMToRemove.push(userInfo);
      }
    } catch (error) {
      console.error(`❌ Error checking user ${user.privyId}:`, error.message);
      results.errors.push({ user, error: error.message });
    }
  }

  // Check all email users for dual wallets
  console.log('\n📧 Checking email users for dual wallets...');
  console.log('===========================================');
  
  for (const email of EMAIL_USERS_TO_CHECK) {
    try {
      // Find user by checking restored users (they have emails in bio or username)
      const dbUsers = await prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: email.split('@')[0] } },
            { bio: { contains: email } }
          ]
        },
        select: {
          privyDid: true,
          username: true,
          solanaWalletAddress: true,
          embeddedWalletAddress: true,
          bio: true
        }
      });

      if (dbUsers.length === 0) {
        console.log(`❓ No user found for email: ${email}`);
        continue;
      }

      for (const dbUser of dbUsers) {
        const userInfo = {
          email,
          dbUser,
          currentSolanaWallet: dbUser.solanaWalletAddress,
          currentEmbeddedWallet: dbUser.embeddedWalletAddress
        };

        if (!dbUser.solanaWalletAddress) {
          console.log(`🔑 User ${dbUser.username} (${email}) needs Solana wallet generation`);
          results.emailUsersNeedingSolana.push(userInfo);
        } else if (dbUser.embeddedWalletAddress) {
          console.log(`🔧 User ${dbUser.username} (${email}) has dual wallets - needs EVM removal`);
          console.log(`   Solana: ${dbUser.solanaWalletAddress}`);
          console.log(`   EVM: ${dbUser.embeddedWalletAddress}`);
          results.usersWithEVMToRemove.push(userInfo);
        } else {
          console.log(`✅ User ${dbUser.username} (${email}) already clean (Solana only)`);
          results.alreadyClean.push(userInfo);
        }
      }
    } catch (error) {
      console.error(`❌ Error checking email ${email}:`, error.message);
      results.errors.push({ email, error: error.message });
    }
  }

  // Generate action plan
  console.log('\n📋 WALLET CLEANUP ACTION PLAN');
  console.log('=============================');
  
  console.log(`\n📊 Summary:`);
  console.log(`   🔧 Users needing EVM wallet removal: ${results.usersWithEVMToRemove.length}`);
  console.log(`   🔑 Users needing Solana wallet generation: ${results.emailUsersNeedingSolana.length}`);
  console.log(`   ✅ Users already clean: ${results.alreadyClean.length}`);
  console.log(`   ❌ Users not found: ${results.notFound.length}`);
  console.log(`   💥 Errors: ${results.errors.length}`);

  if (results.usersWithEVMToRemove.length > 0) {
    console.log('\n🔧 STEP 1: Remove EVM wallets from these users');
    console.log('==============================================');
    results.usersWithEVMToRemove.forEach((user, index) => {
      console.log(`${index + 1}. ${user.dbUser.username}`);
      console.log(`   Privy ID: ${user.dbUser.privyDid}`);
      console.log(`   Current Solana: ${user.currentSolanaWallet || 'MISSING'}`);
      console.log(`   Current EVM: ${user.currentEmbeddedWallet || 'Unknown'}`);
      console.log(`   Action: Remove EVM wallet in Privy Dashboard`);
      console.log('');
    });
  }

  if (results.emailUsersNeedingSolana.length > 0) {
    console.log('\n🔑 STEP 2: Generate Solana wallets for these users');
    console.log('==================================================');
    results.emailUsersNeedingSolana.forEach((user, index) => {
      console.log(`${index + 1}. ${user.dbUser.username}`);
      console.log(`   Privy ID: ${user.dbUser.privyDid}`);
      console.log(`   Email: ${user.email || 'Unknown'}`);
      console.log(`   Action: Generate Solana wallet in Privy Dashboard`);
      console.log('');
    });
  }

  console.log('\n🛠️ DETAILED INSTRUCTIONS:');
  console.log('=========================');
  console.log('1. Go to Privy Dashboard: https://dashboard.privy.io/');
  console.log('2. Navigate to User Management');
  console.log('3. For each user listed above:');
  console.log('');
  console.log('   FOR EVM REMOVAL:');
  console.log('   a. Search for the user by Privy ID');
  console.log('   b. Go to their wallet management section');
  console.log('   c. Remove/disconnect the EVM wallet (0x address)');
  console.log('   d. Ensure they keep their Solana wallet');
  console.log('   e. If no Solana wallet exists, generate one');
  console.log('');
  console.log('   FOR SOLANA GENERATION:');
  console.log('   a. Search for the user by Privy ID');
  console.log('   b. Generate a new Solana wallet');
  console.log('   c. Note the generated Solana address');
  console.log('');
  console.log('4. After cleanup, run the database update script');
  console.log('5. Test that users can access Solana features properly');

  // Save results
  const timestamp = new Date().toISOString();
  const resultsData = {
    ...results,
    timestamp,
    summary: {
      usersNeedingEVMRemoval: results.usersWithEVMToRemove.length,
      usersNeedingSolanaGeneration: results.emailUsersNeedingSolana.length,
      usersAlreadyClean: results.alreadyClean.length,
      usersNotFound: results.notFound.length,
      totalErrors: results.errors.length
    }
  };

  const resultsPath = path.join(__dirname, '..', 'wallet-cleanup-plan.json');
  fs.writeFileSync(resultsPath, JSON.stringify(resultsData, null, 2));
  console.log(`\n📄 Detailed results saved to: ${resultsPath}`);

  return resultsData;
}

// Run the analysis
if (require.main === module) {
  analyzeAndCleanWallets()
    .then((results) => {
      console.log('\n🎉 Wallet cleanup analysis completed!');
      console.log(`\n📋 Total users needing attention: ${results.summary.usersNeedingEVMRemoval + results.summary.usersNeedingSolanaGeneration}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}

module.exports = { analyzeAndCleanWallets };
