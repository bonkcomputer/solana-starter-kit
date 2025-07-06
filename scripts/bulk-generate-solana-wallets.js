#!/usr/bin/env node

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('🔄 Bulk Solana Wallet Generation...\n');

// Check environment variables
if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID || !process.env.PRIVY_APP_SECRET) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_PRIVY_APP_ID:', process.env.NEXT_PUBLIC_PRIVY_APP_ID ? '✅ Set' : '❌ Missing');
  console.error('   PRIVY_APP_SECRET:', process.env.PRIVY_APP_SECRET ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

// Read wallet replacement instructions
const instructionsPath = path.join(__dirname, '..', 'privy-wallet-replacement-instructions.json');
if (!fs.existsSync(instructionsPath)) {
  console.error('❌ Instructions file not found. Run: pnpm run wallet:replace-evm first');
  process.exit(1);
}

const instructions = JSON.parse(fs.readFileSync(instructionsPath, 'utf8'));
const evmWallets = instructions.evmWalletsToReplace || [];

console.log('📊 Found ' + evmWallets.length + ' users needing Solana wallets\n');

// Prepare API configuration
const authString = `${process.env.NEXT_PUBLIC_PRIVY_APP_ID}:${process.env.PRIVY_APP_SECRET}`;
const authHeader = `Basic ${Buffer.from(authString).toString('base64')}`;

const headers = {
  'Content-Type': 'application/json',
  'privy-app-id': process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  'Authorization': authHeader
};

async function generateSolanaWallet(userId) {
  try {
    const response = await fetch('https://api.privy.io/v1/wallets_with_recovery', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        chain_type: 'solana',
        owner: {
          user_id: userId
        }
      })
    });

    if (response.ok) {
      const walletData = await response.json();
      return {
        success: true,
        wallet: walletData
      };
    } else {
      const errorText = await response.text();
      return {
        success: false,
        error: `${response.status}: ${errorText}`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function bulkGenerateSolanaWallets() {
  const results = [];
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  console.log('🔄 Starting bulk Solana wallet generation...\n');
  
  for (let i = 0; i < evmWallets.length; i++) {
    const wallet = evmWallets[i];
    console.log(`⏳ Processing ${i + 1}/${evmWallets.length}: ${wallet.address}`);
    
    // Note: We need to extract user ID from the wallet data
    // This might require additional API calls to get user info
    console.log('   Wallet ID:', wallet.walletId);
    
    // For now, we'll generate the API call structure
    const result = {
      originalWallet: wallet,
      index: i + 1,
      timestamp: new Date().toISOString(),
      status: 'pending',
      note: 'Need to extract user ID from wallet data first'
    };
    
    results.push(result);
    
    // Add delay to avoid rate limiting
    if (i < evmWallets.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Save results
  const resultsFile = path.join(__dirname, '..', `solana-wallet-generation-${timestamp}.json`);
  fs.writeFileSync(resultsFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalWallets: evmWallets.length,
    results: results,
    nextSteps: [
      'Extract user IDs from wallet data',
      'Generate Solana wallets for each user',
      'Update database with new Solana addresses'
    ]
  }, null, 2));
  
  console.log('\n📋 Generation Plan Created:');
  console.log('   File:', resultsFile);
  console.log('   Total wallets to generate:', evmWallets.length);
  
  console.log('\n🔧 Next Steps:');
  console.log('   1. Extract user IDs from deleted wallet data');
  console.log('   2. Generate Solana wallets for each user');
  console.log('   3. Update database with new addresses');
  
  return results;
}

// Execute bulk generation
bulkGenerateSolanaWallets();
