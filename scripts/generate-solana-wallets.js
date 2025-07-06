const { PrismaClient } = require('../src/generated/prisma');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

/**
 * Generate Solana wallets for users who only have email accounts
 * 
 * IMPORTANT: This script requires manual intervention to complete the Solana wallet generation.
 * 
 * Process:
 * 1. Identify users who need Solana wallets (email-only users)
 * 2. Display instructions for manual wallet generation via Privy Dashboard
 * 3. Provide a way to update the database once wallets are generated
 * 
 * The Privy Admin API for programmatic wallet creation requires server-side implementation
 * with proper authentication and may have rate limits.
 */

// Users from CSV who need Solana wallets (have email but no Solana wallet)
const USERS_NEEDING_SOLANA_WALLETS = [
  {
    id: 'cmc786qzc00gwjp0mkudq1thc',
    email: 'pickslabs@gmail.com',
    createdAt: 'Wed Jun 18 2025 16:13:19 GMT+0000 (Coordinated Universal Time)'
  },
  {
    id: 'cmc7fvo1400qlk10nttr0vax0',
    email: 'cyberryda@gmail.com',
    createdAt: 'Sun Jun 22 2025 09:02:13 GMT+0000 (Coordinated Universal Time)'
  },
  {
    id: 'cmc8oixe100vdjp0mlq2m98hs',
    email: 'clarityvision2030@gmail.com',
    createdAt: 'Mon Jun 23 2025 05:52:01 GMT+0000 (Coordinated Universal Time)'
  },
  {
    id: 'cmcb0329v001vjl0lck1wpsz2',
    email: 'ruggedwojak@proton.me',
    createdAt: 'Tue Jun 24 2025 20:51:08 GMT+0000 (Coordinated Universal Time)'
  },
  {
    id: 'cmcb29j19005ijp0n6rsp06v8',
    email: 'ordinalservice@gmail.com',
    createdAt: 'Tue Jun 24 2025 21:52:09 GMT+0000 (Coordinated Universal Time)'
  },
  {
    id: 'cmcjwu1kt00zfl90nczx7sluo',
    email: 'soulsete@naver.com',
    createdAt: 'Tue Jul 01 2025 02:30:04 GMT+0000 (Coordinated Universal Time)'
  },
  {
    id: 'cmclw4z6f033hlk0n9uwdzu8l',
    email: 'farfouch2@gmail.com',
    createdAt: 'Wed Jul 02 2025 11:46:07 GMT+0000 (Coordinated Universal Time)'
  },
  {
    id: 'cmclwesvw022dl70nkz3eu4yp',
    email: 'camden26@hotmail.com',
    createdAt: 'Wed Jul 02 2025 11:53:46 GMT+0000 (Coordinated Universal Time)'
  },
  {
    id: 'cmcm94tji01u9lj0max56h28m',
    email: 'allisobhan4@gmail.com',
    createdAt: 'Wed Jul 02 2025 17:49:55 GMT+0000 (Coordinated Universal Time)'
  },
  {
    id: 'cmcn9e9rk03aild0lk836kqez',
    email: 'bonkcomputer6@gmail.com',
    createdAt: 'Thu Jul 03 2025 10:45:02 GMT+0000 (Coordinated Universal Time)'
  },
  {
    id: 'cmcnhu3xn0361ky0n7w0rxrsm',
    email: 'boredgucciape@gmail.com',
    createdAt: 'Thu Jul 03 2025 14:41:18 GMT+0000 (Coordinated Universal Time)'
  }
];

