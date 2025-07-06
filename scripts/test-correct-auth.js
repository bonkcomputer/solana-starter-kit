#!/usr/bin/env node

require('dotenv').config();

console.log('🔍 Testing Correct Authentication Format...\n');

// Check environment variables
if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID || !process.env.PRIVY_APP_SECRET) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

console.log('🔧 Environment Variables:');
console.log('   NEXT_PUBLIC_PRIVY_APP_ID:', process.env.NEXT_PUBLIC_PRIVY_APP_ID);
console.log('   PRIVY_APP_SECRET:', process.env.PRIVY_APP_SECRET ? '[SET]' : '[MISSING]');
console.log('');

// Test different authentication formats
async function testAuthFormats() {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const appSecret = process.env.PRIVY_APP_SECRET;
  
  // Format 1: Basic Auth with -u flag format (username:password)
  const basicAuth1 = Buffer.from(`${appId}:${appSecret}`).toString('base64');
  
  // Format 2: Different header combinations
  const authConfigs = [
    {
      name: 'Config 1: Basic Auth + privy-app-id header',
      headers: {
        'Authorization': `Basic ${basicAuth1}`,
        'privy-app-id': appId,
        'Content-Type': 'application/json'
      }
    },
    {
      name: 'Config 2: Only Basic Auth',
      headers: {
        'Authorization': `Basic ${basicAuth1}`,
        'Content-Type': 'application/json'
      }
    },
    {
      name: 'Config 3: Basic Auth + different header name',
      headers: {
        'Authorization': `Basic ${basicAuth1}`,
        'privy-app-id': appId,
        'Content-Type': 'application/json'
      }
    }
  ];
  
  // Test endpoints
  const endpoints = [
    { name: 'Users API', url: 'https://auth.privy.io/api/v1/users' },
    { name: 'Wallets API', url: 'https://api.privy.io/v1/wallets' }
  ];
  
  for (const endpoint of endpoints) {
    console.log(`🎯 Testing ${endpoint.name}: ${endpoint.url}`);
    
    for (const config of authConfigs) {
      console.log(`   ${config.name}`);
      
      try {
        const response = await fetch(endpoint.url, {
          method: 'GET',
          headers: config.headers
        });
        
        console.log(`      Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`      ✅ SUCCESS! Data type: ${Array.isArray(data) ? 'Array' : typeof data}`);
          if (Array.isArray(data)) {
            console.log(`      📊 Count: ${data.length}`);
          }
        } else {
          const errorText = await response.text();
          console.log(`      ❌ Error: ${errorText}`);
        }
      } catch (error) {
        console.log(`      ❌ Network Error: ${error.message}`);
      }
      
      console.log('');
    }
    
    console.log('');
  }
}

testAuthFormats();
