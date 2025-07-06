const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

/**
 * Update wallet addresses in database after Privy Dashboard cleanup
 * 
 * After removing EVM wallets and generating Solana wallets in Privy Dashboard,
 * use this script to update the database with the new wallet addresses.
 */

// Template for wallet updates - fill in the actual addresses after Privy cleanup
const WALLET_UPDATES = [
  {
    privyId: 'cmc7fvo1400qlk10nttr0vax0',
    username: 'cyberryda',
    email: 'cyberryda@gmail.com',
    newSolanaAddress: '', // Fill in after Privy cleanup
    action: 'update_solana_remove_evm'
  },
  {
    privyId: 'cmc8oixe100vdjp0mlq2m98hs',
    username: 'clarityvision2030',
    email: 'clarityvision2030@gmail.com',
    newSolanaAddress: '', // Fill in after Privy cleanup
    action: 'add_solana'
  },
  {
    privyId: 'cmcb0329v001vjl0lck1wpsz2',
    username: 'ruggedwojak',
    email: 'ruggedwojak@proton.me',
    newSolanaAddress: '', // Fill in after Privy cleanup
    action: 'add_solana'
  },
  {
    privyId: 'cmcb29j19005ijp0n6rsp06v8',
    username: 'ordinalservice',
    email: 'ordinalservice@gmail.com',
    newSolanaAddress: '', // Fill in after Privy cleanup
    action: 'add_solana'
  },
  {
    privyId: 'cmc786qzc00gwjp0mkudq1thc',
    username: 'pickslabs',
    email: 'pickslabs@gmail.com',
    newSolanaAddress: '', // Fill in after Privy cleanup
    action: 'add_solana'
  },
  {
    privyId: 'cmcjwu1kt00zfl90nczx7sluo',
    username: 'soulsete',
    email: 'soulsete@naver.com',
    newSolanaAddress: '', // Fill in after Privy cleanup
    action: 'add_solana'
  },
  {
    privyId: 'cmclw4z6f033hlk0n9uwdzu8l',
    username: 'farfouch2',
    email: 'farfouch2@gmail.com',
    newSolanaAddress: '', // Fill in after Privy cleanup
    action: 'add_solana'
  },
  {
    privyId: 'cmclwesvw022dl70nkz3eu4yp',
    username: 'camden26',
    email: 'camden26@hotmail.com',
    newSolanaAddress: '', // Fill in after Privy cleanup
    action: 'add_solana'
  },
  {
    privyId: 'cmcm94tji01u9lj0max56h28m',
    username: 'allisobhan4',
    email: 'allisobhan4@gmail.com',
    newSolanaAddress: '', // Fill in after Privy cleanup
    action: 'add_solana'
  },
  {
    privyId: 'cmcn9e9rk03aild0lk836kqez',
    username: 'bonkcomputer6',
    email: 'bonkcomputer6@gmail.com',
    newSolanaAddress: '', // Fill in after Privy cleanup
    action: 'add_solana'
  },
  {
    privyId: 'cmcnhu3xn0361ky0n7w0rxrsm',
    username: 'boredgucciape',
    email: 'boredgucciape@gmail.com',
    newSolanaAddress: '', // Fill in after Privy cleanup
    action: 'add_solana'
  }
];

async function updateWalletAddresses() {
  console.log('🔄 Updating wallet addresses in database...');
  console.log('===========================================');

  // Check which updates have addresses filled in
  const readyUpdates = WALLET_UPDATES.filter(update => update.newSolanaAddress.trim() !== '');
  const pendingUpdates = WALLET_UPDATES.filter(update => update.newSolanaAddress.trim() === '');

  if (readyUpdates.length === 0) {
    console.log('⚠️  No wallet addresses provided for updates!');
    console.log('');
    console.log('📝 Instructions:');
    console.log('1. Edit this script file: scripts/update-wallet-addresses.js');
    console.log('2. Fill in the newSolanaAddress field for each user');
    console.log('3. Run this script again');
    console.log('');
    console.log('💡 Get the addresses from Privy Dashboard after wallet cleanup');
    return;
  }

  console.log(`📊 Update Summary:`);
  console.log(`   ✅ Ready to update: ${readyUpdates.length}`);
  console.log(`   ⏳ Pending addresses: ${pendingUpdates.length}`);
  console.log('');

  const results = {
    successful: [],
    failed: [],
    skipped: pendingUpdates
  };

  // Process ready updates
  for (const update of readyUpdates) {
    try {
      console.log(`🔄 Updating ${update.username} (${update.email})...`);
      
      // Verify user exists
      const existingUser = await prisma.user.findUnique({
        where: { privyDid: update.privyId },
        select: {
          privyDid: true,
          username: true,
          solanaWalletAddress: true,
          embeddedWalletAddress: true
        }
      });

      if (!existingUser) {
        console.log(`❌ User not found: ${update.privyId}`);
        results.failed.push({ ...update, error: 'User not found' });
        continue;
      }

      // Update the user's wallet addresses
      const updatedUser = await prisma.user.update({
        where: { privyDid: update.privyId },
        data: {
          solanaWalletAddress: update.newSolanaAddress,
          embeddedWalletAddress: null // Remove EVM wallet
        },
        select: {
          privyDid: true,
          username: true,
          solanaWalletAddress: true,
          embeddedWalletAddress: true
        }
      });

      console.log(`✅ Updated ${updatedUser.username}:`);
      console.log(`   Solana: ${updatedUser.solanaWalletAddress}`);
      console.log(`   EVM: ${updatedUser.embeddedWalletAddress || 'Removed'}`);
      console.log('');

      results.successful.push({ ...update, updatedUser });

    } catch (error) {
      console.error(`❌ Failed to update ${update.username}:`, error.message);
      results.failed.push({ ...update, error: error.message });
    }
  }

  // Final summary
  console.log('🎯 Final Summary');
  console.log('================');
  console.log(`✅ Successfully updated: ${results.successful.length}`);
  console.log(`❌ Failed updates: ${results.failed.length}`);
  console.log(`⏳ Pending addresses: ${results.skipped.length}`);

  if (results.failed.length > 0) {
    console.log('\n❌ Failed Updates:');
    results.failed.forEach(fail => {
      console.log(`   ${fail.username}: ${fail.error}`);
    });
  }

  if (results.skipped.length > 0) {
    console.log('\n⏳ Still need addresses for:');
    results.skipped.forEach(skip => {
      console.log(`   ${skip.username} (${skip.email})`);
    });
  }

  if (results.successful.length > 0) {
    console.log('\n🎉 Wallet cleanup completed successfully!');
    console.log('All updated users now have Solana-only wallets.');
  }

  return results;
}

// Run the update
if (require.main === module) {
  updateWalletAddresses()
    .then((results) => {
      if (results && results.successful.length > 0) {
        console.log('\n✅ Database wallet addresses updated successfully!');
      }
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

module.exports = { updateWalletAddresses };
