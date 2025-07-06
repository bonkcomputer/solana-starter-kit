// Load environment variables
require('dotenv').config();

const { PrismaClient } = require('../src/generated/prisma');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

/**
 * Privy Admin API Wallet Management
 * 
 * This script uses the Privy Admin API to:
 * 1. Create Solana wallets for users who need them
 * 2. Manage wallet configurations to ensure Solana-only setup
 * 
 * Based on Privy API documentation:
 * - https://docs.privy.io/api-reference/signers/create
 * - https://docs.privy.io/wallets/wallets/create/create-a-wallet
 */

// Configuration
const PRIVY_CONFIG = {
  baseUrl: 'https://api.privy.io',
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  appSecret: process.env.PRIVY_APP_SECRET, // You'll need to add this to your .env
  headers: {
    'Content-Type': 'application/json',
    'privy-app-id': process.env.NEXT_PUBLIC_PRIVY_APP_ID,
    'Authorization': `Basic ${Buffer.from(`${process.env.NEXT_PUBLIC_PRIVY_APP_ID}:${process.env.PRIVY_APP_SECRET}`).toString('base64')}`
  }
};

// Users identified from the wallet screenshots who need Solana wallets
const USERS_NEEDING_SOLANA_WALLETS = [
  // From the wallet screenshots - these users have EVM wallets that need to be replaced with Solana
  {
    privyId: 'cmc7fvo1400qlk10nttr0vax0',
    username: 'cyberryda',
    email: 'cyberryda@gmail.com',
    currentWalletType: 'evm',
    action: 'create_solana_replace_evm'
  },
  {
    privyId: 'cmc8oixe100vdjp0mlq2m98hs',
    username: 'clarityvision2030',
    email: 'clarityvision2030@gmail.com',
    currentWalletType: 'evm',
    action: 'create_solana_replace_evm'
  },
  {
    privyId: 'cmcb0329v001vjl0lck1wpsz2',
    username: 'ruggedwojak',
    email: 'ruggedwojak@proton.me',
    currentWalletType: 'evm',
    action: 'create_solana_replace_evm'
  },
  {
    privyId: 'cmcb29j19005ijp0n6rsp06v8',
    username: 'ordinalservice',
    email: 'ordinalservice@gmail.com',
    currentWalletType: 'evm',
    action: 'create_solana_replace_evm'
  },
  // Email-only users who need Solana wallets
  {
    privyId: 'cmc786qzc00gwjp0mkudq1thc',
    username: 'pickslabs',
    email: 'pickslabs@gmail.com',
    currentWalletType: 'none',
    action: 'create_solana_new'
  },
  {
    privyId: 'cmcjwu1kt00zfl90nczx7sluo',
    username: 'soulsete',
    email: 'soulsete@naver.com',
    currentWalletType: 'none',
    action: 'create_solana_new'
  },
  {
    privyId: 'cmclw4z6f033hlk0n9uwdzu8l',
    username: 'farfouch2',
    email: 'farfouch2@gmail.com',
    currentWalletType: 'none',
    action: 'create_solana_new'
  },
  {
    privyId: 'cmclwesvw022dl70nkz3eu4yp',
    username: 'camden26',
    email: 'camden26@hotmail.com',
    currentWalletType: 'none',
    action: 'create_solana_new'
  },
  {
    privyId: 'cmcm94tji01u9lj0max56h28m',
    username: 'allisobhan4',
    email: 'allisobhan4@gmail.com',
    currentWalletType: 'none',
    action: 'create_solana_new'
  },
  {
    privyId: 'cmcn9e9rk03aild0lk836kqez',
    username: 'bonkcomputer6',
    email: 'bonkcomputer6@gmail.com',
    currentWalletType: 'none',
    action: 'create_solana_new'
  },
  {
    privyId: 'cmcnhu3xn0361ky0n7w0rxrsm',
    username: 'boredgucciape',
    email: 'boredgucciape@gmail.com',
    currentWalletType: 'none',
    action: 'create_solana_new'
  }
];

/**
 * Create a Solana wallet for a user using Privy Admin API
 */
