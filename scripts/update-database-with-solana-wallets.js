#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

console.log('🔄 Updating Database with Solana Wallets...\n');

async function updateDatabaseWithSolanaWallets() {
  try {
    // Look for the latest Solana wallet generation results
    const resultsPattern = /solana-wallet-generation-.*\.json$/;
    const projectRoot = path.join(__dirname, '..');
    const files = fs.readdirSync(projectRoot);
    const resultFiles = files.filter(file => resultsPattern.test(file));
    
    if (resultFiles.length === 0) {
      console.error('❌ No Solana wallet generation results found');
      console.log('   Run the bulk generation script first');
      process.exit(1);
    }
    
    // Use the most recent results file
    const latestResultFile = resultFiles.sort().reverse()[0];
    const resultsPath = path.join(projectRoot, latestResultFile);
    
    console.log('📊 Reading results from:', latestResultFile);
    
    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    const walletUpdates = results.results || [];
    
    console.log('   Found', walletUpdates.length, 'wallet updates to process\n');
    
    let successCount = 0;
    let errorCount = 0;
    const updateLog = [];
    
    for (const update of walletUpdates) {
      try {
        if (update.newSolanaWallet && update.newSolanaWallet.address) {
          // Find user by their original EVM wallet address or Privy DID
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { embeddedWalletAddress: update.originalWallet.address },
                { solanaWalletAddress: update.originalWallet.address }
              ]
            }
          });
          
          if (user) {
            // Update user with new Solana wallet
            await prisma.user.update({
              where: { id: user.id },
              data: {
                solanaWalletAddress: update.newSolanaWallet.address,
                embeddedWalletAddress: null, // Remove EVM wallet reference
                updatedAt: new Date()
              }
            });
            
            console.log(`✅ Updated user ${user.username}: ${update.newSolanaWallet.address}`);
            successCount++;
            
            updateLog.push({
              userId: user.id,
              username: user.username,
              oldAddress: update.originalWallet.address,
              newAddress: update.newSolanaWallet.address,
              status: 'success',
              timestamp: new Date().toISOString()
            });
            
          } else {
            console.log(`⚠️  User not found for wallet: ${update.originalWallet.address}`);
            errorCount++;
            
            updateLog.push({
              oldAddress: update.originalWallet.address,
              status: 'user_not_found',
              timestamp: new Date().toISOString()
            });
          }
        } else {
          console.log(`⚠️  No new Solana wallet for: ${update.originalWallet.address}`);
          errorCount++;
          
          updateLog.push({
            oldAddress: update.originalWallet.address,
            status: 'no_new_wallet',
            timestamp: new Date().toISOString()
          });
        }
        
      } catch (error) {
        console.error(`❌ Error updating ${update.originalWallet.address}:`, error.message);
        errorCount++;
        
        updateLog.push({
          oldAddress: update.originalWallet.address,
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Save update log
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFile = path.join(__dirname, '..', `database-update-log-${timestamp}.json`);
    
    fs.writeFileSync(logFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        total: walletUpdates.length,
        successful: successCount,
        errors: errorCount
      },
      updates: updateLog
    }, null, 2));
    
    console.log('\n📊 Database Update Summary:');
    console.log('   Total updates:', walletUpdates.length);
    console.log('   Successful:', successCount);
    console.log('   Errors:', errorCount);
    console.log('   Log file:', logFile);
    
    if (successCount > 0) {
      console.log('\n✅ Database successfully updated with Solana wallets!');
    }
    
    if (errorCount > 0) {
      console.log('\n⚠️  Some updates failed. Check the log file for details.');
    }
    
  } catch (error) {
    console.error('❌ Database update failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateDatabaseWithSolanaWallets();
