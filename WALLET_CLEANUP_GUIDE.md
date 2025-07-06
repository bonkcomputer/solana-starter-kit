# Wallet Cleanup Guide

This guide explains how to clean up user wallets to ensure all users have **Solana-only** wallets, removing any EVM (Ethereum) wallets.

## Overview

Based on the Privy Dashboard analysis, we identified users who have:
1. **Dual wallets** (both EVM and Solana) - need EVM removal
2. **EVM-only wallets** - need EVM removal and Solana generation  
3. **Email-only accounts** - need Solana wallet generation

## 🎯 Goal

Ensure all users have **ONLY Solana wallets** for proper app functionality.

## 📋 Step-by-Step Process

### Step 1: Analyze Current Wallet Status

Run the wallet cleanup analysis:

```bash
pnpm run wallet:clean-evm
```

This will:
- Identify users with EVM wallets that need removal
- Identify users who need Solana wallet generation
- Generate a detailed action plan in `wallet-cleanup-plan.json`

### Step 2: Clean Wallets in Privy Dashboard

1. **Go to Privy Dashboard**: https://dashboard.privy.io/
2. **Navigate to User Management**
3. **For each user identified in the analysis:**

#### For Users with EVM Wallets to Remove:
- Search for the user by their Privy ID
- Go to their wallet management section
- **Remove/disconnect the EVM wallet** (0x address)
- **Ensure they keep their Solana wallet** (if they have one)
- **If no Solana wallet exists, generate one**

#### For Users Needing Solana Wallet Generation:
- Search for the user by their Privy ID
- **Generate a new Solana wallet**
- **Note the generated Solana address** (you'll need this for Step 3)

### Step 3: Update Database with New Wallet Addresses

After cleaning wallets in Privy Dashboard:

1. **Edit the update script**: `scripts/update-wallet-addresses.js`
2. **Fill in the `newSolanaAddress` field** for each user with their new Solana wallet address
3. **Run the update script**:

```bash
pnpm run wallet:update-addresses
```

This will:
- Update the database with new Solana wallet addresses
- Remove EVM wallet addresses from the database
- Verify all updates were successful

### Step 4: Verify Cleanup

Run the analysis again to verify all users now have Solana-only wallets:

```bash
pnpm run wallet:clean-evm
```

## 📊 Users Identified for Cleanup

### Users with EVM Wallets (Need Removal)
Based on Privy Dashboard screenshots, these users have EVM wallets that need to be removed:

1. **cyberryda@gmail.com** - Has both EVM and Solana wallets
2. **clarityvision2030@gmail.com** - Has EVM wallet
3. **ruggedwojak@proton.me** - Has EVM wallet  
4. **ordinalservice@gmail.com** - Has EVM wallet

### Users Needing Solana Wallets (Email-Only)
These users have email-only accounts and need Solana wallets generated:

1. **pickslabs@gmail.com**
2. **soulsete@naver.com**
3. **farfouch2@gmail.com**
4. **camden26@hotmail.com**
5. **allisobhan4@gmail.com**
6. **bonkcomputer6@gmail.com**
7. **boredgucciape@gmail.com**

## 🛠️ Scripts Available

| Script | Command | Purpose |
|--------|---------|---------|
| Analyze Wallets | `pnpm run wallet:clean-evm` | Identify users needing wallet cleanup |
| Update Addresses | `pnpm run wallet:update-addresses` | Update database after Privy cleanup |
| Check Status | `pnpm run db:status` | Verify database health |

## ⚠️ Important Notes

1. **Backup First**: Always run `pnpm run db:backup` before making changes
2. **Test After**: Verify users can access Solana features after cleanup
3. **Privy Dashboard**: All wallet generation/removal must be done through Privy Dashboard
4. **Database Sync**: Always update the database after Privy changes

## 🔍 Troubleshooting

### If a user can't access Solana features:
1. Check if they have a Solana wallet in Privy Dashboard
2. Verify the wallet address is in the database
3. Ensure no EVM wallet addresses remain

### If database update fails:
1. Check the Privy ID is correct
2. Verify the Solana address format is valid
3. Ensure the user exists in the database

## 📄 Generated Files

- `wallet-cleanup-plan.json` - Detailed analysis and action plan
- `users-needing-solana-wallets.json` - Previous analysis results
- `wallet-needs-analysis.json` - Original CSV analysis

## 🎉 Success Criteria

After completing the cleanup:
- ✅ All users have Solana wallet addresses
- ✅ No users have EVM wallet addresses  
- ✅ All users can access Solana-based app features
- ✅ Database is in sync with Privy Dashboard

## 📞 Support

If you encounter issues:
1. Check the generated JSON files for detailed error information
2. Verify Privy Dashboard settings
3. Run `pnpm run db:status` to check database health
4. Review the console output for specific error messages
