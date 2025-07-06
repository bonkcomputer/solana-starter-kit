const { PrismaClient } = require('../src/generated/prisma');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

/**
 * Analyze wallet needs by parsing the CSV file and identifying users who need Solana wallets
 * 
 * This script will:
 * 1. Parse the CSV file to extract user data
 * 2. Identify users with EVM wallets but no Solana wallets
 * 3. Identify users with email accounts only (no wallets)
 * 4. Cross-reference with database to check current wallet status
 */

async function parseCSVAndAnalyzeWalletNeeds() {
  console.log('🔍 Parsing CSV and analyzing wallet needs...');
  console.log('==============================================');
  
  const csvPath = path.join(__dirname, '..', 'users', 'communitycenterusers7520258pm.csv');
  
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found: ${csvPath}`);
  }

  // Read and parse CSV
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  console.log(`📄 Found ${lines.length} lines in CSV (including header)`);
  
  if (lines.length < 2) {
    throw new Error('CSV file appears to be empty or only contains header');
  }

  // Parse header to understand column positions
  const header = lines[0].split('\t');
  const columnIndexes = {
    id: header.indexOf('ID'),
    createdAt: header.indexOf('Created at'),
    externalEthereum: header.indexOf('External Ethereum accounts'),
    externalSolana: header.indexOf('External Solana accounts'),
    embeddedEthereum: header.indexOf('Embedded Ethereum accounts'),
    embeddedSolana: header.indexOf('Embedded Solana accounts'),
    email: header.indexOf('Email account')
  };

  console.log('📋 Column indexes:', columnIndexes);

  const usersNeedingSolanaWallets = [];
  const usersWithSolanaWallets = [];
  const analysis = {
    total: 0,
    hasEVMNeedsSolana: [],
    hasEmailOnlyNeedsWallet: [],
    hasSolanaWallet: [],
    errors: []
  };

  // Process each user line (skip header)
  for (let i = 1; i < lines.length; i++) {
    try {
      const columns = lines[i].split('\t');
      
      if (columns.length < header.length) {
        console.log(`⚠️  Skipping line ${i + 1}: insufficient columns`);
        continue;
      }

      const user = {
        id: columns[columnIndexes.id]?.trim(),
        createdAt: columns[columnIndexes.createdAt]?.trim(),
        externalEthereum: columns[columnIndexes.externalEthereum]?.trim(),
        externalSolana: columns[columnIndexes.externalSolana]?.trim(),
        embeddedEthereum: columns[columnIndexes.embeddedEthereum]?.trim(),
        embeddedSolana: columns[columnIndexes.embeddedSolana]?.trim(),
        email: columns[columnIndexes.email]?.trim()
      };

      analysis.total++;

      // Check wallet status with detailed analysis
      const hasExternalEthereum = !!(user.externalEthereum && user.externalEthereum.trim());
      const hasEmbeddedEthereum = !!(user.embeddedEthereum && user.embeddedEthereum.trim());
      const hasExternalSolana = !!(user.externalSolana && user.externalSolana.trim());
      const hasEmbeddedSolana = !!(user.embeddedSolana && user.embeddedSolana.trim());
      const hasEmail = !!(user.email && user.email.trim());
      
      const hasEVMWallet = hasExternalEthereum || hasEmbeddedEthereum;
      const hasSolanaWallet = hasExternalSolana || hasEmbeddedSolana;
      const hasEmailOnly = hasEmail && !hasEVMWallet && !hasSolanaWallet;
      
      // Check for 0x addresses specifically
      const evmAddresses = [];
      if (hasExternalEthereum && user.externalEthereum.includes('0x')) {
        evmAddresses.push(`External: ${user.externalEthereum}`);
      }
      if (hasEmbeddedEthereum && user.embeddedEthereum.includes('0x')) {
        evmAddresses.push(`Embedded: ${user.embeddedEthereum}`);
      }

      console.log(`\n👤 User ${analysis.total}: ${user.id}`);
      console.log(`   Email: ${user.email || 'None'}`);
      console.log(`   External Ethereum: ${user.externalEthereum || 'None'}`);
      console.log(`   Embedded Ethereum: ${user.embeddedEthereum || 'None'}`);
      console.log(`   External Solana: ${user.externalSolana || 'None'}`);
      console.log(`   Embedded Solana: ${user.embeddedSolana || 'None'}`);
      console.log(`   EVM Wallet: ${hasEVMWallet ? 'Yes' : 'No'}`);
      console.log(`   Solana Wallet: ${hasSolanaWallet ? 'Yes' : 'No'}`);
      if (evmAddresses.length > 0) {
        console.log(`   EVM Addresses: ${evmAddresses.join(', ')}`);
      }

      if (hasEVMWallet && !hasSolanaWallet) {
        console.log(`   🔑 NEEDS SOLANA WALLET (has EVM)`);
        analysis.hasEVMNeedsSolana.push({
          ...user,
          reason: 'Has EVM wallet but no Solana wallet',
          evmAddresses
        });
        usersNeedingSolanaWallets.push(user);
      } else if (hasEmailOnly) {
        console.log(`   🔑 NEEDS SOLANA WALLET (email only)`);
        analysis.hasEmailOnlyNeedsWallet.push({
          ...user,
          reason: 'Email account only, no wallets'
        });
        usersNeedingSolanaWallets.push(user);
      } else if (hasSolanaWallet) {
        console.log(`   ✅ Has Solana wallet`);
        analysis.hasSolanaWallet.push(user);
        usersWithSolanaWallets.push(user);
      } else {
        console.log(`   ❓ Unknown wallet status`);
        console.log(`   Debug: hasEmail=${hasEmail}, hasEVMWallet=${hasEVMWallet}, hasSolanaWallet=${hasSolanaWallet}`);
      }

    } catch (error) {
      console.error(`❌ Error processing line ${i + 1}:`, error.message);
      analysis.errors.push({
        line: i + 1,
        error: error.message,
        content: lines[i]
      });
    }
  }

  // Summary
  console.log('\n📊 CSV Analysis Summary');
  console.log('=======================');
  console.log(`📋 Total users processed: ${analysis.total}`);
  console.log(`🔑 Users with EVM wallets needing Solana: ${analysis.hasEVMNeedsSolana.length}`);
  console.log(`📧 Users with email only needing wallets: ${analysis.hasEmailOnlyNeedsWallet.length}`);
  console.log(`✅ Users with Solana wallets: ${analysis.hasSolanaWallet.length}`);
  console.log(`❌ Errors: ${analysis.errors.length}`);
  console.log(`🎯 Total needing Solana wallets: ${usersNeedingSolanaWallets.length}`);

  // Cross-reference with database
  console.log('\n🔍 Cross-referencing with database...');
  console.log('====================================');

  const dbAnalysis = {
    foundInDB: [],
    notFoundInDB: [],
    alreadyHasSolanaInDB: [],
    needsUpdate: []
  };

  for (const user of usersNeedingSolanaWallets) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { privyDid: user.id },
        select: {
          privyDid: true,
          username: true,
          solanaWalletAddress: true,
          embeddedWalletAddress: true
        }
      });

      if (!dbUser) {
        console.log(`❌ User ${user.id} not found in database`);
        dbAnalysis.notFoundInDB.push(user);
      } else if (dbUser.solanaWalletAddress) {
        console.log(`✅ User ${user.email || user.id} already has Solana wallet in DB: ${dbUser.solanaWalletAddress}`);
        dbAnalysis.alreadyHasSolanaInDB.push({
          ...user,
          dbUser
        });
      } else {
        console.log(`🔑 User ${user.email || user.id} (${dbUser.username}) needs Solana wallet`);
        dbAnalysis.needsUpdate.push({
          ...user,
          dbUser
        });
      }
    } catch (error) {
      console.error(`❌ Database error for user ${user.id}:`, error.message);
    }
  }

  // Final summary
  console.log('\n🎯 Final Analysis Summary');
  console.log('=========================');
  console.log(`🔑 Users needing Solana wallets: ${dbAnalysis.needsUpdate.length}`);
  console.log(`✅ Users already have Solana wallets: ${dbAnalysis.alreadyHasSolanaInDB.length}`);
  console.log(`❌ Users not found in database: ${dbAnalysis.notFoundInDB.length}`);

  if (dbAnalysis.needsUpdate.length > 0) {
    console.log('\n🔑 Users who need Solana wallets:');
    console.log('=================================');
    dbAnalysis.needsUpdate.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email || 'No email'} (${user.dbUser.username})`);
      console.log(`   User ID: ${user.id}`);
      console.log(`   Reason: ${user.reason}`);
      console.log(`   Current embedded wallet: ${user.dbUser.embeddedWalletAddress || 'None'}`);
      console.log('');
    });
  }

  // Save results
  const results = {
    csvAnalysis: analysis,
    dbAnalysis,
    usersNeedingSolanaWallets: dbAnalysis.needsUpdate,
    timestamp: new Date().toISOString()
  };

  const resultsPath = path.join(__dirname, '..', 'wallet-needs-analysis.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`📄 Analysis saved to: ${resultsPath}`);

  return results;
}

// Run the analysis
if (require.main === module) {
  parseCSVAndAnalyzeWalletNeeds()
    .then((results) => {
      console.log('\n🎉 Analysis completed successfully!');
      console.log(`\n📋 Summary: ${results.usersNeedingSolanaWallets.length} users need Solana wallets`);
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

module.exports = { parseCSVAndAnalyzeWalletNeeds };
