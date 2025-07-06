// Load environment variables
require('dotenv').config();

const fs = require('fs');
const path = require('path');

/**
 * Privy Wallet Replacement
 * 
 * This script addresses the EVM wallets shown in the Privy Dashboard screenshots
 * by providing instructions and API calls to replace them with Solana wallets.
 * 
 * Since we got 401 errors with the API, this script provides the exact steps
 * and API calls needed to replace the EVM wallets with Solana wallets.
 */

// Configuration
const PRIVY_CONFIG = {
  baseUrl: 'https://api.privy.io',
  appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  appSecret: process.env.PRIVY_APP_SECRET
};

// Specific wallet IDs from the screenshots that have EVM addresses
const EVM_WALLETS_TO_REPLACE = [
  // From Screenshot 1
  { walletId: 'x9omKoj35rmeeeSktmTnqx', address: '0x2A8...O39f', chain: 'EVM' },
  { walletId: 'z5TmIn7kpT5Nn75vwmq', address: '0xBh...A3qP', chain: 'EVM' },
  { walletId: 'mkca3R79mPecSneytgmrdn', address: '0xf27...AeeA', chain: 'EVM' },
  { walletId: 'wOlgkungqGFc43xQebqzqe', address: '0xb42...d8G3', chain: 'EVM' },
  { walletId: '9ye4N35d9pj5exSvcqbqmse', address: '0xb5b...cbq5', chain: 'EVM' },
  { walletId: 'c8qndjvnoBqwstdvnbqyezTb', address: '0xbE5...099f', chain: 'EVM' },
  
  // From Screenshot 2
  { walletId: 'prWsNnz9cjQhT5eqy3qJc', address: '0x59c...k2B8', chain: 'EVM' },
  { walletId: 'eqjx9qyoP87cBqgocx3Tyqft', address: '0xnCf...k7eF', chain: 'EVM' },
  
  // From Screenshot 3
  { walletId: 'c84da9a25ZwreNelkSjco0', address: '0x207...4239', chain: 'EVM' },
  { walletId: 'neqhqbhb1H4h5vqgmgmgJ', address: '0xFqR...7kq8', chain: 'EVM' },
  { walletId: 'bqmWqJg3Sq5qbqhqgrmv', address: '0xL5q...8hqA', chain: 'EVM' },
  { walletId: 'qbmqrmqnr23SuBqAr5cjZ', address: '0x75R...k33q', chain: 'EVM' },
  { walletId: 'llmrJqcSSqrWqeqcqzqsH', address: '0xq23...df2E', chain: 'EVM' },
  { walletId: 'x7qmPmcqBqer57Svmtqrq3', address: '0x70...c8q0', chain: 'EVM' },
  { walletId: 'lPqhKPlmqcqmfqgqcrhwc', address: '0xqE...Bq7B', chain: 'EVM' },
  
  // From Screenshot 4
  { walletId: 'pqm7YqkqhmJPjpwqf23eq', address: '0xf74...C5H', chain: 'EVM' },
  { walletId: 'p6qrmhh5y7xr9SqQr9qd2', address: '0xqF5...3cq', chain: 'EVM' },
  { walletId: 'c5qkBqBcqm72YqwNqeJz', address: '0xhQ...qrTE', chain: 'EVM' },
  { walletId: 'rqcWqXqmgJqeqxSqmqcv', address: '0xhQ7...C5eq', chain: 'EVM' },
  { walletId: 'yqvSqrDqmqgqhYqrmqhQ', address: '0xhQ2...c6kq', chain: 'EVM' },
  { walletId: 'jbqqmrhqbqgbkbdqc7wQ', address: '4mQ8...kx3Y', chain: 'Solana' }, // This one is already Solana
  { walletId: 'U5qwrqhyqreqkBcqwqc3d6', address: '0xhQJ...23qB', chain: 'EVM' },
  { walletId: 'h2hkqnQT2Svmq3NwkqZm', address: '0x7Xqm...FUeN', chain: 'EVM' },
  { walletId: 'h2hkqnvqf5qnvqt5Pqkqc', address: '0x7B1...c99S', chain: 'EVM' },
  { walletId: 'q9jqRqhH5rjpvqkSqfq3', address: '0xqkh...kFqF', chain: 'EVM' },
  
  // From Screenshot 5
  { walletId: 'rFkqc2vmRSqmrqdc2Nqqm', address: '0x7FB...25kq', chain: 'EVM' },
  { walletId: 'rqnqXqRwqRdqkqmqhqhvq', address: '0xmqk...Dqst', chain: 'EVM' },
  { walletId: 'xhqqzBkP7Brqgqd6gqff', address: '0xqF3...37qf', chain: 'EVM' },
  { walletId: 'cyqShqgqc3HrPqdhqvqR', address: '0x7qB...4hqA', chain: 'EVM' },
  { walletId: 'qz7vqXvmqqqrqSqJqd6q', address: '0xbq7...qqf1', chain: 'EVM' },
  { walletId: '15zQ99zb2qkrqwrhqrq', address: '0xqA4...lPqL', chain: 'EVM' },
  { walletId: 'mkqxvSmvqq5ZlqPmwkqmq', address: '0xc5q...7q22', chain: 'EVM' },
  { walletId: 'pqm7YqkqhmJPjpwqf7S1x', address: '0xf73...C5H', chain: 'EVM' }
];

// Filter out the Solana wallets - we only want to replace EVM wallets
const EVM_ONLY_WALLETS = EVM_WALLETS_TO_REPLACE.filter(wallet => wallet.chain === 'EVM');

async function generatePrivyAPIInstructions() {
  console.log('🎯 Privy Wallet Replacement Instructions');
  console.log('=======================================');
  console.log('');
  
  console.log('📋 Overview:');
  console.log(`Found ${EVM_ONLY_WALLETS.length} EVM wallets that need to be replaced with Solana wallets`);
  console.log('');
  
  console.log('🔧 Manual Steps (Privy Dashboard):');
  console.log('==================================');
  console.log('1. Go to https://dashboard.privy.io/');
  console.log('2. Navigate to Wallets section');
  console.log('3. For each EVM wallet listed below:');
  console.log('   a. Find the wallet by its ID or address');
  console.log('   b. Delete/remove the EVM wallet');
  console.log('   c. Generate a new Solana wallet for the same user');
  console.log('');
  
  console.log('📝 EVM Wallets to Replace:');
  console.log('==========================');
  EVM_ONLY_WALLETS.forEach((wallet, index) => {
    console.log(`${index + 1}. Wallet ID: ${wallet.walletId}`);
    console.log(`   Address: ${wallet.address}`);
    console.log(`   Action: Delete EVM → Generate Solana`);
    console.log('');
  });
  
  console.log('🔗 API Approach (if you have proper API access):');
  console.log('================================================');
  console.log('');
  
  console.log('Step 1: Delete EVM Wallets');
  console.log('-------------------------');
  EVM_ONLY_WALLETS.forEach((wallet, index) => {
    console.log(`# Delete wallet ${index + 1}`);
    console.log(`curl -X DELETE \\`);
    console.log(`  "${PRIVY_CONFIG.baseUrl}/v1/wallets/${wallet.walletId}" \\`);
    console.log(`  -H "Authorization: Basic $(echo -n '${PRIVY_CONFIG.appId}:${PRIVY_CONFIG.appSecret}' | base64)" \\`);
    console.log(`  -H "privy-app-id: ${PRIVY_CONFIG.appId}"`);
    console.log('');
  });
  
  console.log('Step 2: Create Solana Wallets');
  console.log('-----------------------------');
  console.log('# For each user whose EVM wallet was deleted, create a Solana wallet:');
  console.log(`curl -X POST \\`);
  console.log(`  "${PRIVY_CONFIG.baseUrl}/v1/wallets" \\`);
  console.log(`  -H "Authorization: Basic $(echo -n '${PRIVY_CONFIG.appId}:${PRIVY_CONFIG.appSecret}' | base64)" \\`);
  console.log(`  -H "privy-app-id: ${PRIVY_CONFIG.appId}" \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '{`);
  console.log(`    "chain_type": "solana",`);
  console.log(`    "owner": {`);
  console.log(`      "user_id": "USER_ID_HERE"`);
  console.log(`    }`);
  console.log(`  }'`);
  console.log('');
  
  console.log('📊 Summary:');
  console.log('===========');
  console.log(`Total EVM wallets to replace: ${EVM_ONLY_WALLETS.length}`);
  console.log(`Solana wallets already present: ${EVM_WALLETS_TO_REPLACE.length - EVM_ONLY_WALLETS.length}`);
  console.log('');
  
  console.log('⚠️  Important Notes:');
  console.log('===================');
  console.log('1. The API returned 401 errors, suggesting authentication issues');
  console.log('2. Manual deletion via Privy Dashboard is the most reliable approach');
  console.log('3. After wallet replacement, update your local database accordingly');
  console.log('4. Test your app thoroughly after wallet replacement');
  console.log('');
  
  console.log('🔍 Next Steps:');
  console.log('==============');
  console.log('1. Use Privy Dashboard to manually replace EVM wallets with Solana wallets');
  console.log('2. Note the new Solana wallet addresses');
  console.log('3. Update your database with the new Solana addresses');
  console.log('4. Run wallet verification: pnpm run wallet:verify-setup');
  
  // Save detailed instructions
  const instructions = {
    overview: {
      totalEvmWallets: EVM_ONLY_WALLETS.length,
      totalSolanaWallets: EVM_WALLETS_TO_REPLACE.length - EVM_ONLY_WALLETS.length,
      action: 'Replace EVM wallets with Solana wallets'
    },
    evmWalletsToReplace: EVM_ONLY_WALLETS,
    manualSteps: [
      'Go to https://dashboard.privy.io/',
      'Navigate to Wallets section',
      'For each EVM wallet: Delete EVM → Generate Solana',
      'Note new Solana addresses',
      'Update database with new addresses'
    ],
    apiCommands: {
      deleteWallet: `curl -X DELETE "${PRIVY_CONFIG.baseUrl}/v1/wallets/{WALLET_ID}"`,
      createSolanaWallet: `curl -X POST "${PRIVY_CONFIG.baseUrl}/v1/wallets" -d '{"chain_type": "solana", "owner": {"user_id": "USER_ID"}}'`
    },
    timestamp: new Date().toISOString()
  };
  
  const instructionsPath = path.join(__dirname, '..', 'privy-wallet-replacement-instructions.json');
  fs.writeFileSync(instructionsPath, JSON.stringify(instructions, null, 2));
  console.log(`\n📄 Detailed instructions saved to: ${instructionsPath}`);
  
  return instructions;
}

// Run the instruction generator
if (require.main === module) {
  generatePrivyAPIInstructions()
    .then(() => {
      console.log('\n🎉 Wallet replacement instructions generated!');
      console.log('Use Privy Dashboard to manually replace EVM wallets with Solana wallets.');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Failed to generate instructions:', error);
      process.exit(1);
    });
}

module.exports = { generatePrivyAPIInstructions, EVM_ONLY_WALLETS };
