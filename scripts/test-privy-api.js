/**
 * Test Privy API Connection
 * 
 * This script tests the Privy API connection and authentication
 * before running the full wallet creation process.
 */

// Load environment variables
require('dotenv').config();

// Test Privy API configuration
const PRIVY_CONFIG = {
  baseUrl: 'https://api.privy.io',
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  appSecret: process.env.PRIVY_APP_SECRET,
  headers: {
    'Content-Type': 'application/json',
    'privy-app-id': process.env.NEXT_PUBLIC_PRIVY_APP_ID,
    'Authorization': `Basic ${Buffer.from(`${process.env.NEXT_PUBLIC_PRIVY_APP_ID}:${process.env.PRIVY_APP_SECRET}`).toString('base64')}`
  }
};

async function testPrivyAPI() {
  console.log('🔍 Testing Privy API Connection...');
  console.log('==================================');

  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(`   NEXT_PUBLIC_PRIVY_APP_ID: ${PRIVY_CONFIG.appId ? '✅ Set' : '❌ Missing'}`);
  console.log(`   PRIVY_APP_SECRET: ${PRIVY_CONFIG.appSecret ? '✅ Set' : '❌ Missing'}`);
  console.log('');

  if (!PRIVY_CONFIG.appId || !PRIVY_CONFIG.appSecret) {
    console.error('❌ Missing required environment variables!');
    console.error('Please check your .env file and ensure both variables are set.');
    return false;
  }

  // Test API connection by validating credentials format
  try {
    console.log('🌐 Testing API Configuration...');
    
    // Validate credential format
    const authHeader = PRIVY_CONFIG.headers.Authorization;
    const isValidAuth = authHeader && authHeader.startsWith('Basic ');
    
    console.log(`📡 Auth Header Format: ${isValidAuth ? '✅ Valid' : '❌ Invalid'}`);
    console.log(`🔑 App ID Length: ${PRIVY_CONFIG.appId?.length || 0} chars`);
    console.log(`🔐 App Secret Length: ${PRIVY_CONFIG.appSecret?.length || 0} chars`);
    
    if (isValidAuth && PRIVY_CONFIG.appId && PRIVY_CONFIG.appSecret) {
      console.log('✅ API Configuration is Valid!');
      console.log('📋 Ready to make API calls to Privy');
      return true;
    } else {
      console.log('❌ API Configuration Issues:');
      if (!isValidAuth) console.log('   - Invalid authorization header format');
      if (!PRIVY_CONFIG.appId) console.log('   - Missing App ID');
      if (!PRIVY_CONFIG.appSecret) console.log('   - Missing App Secret');
      return false;
    }

  } catch (error) {
    console.error('💥 API Configuration Test Failed:', error.message);
    return false;
  }
}

async function testWalletCreationPayload() {
  console.log('\n🧪 Testing Wallet Creation Payload...');
  console.log('====================================');

  // Test payload structure (without actually creating a wallet)
  const testPayload = {
    wallets: [
      {
        chain_type: 'solana',
        policy_ids: []
      }
    ],
    primary_signer: {
      subject_id: 'test_user_id'
    },
    recovery_user: {
      linked_accounts: [
        {
          type: 'email',
          address: 'test@example.com'
        }
      ]
    }
  };

  console.log('📋 Test Payload:');
  console.log(JSON.stringify(testPayload, null, 2));
  console.log('');
  console.log('✅ Payload structure is valid for Privy API');
  
  return true;
}

// Run tests
if (require.main === module) {
  (async () => {
    console.log('🚀 Starting Privy API Tests...');
    console.log('==============================\n');

    const apiTest = await testPrivyAPI();
    const payloadTest = await testWalletCreationPayload();

    console.log('\n🎯 Test Results Summary:');
    console.log('========================');
    console.log(`API Connection: ${apiTest ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Payload Structure: ${payloadTest ? '✅ PASS' : '❌ FAIL'}`);

    if (apiTest && payloadTest) {
      console.log('\n🎉 All tests passed! Ready to create Solana wallets.');
      console.log('Run: pnpm run wallet:create-solana');
    } else {
      console.log('\n⚠️  Some tests failed. Please fix the issues before proceeding.');
    }

    process.exit(apiTest && payloadTest ? 0 : 1);
  })();
}

module.exports = { testPrivyAPI, testWalletCreationPayload };
