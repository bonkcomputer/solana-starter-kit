#!/usr/bin/env node

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('🗑️ Executing Bulk Wallet Deletion...\n');

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
    
    console.log(`⏳ Deleting ${index + 1}/${evmWallets.length}: ${wallet.address}`);
    console.log(`   Wallet ID: ${wallet.walletId}`);
    
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
      console.log(`✅ SUCCESS: Wallet deleted (${response.status})`);
      result.message = 'Wallet successfully deleted';
      
      // Try to get response body
      try {
        const responseText = await response.text();
        if (responseText) {
          result.responseBody = responseText;
        }
      } catch (e) {
        // No response body
      }
      
    } else {
      console.log(`❌ FAILED: ${response.status} ${response.statusText}`);
      
      try {
        const errorText = await response.text();
        result.error = errorText;
        console.log(`   Error: ${errorText}`);
      } catch (e) {
        result.error = 'No error details available';
      }
      
      // Provide specific guidance based on status code
      if (response.status === 404) {
        console.log('   → Wallet not found (may already be deleted)');
        result.message = 'Wallet not found - may already be deleted';
      } else if (response.status === 401) {
        console.log('   → Authentication failed');
        result.message = 'Authentication failed';
      } else if (response.status === 403) {
        console.log('   → Access forbidden');
        result.message = 'Access forbidden';
      } else if (response.status === 429) {
        console.log('   → Rate limited');
        result.message = 'Rate limited';
      }
    }
    
    console.log(''); // Empty line for readability
    return result;
    
  } catch (error) {
    console.error(`❌ Network Error for ${wallet.address}:`, error.message);
    console.log(''); // Empty line for readability
    
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

async function executeBulkDeletion() {
  const results = [];
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  console.log('🚀 Starting bulk wallet deletion...\n');
  console.log('⚠️  This will attempt to delete all 32 EVM wallets\n');
  
  let successCount = 0;
  let notFoundCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < evmWallets.length; i++) {
    const wallet = evmWallets[i];
    const result = await deleteWallet(wallet, i);
    results.push(result);
    
    // Track results
    if (result.success) {
      successCount++;
    } else if (result.status === 404) {
      notFoundCount++;
    } else {
      errorCount++;
    }
    
    // Add delay to avoid rate limiting (except for last request)
    if (i < evmWallets.length - 1) {
      console.log('⏱️  Waiting 2 seconds to avoid rate limiting...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Save detailed results
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
  console.log('🎯 BULK DELETION COMPLETE!\n');
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
  
  if (errorCount > 0) {
    console.log('\n⚠️  ' + errorCount + ' wallets had errors - check the results file for details');
  }
  
  console.log('\n🔄 Next Steps:');
  console.log('   1. Review the results file for detailed information');
  console.log('   2. Generate Solana wallets for users whose EVM wallets were deleted');
  console.log('   3. Update the database with new Solana addresses');
  console.log('   4. Verify all users have proper Solana wallet access');
  
  return results;
}

// Execute bulk deletion
executeBulkDeletion().catch(error => {
  console.error('❌ Bulk deletion failed:', error.message);
  process.exit(1);
});