async function analyzeSolanaWalletNeeds() {
  console.log('🔍 Analyzing Solana wallet needs for email-only users...');
  console.log('========================================================');
  
  const analysis = {
    needsWallet: [],
    hasWallet: [],
    notFound: [],
    errors: []
  };

  for (const user of USERS_NEEDING_SOLANA_WALLETS) {
    try {
      console.log(`\n👤 Checking user: ${user.email} (${user.id})`);
      
      // Check if user exists in database
      const existingUser = await prisma.user.findUnique({
        where: { privyDid: user.id },
        select: {
          privyDid: true,
          username: true,
          solanaWalletAddress: true,
          embeddedWalletAddress: true,
          createdAt: true
        }
      });

      if (!existingUser) {
        console.log(`❌ User ${user.id} not found in database`);
        analysis.notFound.push({
          userId: user.id,
          email: user.email,
          reason: 'User not found in database'
        });
        continue;
      }

      if (existingUser.solanaWalletAddress) {
        console.log(`✅ User ${user.email} already has Solana wallet: ${existingUser.solanaWalletAddress}`);
        analysis.hasWallet.push({
          userId: user.id,
          email: user.email,
          username: existingUser.username,
          solanaWallet: existingUser.solanaWalletAddress,
          embeddedWallet: existingUser.embeddedWalletAddress
        });
      } else {
        console.log(`🔑 User ${user.email} needs Solana wallet generation`);
        analysis.needsWallet.push({
          userId: user.id,
          email: user.email,
          username: existingUser.username,
          embeddedWallet: existingUser.embeddedWalletAddress
        });
      }

    } catch (error) {
      console.error(`❌ Error checking user ${user.email}:`, error.message);
      analysis.errors.push({
        userId: user.id,
        email: user.email,
        error: error.message
      });
    }
  }

  // Summary
  console.log('\n📊 Solana Wallet Analysis Summary');
  console.log('==================================');
  console.log(`🔑 Need Solana wallet: ${analysis.needsWallet.length}`);
  console.log(`✅ Already have wallet: ${analysis.hasWallet.length}`);
  console.log(`❌ Not found in DB: ${analysis.notFound.length}`);
  console.log(`⚠️  Errors: ${analysis.errors.length}`);
  console.log(`📋 Total analyzed: ${USERS_NEEDING_SOLANA_WALLETS.length}`);

  // Display users who need wallets
  if (analysis.needsWallet.length > 0) {
    console.log('\n🔑 Users who need Solana wallets:');
    console.log('=================================');
    analysis.needsWallet.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.username})`);
      console.log(`   User ID: ${user.userId}`);
      console.log(`   Embedded Wallet: ${user.embeddedWallet || 'None'}`);
      console.log('');
    });

    console.log('\n📋 Next Steps:');
    console.log('==============');
    console.log('1. Use Privy Dashboard to generate Solana wallets for these users');
    console.log('2. Or implement Privy Admin API integration for programmatic creation');
    console.log('3. Run the update script once wallets are generated');
    console.log('');
    console.log('💡 Privy Dashboard: https://dashboard.privy.io/');
    console.log('📖 Privy Admin API: https://docs.privy.io/reference/admin-api');
  }

  // Save analysis to file
  const analysisPath = path.join(__dirname, '..', 'solana-wallet-analysis.json');
  fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2));
  console.log(`\n📄 Analysis saved to: ${analysisPath}`);

  return analysis;
}

/**
 * Generate Solana wallet via Privy API
 * This is a placeholder function that needs to be implemented with actual Privy API calls
 */
async function generateSolanaWalletViaPrivy(userId) {
  // TODO: Implement actual Privy API call to generate Solana wallet
  // This would typically involve:
  // 1. Using Privy Admin API to create a Solana wallet for the user
  // 2. Returning the generated wallet address
  
  console.log(`🔧 [PLACEHOLDER] Generating Solana wallet for user ${userId}...`);
  console.log('⚠️  This requires actual Privy API implementation');
  
  // For now, return null to indicate this needs implementation
  return null;
}

/**
 * Validate Solana wallet address format
 */
function isValidSolanaAddress(address) {
  // Basic Solana address validation (44 characters, base58)
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

// Run the script
if (require.main === module) {
  generateSolanaWallets()
    .then(() => {
      console.log('\n🎉 Solana wallet generation process completed!');
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

module.exports = { generateSolanaWallets };
