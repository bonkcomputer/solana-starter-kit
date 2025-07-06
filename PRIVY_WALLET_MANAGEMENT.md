# Privy API Wallet Management Guide

This guide explains how to use the Privy Admin API to programmatically create Solana wallets for users and ensure they have Solana-only wallet configurations.

## 🎯 Overview

Based on the wallet screenshots from your Privy Dashboard, we identified users who have:
- **EVM wallets** that need to be replaced with Solana wallets
- **Email-only accounts** that need Solana wallet generation

This solution uses the **Privy Admin API** to programmatically create Solana wallets without manual intervention.

## 🔧 Setup

### Step 1: Get Your Privy App Secret

1. Go to [Privy Dashboard](https://dashboard.privy.io/)
2. Navigate to **App Settings > Basics**
3. Copy your **App Secret** (not the App ID, which you already have)

### Step 2: Update Environment Variables

Edit your `.env` file and replace the placeholder:

```bash
# Replace YOUR_PRIVY_APP_SECRET_HERE with your actual app secret
PRIVY_APP_SECRET=your_actual_app_secret_here
```

**⚠️ Important**: Keep your app secret secure and never commit it to version control.

## 🚀 Usage

### Create Solana Wallets for All Users

This command will process all identified users and create Solana wallets via the Privy API:

```bash
pnpm run wallet:create-solana
```

**What it does:**
1. **Validates** environment variables
2. **Checks** each user in the database
3. **Skips** users who already have Solana wallets
4. **Creates** Solana wallets via Privy API for users who need them
5. **Updates** the database with new wallet addresses
6. **Removes** EVM wallet references from the database

### Verify Wallet Setup

After creating wallets, verify that all users have proper Solana-only configurations:

```bash
pnpm run wallet:verify-setup
```

**What it checks:**
- ✅ Users with Solana-only wallets
- ❌ Users without Solana wallets
- ⚠️ Users still with EVM wallets

## 📊 Users Being Processed

### Users with EVM Wallets (Will be replaced with Solana)
1. **cyberryda@gmail.com** - Has EVM wallet, needs Solana replacement
2. **clarityvision2030@gmail.com** - Has EVM wallet, needs Solana replacement
3. **ruggedwojak@proton.me** - Has EVM wallet, needs Solana replacement
4. **ordinalservice@gmail.com** - Has EVM wallet, needs Solana replacement

### Users with Email-Only (Will get new Solana wallets)
1. **pickslabs@gmail.com** - Email-only, needs Solana wallet
2. **soulsete@naver.com** - Email-only, needs Solana wallet
3. **farfouch2@gmail.com** - Email-only, needs Solana wallet
4. **camden26@hotmail.com** - Email-only, needs Solana wallet
5. **allisobhan4@gmail.com** - Email-only, needs Solana wallet
6. **bonkcomputer6@gmail.com** - Email-only, needs Solana wallet
7. **boredgucciape@gmail.com** - Email-only, needs Solana wallet

## 🔍 How It Works

### Privy API Integration

The script uses the Privy Admin API endpoint:
```
POST https://api.privy.io/v1/wallets_with_recovery
```

**Request payload:**
```json
{
  "wallets": [
    {
      "chain_type": "solana",
      "policy_ids": []
    }
  ],
  "primary_signer": {
    "subject_id": "user_privy_id"
  },
  "recovery_user": {
    "linked_accounts": [
      {
        "type": "email",
        "address": "user@example.com"
      }
    ]
  }
}
```

**Response includes:**
- Solana wallet address
- Wallet ID
- Recovery user information

### Database Updates

After successful wallet creation, the script updates your database:
```sql
UPDATE users SET 
  solanaWalletAddress = 'new_solana_address',
  embeddedWalletAddress = NULL
WHERE privyDid = 'user_privy_id';
```

## 📄 Generated Files

The script generates detailed result files:

- `solana-wallet-creation-results.json` - Complete processing results
- Console output with real-time progress

## ✅ Success Criteria

After running the wallet creation script:
- ✅ All users have Solana wallet addresses in the database
- ✅ No users have EVM wallet addresses in the database
- ✅ All users can access Solana-based app features
- ✅ Privy Dashboard shows Solana wallets for all users

## 🛠️ Troubleshooting

### Environment Variable Issues
```bash
❌ Missing required environment variables:
   NEXT_PUBLIC_PRIVY_APP_ID: ✅
   PRIVY_APP_SECRET: ❌
```
**Solution**: Add your Privy App Secret to the `.env` file

### API Authentication Errors
```bash
❌ Privy API error: 401 - Unauthorized
```
**Solution**: Verify your App ID and App Secret are correct

### Rate Limiting
```bash
❌ Privy API error: 429 - Too Many Requests
```
**Solution**: The script includes automatic delays, but you may need to wait and retry

### User Not Found
```bash
❌ User username not found in database - skipping
```
**Solution**: Ensure the user was properly restored from the CSV export

## 🔒 Security Best Practices

1. **Never commit** your `PRIVY_APP_SECRET` to version control
2. **Use environment variables** for all sensitive data
3. **Rotate secrets** regularly in production
4. **Monitor API usage** in your Privy Dashboard
5. **Test thoroughly** in development before production

## 📞 Support

### If wallet creation fails:
1. Check the generated JSON results file for detailed error information
2. Verify your Privy App Secret is correct
3. Ensure users exist in your database
4. Check Privy Dashboard for API usage limits

### If users can't access Solana features:
1. Run `pnpm run wallet:verify-setup` to check wallet status
2. Verify wallet addresses in both database and Privy Dashboard
3. Check that no EVM wallet references remain

## 🎉 Expected Results

After successful completion:
- **11 users** will have new Solana wallets
- **0 users** will have EVM wallets
- **All users** can access Solana-based app features
- **Database** is in sync with Privy Dashboard

The process is **safe**, **automated**, and **follows Privy best practices** for wallet management.