async function createSolanaWallet(user) {
  console.log(`🔑 Creating Solana wallet for ${user.username} (${user.email})...`);
  
  if (!PRIVY_CONFIG.appSecret) {
    throw new Error('PRIVY_APP_SECRET environment variable is required');
  }

  try {
    // Create Solana-only wallet using Privy API
    const walletPayload = {
      wallets: [
        {
          chain_type: 'solana',
          policy_ids: []
        }
      ],
      primary_signer: {
        subject_id: user.privyId
      },
      recovery_user: {
        linked_accounts: [
          {
            type: 'email',
            address: user.email
          }
        ]
      }
    };

    const response = await fetch(`${PRIVY_CONFIG.baseUrl}/v1/wallets_with_recovery`, {
      method: 'POST',
      headers: PRIVY_CONFIG.headers,
      body: JSON.stringify(walletPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Privy API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log(`✅ Successfully created Solana wallet for ${user.username}`);
    
    // Extract the Solana wallet from the response
    const solanaWallet = result.wallets.find(w => w.chain_type === 'solana');
    
    if (!solanaWallet) {
      throw new Error('No Solana wallet found in response');
    }

    return {
      user,
      wallet: solanaWallet,
      recoveryUserId: result.recovery_user_id
    };

  } catch (error) {
    console.error(`❌ Failed to create Solana wallet for ${user.username}:`, error.message);
    throw error;
  }
}

/**
 * Update database with new Solana wallet address
 */
async function updateDatabaseWallet(user, walletData) {
  console.log(`💾 Updating database for ${user.username}...`);
  
  try {
    const updatedUser = await prisma.user.update({
      where: { privyDid: user.privyId },
      data: {
        solanaWalletAddress: walletData.wallet.address,
        embeddedWalletAddress: null // Remove any EVM wallet reference
      },
      select: {
        privyDid: true,
        username: true,
        solanaWalletAddress: true,
        embeddedWalletAddress: true
      }
    });

    console.log(`✅ Database updated for ${user.username}:`);
    console.log(`   Solana: ${updatedUser.solanaWalletAddress}`);
    console.log(`   EVM: ${updatedUser.embeddedWalletAddress || 'Removed'}`);

    return updatedUser;

  } catch (error) {
    console.error(`❌ Failed to update database for ${user.username}:`, error.message);
    throw error;
  }
}

/**
 * Process all users needing Solana wallets
 */
async function processWalletCreation() {
  console.log('🚀 Starting Solana wallet creation process...');
  console.log('===============================================');

  // Validate environment variables
  if (!PRIVY_CONFIG.appId || !PRIVY_CONFIG.appSecret) {
    console.error('❌ Missing required environment variables:');
    console.error('   NEXT_PUBLIC_PRIVY_APP_ID:', PRIVY_CONFIG.appId ? '✅' : '❌');
    console.error('   PRIVY_APP_SECRET:', PRIVY_CONFIG.appSecret ? '✅' : '❌');
    console.error('');
    console.error('Please add PRIVY_APP_SECRET to your .env file');
    console.error('You can find this in your Privy Dashboard > App Settings > Basics');
    return;
  }

  const results = {
    successful: [],
    failed: [],
    skipped: []
  };

  console.log(`📊 Processing ${USERS_NEEDING_SOLANA_WALLETS.length} users...`);
  console.log('');

  for (const user of USERS_NEEDING_SOLANA_WALLETS) {
    try {
      console.log(`\n🔄 Processing ${user.username} (${user.action})...`);
      
      // Check if user exists in database
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
        console.log(`❌ User ${user.username} not found in database - skipping`);
        results.skipped.push({ ...user, reason: 'User not found in database' });
        continue;
      }

      // Check if user already has a Solana wallet
      if (dbUser.solanaWalletAddress) {
        console.log(`✅ User ${user.username} already has Solana wallet: ${dbUser.solanaWalletAddress}`);
        results.skipped.push({ ...user, reason: 'Already has Solana wallet', wallet: dbUser.solanaWalletAddress });
        continue;
      }

      // Create Solana wallet via Privy API
      const walletData = await createSolanaWallet(user);
      
      // Update database with new wallet
      const updatedUser = await updateDatabaseWallet(user, walletData);
      
      results.successful.push({
        ...user,
        walletData,
        updatedUser
      });

      console.log(`🎉 Successfully processed ${user.username}!`);
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`💥 Failed to process ${user.username}:`, error.message);
      results.failed.push({
        ...user,
        error: error.message
      });
    }
  }

  // Final summary
  console.log('\n🎯 FINAL SUMMARY');
  console.log('================');
  console.log(`✅ Successfully processed: ${results.successful.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⏭️  Skipped: ${results.skipped.length}`);

  if (results.successful.length > 0) {
    console.log('\n✅ Successfully created Solana wallets for:');
    results.successful.forEach(result => {
      console.log(`   ${result.username}: ${result.walletData.wallet.address}`);
    });
  }

  if (results.failed.length > 0) {
    console.log('\n❌ Failed to process:');
    results.failed.forEach(result => {
      console.log(`   ${result.username}: ${result.error}`);
    });
  }

  if (results.skipped.length > 0) {
    console.log('\n⏭️  Skipped:');
    results.skipped.forEach(result => {
      console.log(`   ${result.username}: ${result.reason}`);
    });
  }

  // Save results
  const timestamp = new Date().toISOString();
  const resultsData = {
    ...results,
    timestamp,
    summary: {
      total: USERS_NEEDING_SOLANA_WALLETS.length,
      successful: results.successful.length,
      failed: results.failed.length,
      skipped: results.skipped.length
    }
  };

  const resultsPath = path.join(__dirname, '..', 'solana-wallet-creation-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(resultsData, null, 2));
  console.log(`\n📄 Detailed results saved to: ${resultsPath}`);

  if (results.successful.length > 0) {
    console.log('\n🎉 Wallet creation completed successfully!');
    console.log('All users now have Solana wallets and can access app features.');
  }

  return resultsData;
}

/**
 * Verify wallet setup after creation
 */
async function verifyWalletSetup() {
  console.log('🔍 Verifying wallet setup...');
  console.log('============================');

  const verification = {
    usersWithSolana: [],
    usersWithoutSolana: [],
    usersWithEVM: []
  };

  for (const user of USERS_NEEDING_SOLANA_WALLETS) {
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
        console.log(`❌ User ${user.username} not found`);
        continue;
      }

      if (dbUser.solanaWalletAddress && !dbUser.embeddedWalletAddress) {
        console.log(`✅ ${dbUser.username}: Solana-only (${dbUser.solanaWalletAddress})`);
        verification.usersWithSolana.push(dbUser);
      } else if (!dbUser.solanaWalletAddress) {
        console.log(`❌ ${dbUser.username}: No Solana wallet`);
        verification.usersWithoutSolana.push(dbUser);
      } else if (dbUser.embeddedWalletAddress) {
        console.log(`⚠️  ${dbUser.username}: Has EVM wallet (${dbUser.embeddedWalletAddress})`);
        verification.usersWithEVM.push(dbUser);
      }
    } catch (error) {
      console.error(`❌ Error verifying ${user.username}:`, error.message);
    }
  }

  console.log('\n📊 Verification Summary:');
  console.log(`✅ Users with Solana-only wallets: ${verification.usersWithSolana.length}`);
  console.log(`❌ Users without Solana wallets: ${verification.usersWithoutSolana.length}`);
  console.log(`⚠️  Users with EVM wallets: ${verification.usersWithEVM.length}`);

  return verification;
}

// Main execution
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'verify') {
    verifyWalletSetup()
      .then(() => process.exit(0))
      .catch(error => {
        console.error('💥 Verification failed:', error);
        process.exit(1);
      })
      .finally(() => prisma.$disconnect());
  } else {
    processWalletCreation()
      .then(() => process.exit(0))
      .catch(error => {
        console.error('💥 Wallet creation failed:', error);
        process.exit(1);
      })
      .finally(() => prisma.$disconnect());
  }
}

module.exports = { 
  processWalletCreation, 
  verifyWalletSetup,
  createSolanaWallet,
  updateDatabaseWallet 
};
