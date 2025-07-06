#!/usr/bin/env node

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('🔧 Correct Wallet Management via Users API...\n');

// Check environment variables
if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID || !process.env.PRIVY_APP_SECRET) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

// Prepare API configuration for auth.privy.io (users API)
const authString = `${process.env.NEXT_PUBLIC_PRIVY_APP_ID}:${process.env.PRIVY_APP_SECRET}`;
const authHeader = `Basic ${Buffer.from(authString).toString('base64')}`;

const authHeaders = {
  'Authorization': authHeader,
  'privy-app-id': process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  'Content-Type': 'application/json'
};

// Prepare API configuration for api.privy.io (wallets API)
const apiHeaders = {
  'Authorization': authHeader,
  'privy-app-id': process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  'Content-Type': 'application/json'
};

async function getAllUsers() {
  try {
    console.log('📊 Fetching all users from Privy...');
    
    const response = await fetch('https://auth.privy.io/api/v1/users', {
      method: 'GET',
      headers: authHeaders
    });
    
    console.log('   Status:', response.status, response.statusText);
    
    if (response.ok) {
      const users = await response.json();
      console.log('   ✅ Users found:', users.length);
      return users;
    } else {
      const errorText = await response.text();
      console.log('   ❌ Error:', errorText);
      return [];
    }
  } catch (error) {
    console.error('   ❌ Network error:', error.message);
    return [];
  }
}

async function analyzeUserWallets(users) {
  console.log('\n🔍 Analyzing user wallets...');
  
  const usersWithEVM = [];
  const usersWithSolana = [];
  const usersWithBoth = [];
  const usersWithNoWallets = [];
  
  users.forEach(user => {
    const linkedAccounts = user.linked_accounts || [];
    
    const evmWallets = linkedAccounts.filter(acc => 
      acc.type === 'wallet' && (acc.chain_type === 'ethereum' || acc.address?.startsWith('0x'))
    );
    
    const solanaWallets = linkedAccounts.filter(acc => 
      acc.type === 'wallet' && acc.chain_type === 'solana'
    );
    
    const userInfo = {
      id: user.id,
      email: linkedAccounts.find(acc => acc.type === 'email')?.address || 'No email',
      evmWallets: evmWallets,
      solanaWallets: solanaWallets,
      allWallets: linkedAccounts.filter(acc => acc.type === 'wallet')
    };
    
    if (evmWallets.length > 0 && solanaWallets.length > 0) {
      usersWithBoth.push(userInfo);
    } else if (evmWallets.length > 0) {
      usersWithEVM.push(userInfo);
    } else if (solanaWallets.length > 0) {
      usersWithSolana.push(userInfo);
    } else {
      usersWithNoWallets.push(userInfo);
    }
  });
  
  console.log('\n📊 Wallet Analysis Results:');
  console.log('   👥 Total users:', users.length);
  console.log('   🔗 Users with EVM only:', usersWithEVM.length);
  console.log('   ⚡ Users with Solana only:', usersWithSolana.length);
  console.log('   🔄 Users with both EVM + Solana:', usersWithBoth.length);
  console.log('   ❌ Users with no wallets:', usersWithNoWallets.length);
  
  // Show detailed info for users with EVM wallets
  const evmUsers = [...usersWithEVM, ...usersWithBoth];
  
  if (evmUsers.length > 0) {
    console.log('\n🎯 Users with EVM wallets (need cleanup):');
    evmUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.id})`);
      user.evmWallets.forEach(wallet => {
        console.log(`      🔗 EVM: ${wallet.address} (${wallet.wallet_id || 'No wallet_id'})`);
      });
      user.solanaWallets.forEach(wallet => {
        console.log(`      ⚡ Solana: ${wallet.address} (${wallet.wallet_id || 'No wallet_id'})`);
      });
    });
  }
  
  return {
    usersWithEVM,
    usersWithSolana,
    usersWithBoth,
    usersWithNoWallets,
    evmUsers
  };
}

async function createSolanaWalletForUser(userId) {
  try {
    console.log(`   Creating Solana wallet for user: ${userId}`);
    
    const response = await fetch(`https://api.privy.io/v1/users/${userId}/wallets`, {
      method: 'POST',
      headers: apiHeaders,
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
      console.log(`   ✅ Solana wallet created successfully`);
      return { success: true, data: result };
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Error: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.log(`   ❌ Network error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Starting correct wallet management process...\n');
  
  // Step 1: Get all users
  const users = await getAllUsers();
  
  if (users.length === 0) {
    console.log('❌ No users found or API error. Cannot proceed.');
    return;
  }
  
  // Step 2: Analyze wallets
  const analysis = await analyzeUserWallets(users);
  
  // Step 3: Save analysis results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const analysisFile = path.join(__dirname, '..', `wallet-analysis-${timestamp}.json`);
  
  fs.writeFileSync(analysisFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      totalUsers: users.length,
      evmOnly: analysis.usersWithEVM.length,
      solanaOnly: analysis.usersWithSolana.length,
      both: analysis.usersWithBoth.length,
      noWallets: analysis.usersWithNoWallets.length
    },
    usersNeedingCleanup: analysis.evmUsers,
    allUsers: users
  }, null, 2));
  
  console.log(`\n📄 Analysis saved to: ${analysisFile}`);
  
  // Step 4: Offer to create Solana wallets for users who need them
  const usersNeedingSolana = analysis.usersWithEVM; // Users with EVM only
  
  if (usersNeedingSolana.length > 0) {
    console.log(`\n🔄 Found ${usersNeedingSolana.length} users with EVM-only wallets`);
    console.log('These users need Solana wallets generated.');
    
    // For now, just report. In the next step, we can generate Solana wallets
    console.log('\n🎯 Next Steps:');
    console.log('   1. Review the analysis file');
    console.log('   2. Generate Solana wallets for EVM-only users');
    console.log('   3. Update database with new wallet addresses');
    console.log('   4. Remove EVM wallet references from users (if possible via API)');
  }
  
  console.log('\n✅ Wallet management analysis complete!');
}

main().catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});
