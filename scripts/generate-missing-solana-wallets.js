#!/usr/bin/env node

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('🔑 Generating Missing Solana Wallets...\n');

// Check environment variables
if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID || !process.env.PRIVY_APP_SECRET) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

// Users identified as needing Solana wallets from the analysis
const usersNeedingWallets = [
  { id: 'cmcb0329v001vjl0lck1wpsz2', email: 'ruggedwojak@proton.me' },
  { id: 'cmcb29j19005ijp0n6rsp06v8', email: 'ordinalservice@gmail.com' },
  { id: 'cmcjwu1kt00zfl90nczx7sluo', email: 'soulsete@naver.com' },
  { id: 'cmclw4z6f033hlk0n9uwdzu8l', email: 'farfouch2@gmail.com' },
  { id: 'cmclwesvw022dl70nkz3eu4yp', email: 'camden26@hotmail.com' },
  { id: 'cmcm94tji01u9lj0max56h28m', email: 'allisobhan4@gmail.com' },
  { id: 'cmcn9e9rk03aild0lk836kqez', email: 'bonkcomputer6@gmail.com' },
  { id: 'cmcnhu3xn0361ky0n7w0rxrsm', email: 'boredgucciape@gmail.com' }
];

// Prepare API configuration
const authString = `${process.env.NEXT_PUBLIC_PRIVY_APP_ID}:${process.env.PRIVY_APP_SECRET}`;
const authHeader = `Basic ${Buffer.from(authString).toString('base64')}`;

const headers = {
  'Content-Type': 'application/json',
  'privy-app-id': process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  'Authorization': authHeader
};

async function createSolanaWalletForUser(user) {
  try {
    console.log(`⏳ Creating Solana wallet for: ${user.email} (${user.id})`);
    
    const response = await fetch(`https://api.privy.io/v1/users/${user.id}/wallets`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        wallets: [
          {
            chain_type: 'solana'
          }
        ]
      })
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log(`   ✅ SUCCESS: Solana wallet created`);
      
      // Extract wallet address if available
      let walletAddress = 'Address not in response';
      if (result.linked_accounts) {
        const solanaWallet = result.linked_accounts.find(acc => 
          acc.type === 'wallet' && acc.chain_type === 'solana'
        );
        if (solanaWallet) {
          walletAddress = solanaWallet.address;
        }
      }
      
      console.log(`   📍 Wallet Address: ${walletAddress}`);
      
      return {
        success: true,
        userId: user.id,
        email: user.email,
        walletAddress: walletAddress,
        response: result
      };
    } else {
      const errorText = await response.text();
      console.log(`   ❌ FAILED: ${errorText}`);
      
      return {
        success: false,
        userId: user.id,
        email: user.email,
        error: errorText,
        status: response.status
      };
    }
  } catch (error) {
    console.log(`   ❌ NETWORK ERROR: ${error.message}`);
    
    return {
      success: false,
      userId: user.id,
      email: user.email,
      error: error.message,
      networkError: true
    };
  }
}

async function generateMissingSolanaWallets() {
  console.log(`🚀 Starting Solana wallet generation for ${usersNeedingWallets.length} users...\n`);
  
  const results = [];
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < usersNeedingWallets.length; i++) {
    const user = usersNeedingWallets[i];
    console.log(`\n📍 Processing ${i + 1}/${usersNeedingWallets.length}:`);
    
    const result = await createSolanaWalletForUser(user);
    results.push(result);
    
    if (result.success) {
      successCount++;
    } else {
      errorCount++;
    }
    
    // Add delay to avoid rate limiting
    if (i < usersNeedingWallets.length - 1) {
      console.log('   ⏱️  Waiting 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Save results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultsFile = path.join(__dirname, '..', `solana-wallet-generation-${timestamp}.json`);
  
  const summaryData = {
    timestamp: new Date().toISOString(),
    summary: {
      total: usersNeedingWallets.length,
      successful: successCount,
      errors: errorCount,
      successRate: ((successCount / usersNeedingWallets.length) * 100).toFixed(1) + '%'
    },
    results: results
  };
  
  fs.writeFileSync(resultsFile, JSON.stringify(summaryData, null, 2));
  
  // Print final summary
  console.log('\n🎯 SOLANA WALLET GENERATION COMPLETE!\n');
  console.log('📊 Final Summary:');
  console.log('   Total users:', usersNeedingWallets.length);
  console.log('   ✅ Successful:', successCount);
  console.log('   ❌ Errors:', errorCount);
  console.log('   📈 Success rate:', summaryData.summary.successRate);
  console.log('   📄 Results saved to:', resultsFile);
  
  if (successCount > 0) {
    console.log('\n🎉 Successfully created Solana wallets for:');
    results.filter(r => r.success).forEach(r => {
      console.log(`   ✅ ${r.email}: ${r.walletAddress}`);
    });
  }
  
  if (errorCount > 0) {
    console.log('\n⚠️  Failed to create wallets for:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   ❌ ${r.email}: ${r.error}`);
    });
  }
  
  console.log('\n🔄 Next Steps:');
  console.log('   1. Update your database with the new Solana addresses');
  console.log('   2. Verify all users can access the app');
  console.log('   3. Test Solana-dependent features');
  
  return results;
}

// Execute wallet generation
generateMissingSolanaWallets().catch(error => {
  console.error('❌ Wallet generation failed:', error.message);
  process.exit(1);
});
