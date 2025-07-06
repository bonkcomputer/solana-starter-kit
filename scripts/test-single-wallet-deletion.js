#!/usr/bin/env node

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Single Wallet Deletion...\n');

// Check environment variables
if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID || !process.env.PRIVY_APP_SECRET) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_PRIVY_APP_ID:', process.env.NEXT_PUBLIC_PRIVY_APP_ID ? '✅ Set' : '❌ Missing');
  console.error('   PRIVY_APP_SECRET:', process.env.PRIVY_APP_SECRET ? '✅ Set' : '❌ Missing');
  console.error('\nPlease set these in your .env file');
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

if (evmWallets.length === 0) {
  console.error('❌ No EVM wallets found to delete');
  process.exit(1);
}

// Select first wallet for testing
const testWallet = evmWallets[0];
console.log('🎯 Testing with wallet:');
console.log('   ID:', testWallet.walletId);
console.log('   Address:', testWallet.address);
console.log('   Chain:', testWallet.chain);

// Prepare API request
const apiUrl = `https://api.privy.io/v1/wallets/${testWallet.walletId}`;
const authString = `${process.env.NEXT_PUBLIC_PRIVY_APP_ID}:${process.env.PRIVY_APP_SECRET}`;
const authHeader = `Basic ${Buffer.from(authString).toString('base64')}`;

const headers = {
  'Content-Type': 'application/json',
  'privy-app-id': process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  'Authorization': authHeader
};

console.log('\n🔍 API Request Details:');
console.log('   URL:', apiUrl);
console.log('   Method: DELETE');
console.log('   Headers:', JSON.stringify(headers, null, 2));

async function testWalletDeletion() {
  try {
    console.log('\n⏳ Sending DELETE request...');
    
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: headers
    });

    console.log('\n📊 Response Status:', response.status, response.statusText);
    
    if (response.ok) {
      console.log('✅ SUCCESS: Wallet deletion request successful!');
      console.log('   Status:', response.status);
      
      // Try to get response body
      try {
        const responseText = await response.text();
        if (responseText) {
          console.log('   Response:', responseText);
        }
      } catch (e) {
        console.log('   (No response body)');
      }
      
      console.log('\n🎉 API Authentication is working correctly!');
      console.log('   You can now proceed with bulk deletion.');
      
    } else {
      console.log('❌ FAILED: Wallet deletion request failed');
      console.log('   Status:', response.status, response.statusText);
      
      try {
        const errorText = await response.text();
        console.log('   Error:', errorText);
      } catch (e) {
        console.log('   (No error details available)');
      }
      
      if (response.status === 401) {
        console.log('\n🔧 Authentication Issue:');
        console.log('   • Check your PRIVY_APP_SECRET is correct');
        console.log('   • Verify your NEXT_PUBLIC_PRIVY_APP_ID is correct');
        console.log('   • Ensure your Privy app has API access enabled');
      } else if (response.status === 404) {
        console.log('\n🔧 Wallet Not Found:');
        console.log('   • The wallet ID might be incorrect');
        console.log('   • The wallet might already be deleted');
        console.log('   • Check the Privy Dashboard for current wallet status');
      }
    }
    
  } catch (error) {
    console.error('❌ Network Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   • Check your internet connection');
    console.log('   • Verify the Privy API endpoint is accessible');
    console.log('   • Try again in a few moments');
  }
}

// Execute test
testWalletDeletion();
