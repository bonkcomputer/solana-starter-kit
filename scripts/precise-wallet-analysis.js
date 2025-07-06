// Load environment variables
require('dotenv').config();

const { PrismaClient } = require('../src/generated/prisma');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

/**
 * Precise Wallet Analysis
 * 
 * This script analyzes the current database state and determines exactly which users need:
 * 1. EVM wallet removal only (they already have Solana)
 * 2. EVM wallet removal + Solana wallet generation
 * 3. Solana wallet generation only (email-only users)
 * 4. No action needed (external Solana wallets)
 */

// All users from the screenshots who have EVM wallets that need to be addressed
const USERS_FROM_SCREENSHOTS = [
  // Users we know from previous analysis
  'cmc7fvo1400qlk10nttr0vax0', // cyberryda@gmail.com
  'cmc8oixe100vdjp0mlq2m98hs', // clarityvision2030@gmail.com
  'cmcb0329v001vjl0lck1wpsz2', // ruggedwojak@proton.me
  'cmcb29j19005ijp0n6rsp06v8', // ordinalservice@gmail.com
  'cmc786qzc00gwjp0mkudq1thc', // pickslabs@gmail.com
  'cmcjwu1kt00zfl90nczx7sluo', // soulsete@naver.com
  'cmclw4z6f033hlk0n9uwdzu8l', // farfouch2@gmail.com
  'cmclwesvw022dl70nkz3eu4yp', // camden26@hotmail.com
  'cmcm94tji01u9lj0max56h28m', // allisobhan4@gmail.com
  'cmcn9e9rk03aild0lk836kqez', // bonkcomputer6@gmail.com
  'cmcnhu3xn0361ky0n7w0rxrsm', // boredgucciape@gmail.com
];

