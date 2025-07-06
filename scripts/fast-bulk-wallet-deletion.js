#!/usr/bin/env node

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('🚀 Fast Bulk Wallet Deletion...\n');

// Check environment variables
if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID || !process.env.PRIVY_APP_SECRET) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

// Read wallet replacement instructions
const instructionsPath = path.join(__dirname, '..', 'privy-wallet-replacement-instructions.json');
const instructions = JSON.parse(fs.readFileSync(instructionsPath, 'utf8'));
const evmWallets = instructions.evmWalletsToReplace || [];

console.log('📊 Found ' + evmWallets.length + ' EVM wallets to delete\n');

// Prepare API configuration
const authString = `${process.env.NEXT_PUBLIC_PRIVY_APP_ID}:${process.env.PRIVY_APP_SECRET}`;
const authHeader = `Basic ${Buffer.from(authString).toString('base64')}`;

const headers = {
  'Content-Type': 'application/json',
  'privy-app-id': process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  'Authorization': authHeader
};

async function deleteWallet(wallet, index) {
  try {
    const apiUrl = `https://api.privy.io/v1/wallets/${wallet.walletId}`;
    
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: headers
    });

    const result = {
      index: index + 1,
      walletId: wallet.walletId,
      address: wallet.address,
      timestamp: new Date().toISOString(),
      status: response.status,
      statusText: response.statusText,
      success: response.ok
    };

    if (response.ok) {
      console.log(`✅ ${index + 1}/32: DELETED ${wallet.address}`);
      result.message = 'Successfully deleted';
    } else {
      console.log(`❌ ${index + 1}/32: FAILED ${wallet.address} (${response.status})`);
      
      if (response.status === 404) {
        result.message = 'Not found - may already be deleted';
      } else if (response.status === 401) {
        result.message = 'Authentication failed';
      } else {
        result.message = `Error: ${response.status} ${response.statusText}`;
      }
      
      try {
        const errorText = await response.text();
        result.error = errorText;
      } catch (e) {
        // No error body
      }
    }
    
    return result;
    
  } catch (error) {
    console.error(`❌ ${index + 1}/32: NETWORK ERROR ${wallet.address}`);
    return {
      index: index + 1,
      walletId: wallet.walletId,
      address: wallet.address,
      timestamp: new Date().toISOString(),
      success: false,
      error: error.message,
      message: 'Network error'
    };
  }
}

async function executeFastBulkDeletion() {
  console.log('🚀 Starting fast bulk deletion (parallel processing)...\n');
  
  // Process in batches of 5 to avoid overwhelming the API
  const batchSize = 5;
  const results = [];
  
  for (let i = 0; i < evmWallets.length; i += batchSize) {
    const batch = evmWallets.slice(i, i + batchSize);
    console.log(`📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(evmWallets.length/batchSize)}...`);
    
    const batchPromises = batch.map((wallet, batchIndex) => 
      deleteWallet(wallet, i + batchIndex)
    );
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Small delay between batches
    if (i + batchSize < evmWallets.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Calculate summary
  const successCount = results.filter(r => r.success).length;
  const notFoundCount = results.filter(r => r.status === 404).length;
  const errorCount = results.filter(r => !r.success && r.status !== 404).length;
  
  // Save results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultsFile = path.join(__dirname, '..', `wallet-deletion-results-${timestamp}.json`);
  
  const summaryData = {
    timestamp: new Date().toISOString(),
    summary: {
      total: evmWallets.length,
      successful: successCount,
      notFound: notFoundCount,
      errors: errorCount,
      successRate: ((successCount / evmWallets.length) * 100).toFixed(1) + '%'
    },
    results: results
  };
  
  fs.writeFileSync(resultsFile, JSON.stringify(summaryData, null, 2));
  
  // Print final summary
  console.log('\n🎯 FAST BULK DELETION COMPLETE!\n');
  console.log('📊 Final Summary:');
  console.log('   Total wallets:', evmWallets.length);
  console.log('   ✅ Successfully deleted:', successCount);
  console.log('   🔍 Not found (404):', notFoundCount);
  console.log('   ❌ Errors:', errorCount);
  console.log('   📈 Success rate:', summaryData.summary.successRate);
  console.log('   📄 Results saved to:', resultsFile);
  
  if (successCount > 0) {
    console.log('\n🎉 ' + successCount + ' wallets were successfully deleted!');
  }
  
  if (notFoundCount > 0) {
    console.log('\n🔍 ' + notFoundCount + ' wallets were not found (may already be deleted)');
  }
  
  console.log('\n🔄 Next Steps:');
  console.log('   1. Generate Solana wallets for users whose EVM wallets were deleted');
  console.log('   2. Update the database with new Solana addresses');
  console.log('   3. Verify all users have proper Solana wallet access');
  
  return results;
}

// Execute fast bulk deletion
executeFastBulkDeletion().catch(error => {
  console.error('❌ Fast bulk deletion failed:', error.message);
  process.exit(1);
});
