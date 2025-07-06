#!/usr/bin/env node

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('🔍 Investigating Privy API Endpoints...\n');

// Check environment variables
if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID || !process.env.PRIVY_APP_SECRET) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

// Prepare API configuration
const authString = `${process.env.NEXT_PUBLIC_PRIVY_APP_ID}:${process.env.PRIVY_APP_SECRET}`;
const authHeader = `Basic ${Buffer.from(authString).toString('base64')}`;

const headers = {
  'Content-Type': 'application/json',
  'privy-app-id': process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  'Authorization': authHeader
};

async function testApiEndpoints() {
  console.log('🧪 Testing different API endpoints and formats...\n');
  
  // Test 1: Get all users to understand the data structure
  console.log('1️⃣ Testing GET /v1/users (to understand user structure)');
  try {
    const response = await fetch('https://auth.privy.io/api/v1/users', {
      method: 'GET',
      headers: headers
    });
    
    console.log('   Status:', response.status, response.statusText);
    
    if (response.ok) {
      const users = await response.json();
      console.log('   ✅ Users found:', users.length || 'N/A');
      
      if (users.length > 0) {
        const firstUser = users[0];
        console.log('   📋 First user structure:');
        console.log('      ID:', firstUser.id);
        console.log('      Linked accounts:', firstUser.linked_accounts?.length || 0);
        
        // Look for wallet information
        if (firstUser.linked_accounts) {
          const wallets = firstUser.linked_accounts.filter(acc => 
            acc.type === 'wallet' || acc.type === 'ethereum' || acc.type === 'solana'
          );
          console.log('      Wallets found:', wallets.length);
          
          wallets.forEach((wallet, index) => {
            console.log(`      Wallet ${index + 1}:`, {
              type: wallet.type,
              address: wallet.address,
              chain_type: wallet.chain_type,
              wallet_id: wallet.wallet_id,
              id: wallet.id
            });
          });
        }
      }
    } else {
      const errorText = await response.text();
      console.log('   ❌ Error:', errorText);
    }
  } catch (error) {
    console.error('   ❌ Network error:', error.message);
  }
  
  console.log('\n');
  
  // Test 2: Try the wallet API endpoint with different base URLs
  const testWalletId = 'x9omKoj35rmeeeSktmTnqx'; // From your screenshots
  
  const endpointsToTest = [
    `https://api.privy.io/v1/wallets/${testWalletId}`,
    `https://auth.privy.io/api/v1/wallets/${testWalletId}`,
    `https://api.privy.io/v1/users/wallets/${testWalletId}`,
    `https://auth.privy.io/api/v1/users/wallets/${testWalletId}`
  ];
  
  for (let i = 0; i < endpointsToTest.length; i++) {
    const endpoint = endpointsToTest[i];
    console.log(`${i + 2}️⃣ Testing GET ${endpoint}`);
    
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: headers
      });
      
      console.log('   Status:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('   ✅ Success! Data:', JSON.stringify(data, null, 2));
      } else {
        const errorText = await response.text();
        console.log('   ❌ Error:', errorText);
      }
    } catch (error) {
      console.error('   ❌ Network error:', error.message);
    }
    
    console.log('');
  }
  
  // Test 3: Try to get all wallets
  console.log('6️⃣ Testing GET /v1/wallets (get all wallets)');
  try {
    const response = await fetch('https://api.privy.io/v1/wallets', {
      method: 'GET',
      headers: headers
    });
    
    console.log('   Status:', response.status, response.statusText);
    
    if (response.ok) {
      const wallets = await response.json();
      console.log('   ✅ Wallets found:', wallets.length || 'N/A');
      
      if (wallets.length > 0) {
        console.log('   📋 First wallet structure:');
        console.log(JSON.stringify(wallets[0], null, 2));
      }
    } else {
      const errorText = await response.text();
      console.log('   ❌ Error:', errorText);
    }
  } catch (error) {
    console.error('   ❌ Network error:', error.message);
  }
  
  console.log('\n🎯 Investigation complete!');
  console.log('Check the output above to understand:');
  console.log('   • Correct API endpoints');
  console.log('   • Proper wallet ID format');
  console.log('   • Available wallet data structure');
}

testApiEndpoints();
