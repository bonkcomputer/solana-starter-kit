#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Generating Simple Wallet Deletion Commands...\n');

// Read the wallet replacement instructions
const instructionsPath = path.join(__dirname, '..', 'privy-wallet-replacement-instructions.json');

if (!fs.existsSync(instructionsPath)) {
  console.error('❌ Instructions file not found. Run: pnpm run wallet:replace-evm first');
  process.exit(1);
}

const instructions = JSON.parse(fs.readFileSync(instructionsPath, 'utf8'));
const evmWallets = instructions.evmWalletsToReplace || [];

console.log('📊 Found ' + evmWallets.length + ' EVM wallets to delete\n');

console.log('🗑️  WALLET DELETION COMMANDS:\n');
console.log('# Set your environment variables first:');
console.log('# export NEXT_PUBLIC_PRIVY_APP_ID="your_app_id"');
console.log('# export PRIVY_APP_SECRET="your_app_secret"\n');

// Generate simple curl commands
evmWallets.forEach((wallet, index) => {
  console.log('# Delete wallet ' + (index + 1) + '/' + evmWallets.length + ': ' + wallet.address);
  console.log('curl -X DELETE "https://api.privy.io/v1/wallets/' + wallet.walletId + '" \\');
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -H "privy-app-id: $NEXT_PUBLIC_PRIVY_APP_ID" \\');
  console.log('  -H "Authorization: Basic $(echo -n \'$NEXT_PUBLIC_PRIVY_APP_ID:$PRIVY_APP_SECRET\' | base64)"');
  console.log('');
});

console.log('\n🪟 POWERSHELL VERSION (Windows):\n');
console.log('# Set environment variables in PowerShell:');
console.log('# $env:NEXT_PUBLIC_PRIVY_APP_ID="your_app_id"');
console.log('# $env:PRIVY_APP_SECRET="your_app_secret"\n');

evmWallets.forEach((wallet, index) => {
  console.log('# Delete wallet ' + (index + 1) + '/' + evmWallets.length + ': ' + wallet.address);
  console.log('curl -X DELETE "https://api.privy.io/v1/wallets/' + wallet.walletId + '" `');
  console.log('  -H "Content-Type: application/json" `');
  console.log('  -H "privy-app-id: $env:NEXT_PUBLIC_PRIVY_APP_ID" `');
  console.log('  -H "Authorization: Basic $([Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes(\\"$env:NEXT_PUBLIC_PRIVY_APP_ID:$env:PRIVY_APP_SECRET\\")))"');
  console.log('');
});

console.log('\n✅ Generated ' + evmWallets.length + ' deletion commands');
console.log('\n⚠️  IMPORTANT:');
console.log('   • Test with one wallet first');
console.log('   • Backup your data before bulk deletion');
console.log('   • Generate Solana wallets after deletion');
console.log('   • Update your database with new Solana addresses');