async function analyzePreciseWalletNeeds() {
  console.log('🔍 Precise Wallet Analysis...');
  console.log('============================');

  const analysis = {
    removeEvmOnly: [], // Users who have both EVM and Solana - just remove EVM
    removeEvmAndGenerateSolana: [], // Users who have only EVM - remove EVM and generate Solana
    generateSolanaOnly: [], // Users who have no wallets - generate Solana
    noActionNeeded: [], // Users who already have external Solana wallets
    notFound: [] // Users not found in database
  };

  console.log(`📊 Analyzing ${USERS_FROM_SCREENSHOTS.length} users...`);
  console.log('');

  for (const privyId of USERS_FROM_SCREENSHOTS) {
    try {
      const user = await prisma.user.findUnique({
        where: { privyDid: privyId },
        select: {
          privyDid: true,
          username: true,
          solanaWalletAddress: true,
          embeddedWalletAddress: true,
          bio: true
        }
      });

      if (!user) {
        console.log(`❌ User ${privyId} not found in database`);
        analysis.notFound.push(privyId);
        continue;
      }

      // Extract email from bio if available
      const emailMatch = user.bio?.match(/[\w\.-]+@[\w\.-]+\.\w+/);
      const email = emailMatch ? emailMatch[0] : 'unknown';

      const userInfo = {
        privyId: user.privyDid,
        username: user.username,
        email,
        currentSolana: user.solanaWalletAddress,
        currentEvm: user.embeddedWalletAddress
      };

      // Determine what action is needed
      if (user.solanaWalletAddress && user.embeddedWalletAddress) {
        // Has both - remove EVM only
        console.log(`🔧 ${user.username} (${email}): Has both wallets - REMOVE EVM ONLY`);
        console.log(`   Solana: ${user.solanaWalletAddress}`);
        console.log(`   EVM: ${user.embeddedWalletAddress} (REMOVE)`);
        analysis.removeEvmOnly.push(userInfo);
      } else if (!user.solanaWalletAddress && user.embeddedWalletAddress) {
        // Has only EVM - remove EVM and generate Solana
        console.log(`🔄 ${user.username} (${email}): Has only EVM - REMOVE EVM + GENERATE SOLANA`);
        console.log(`   EVM: ${user.embeddedWalletAddress} (REMOVE)`);
        console.log(`   Solana: None (GENERATE)`);
        analysis.removeEvmAndGenerateSolana.push(userInfo);
      } else if (!user.solanaWalletAddress && !user.embeddedWalletAddress) {
        // Has no wallets - generate Solana
        console.log(`🔑 ${user.username} (${email}): No wallets - GENERATE SOLANA`);
        console.log(`   Action: Generate Solana wallet`);
        analysis.generateSolanaOnly.push(userInfo);
      } else if (user.solanaWalletAddress && !user.embeddedWalletAddress) {
        // Has only Solana - no action needed
        console.log(`✅ ${user.username} (${email}): Already has Solana only - NO ACTION NEEDED`);
        console.log(`   Solana: ${user.solanaWalletAddress}`);
        analysis.noActionNeeded.push(userInfo);
      }

      console.log('');

    } catch (error) {
      console.error(`❌ Error analyzing user ${privyId}:`, error.message);
    }
  }

  // Summary
  console.log('🎯 ANALYSIS SUMMARY');
  console.log('==================');
  console.log(`🔧 Remove EVM only (have Solana): ${analysis.removeEvmOnly.length}`);
  console.log(`🔄 Remove EVM + Generate Solana: ${analysis.removeEvmAndGenerateSolana.length}`);
  console.log(`🔑 Generate Solana only: ${analysis.generateSolanaOnly.length}`);
  console.log(`✅ No action needed: ${analysis.noActionNeeded.length}`);
  console.log(`❌ Not found: ${analysis.notFound.length}`);
  console.log('');

  // Detailed action plan
  if (analysis.removeEvmOnly.length > 0) {
    console.log('🔧 STEP 1: Remove EVM wallets (users already have Solana)');
    console.log('========================================================');
    analysis.removeEvmOnly.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.email})`);
      console.log(`   Keep Solana: ${user.currentSolana}`);
      console.log(`   Remove EVM: ${user.currentEvm}`);
      console.log('');
    });
  }

  if (analysis.removeEvmAndGenerateSolana.length > 0) {
    console.log('🔄 STEP 2: Remove EVM + Generate Solana wallets');
    console.log('===============================================');
    analysis.removeEvmAndGenerateSolana.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.email})`);
      console.log(`   Remove EVM: ${user.currentEvm}`);
      console.log(`   Generate Solana: New wallet needed`);
      console.log('');
    });
  }

  if (analysis.generateSolanaOnly.length > 0) {
    console.log('🔑 STEP 3: Generate Solana wallets (email-only users)');
    console.log('====================================================');
    analysis.generateSolanaOnly.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.email})`);
      console.log(`   Generate Solana: New wallet needed`);
      console.log('');
    });
  }

  if (analysis.noActionNeeded.length > 0) {
    console.log('✅ USERS WITH EXTERNAL SOLANA WALLETS (No action needed)');
    console.log('========================================================');
    analysis.noActionNeeded.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.email})`);
      console.log(`   External Solana: ${user.currentSolana}`);
      console.log('');
    });
  }

  // Save analysis
  const timestamp = new Date().toISOString();
  const results = {
    ...analysis,
    timestamp,
    summary: {
      total: USERS_FROM_SCREENSHOTS.length,
      removeEvmOnly: analysis.removeEvmOnly.length,
      removeEvmAndGenerateSolana: analysis.removeEvmAndGenerateSolana.length,
      generateSolanaOnly: analysis.generateSolanaOnly.length,
      noActionNeeded: analysis.noActionNeeded.length,
      notFound: analysis.notFound.length
    }
  };

  const resultsPath = path.join(__dirname, '..', 'precise-wallet-analysis.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`📄 Detailed analysis saved to: ${resultsPath}`);

  return results;
}

// Run analysis
if (require.main === module) {
  analyzePreciseWalletNeeds()
    .then((results) => {
      console.log('\n🎉 Precise wallet analysis completed!');
      console.log(`\n📋 Actions needed for ${results.summary.removeEvmOnly + results.summary.removeEvmAndGenerateSolana + results.summary.generateSolanaOnly} users`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Analysis failed:', error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}

module.exports = { analyzePreciseWalletNeeds };
