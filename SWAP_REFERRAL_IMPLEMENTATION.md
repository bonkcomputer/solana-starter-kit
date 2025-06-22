# Swap & Referral System Implementation

## Overview

The Solana Starter Kit now includes a powerful swap system with built-in referral fees, supporting both external wallets and Privy embedded wallets. This implementation uses Jupiter's direct swap API for optimal performance and reliability.

## Key Features

### 1. **Multi-Wallet Support**
- **External Wallets**: Full support for Phantom, Solflare, Backpack, and other Solana wallets
- **Embedded Wallets**: Seamless support for Privy-created wallets (email sign-ups)
- **Automatic Detection**: Smart detection of wallet type for optimal transaction handling

### 2. **Referral Fee System**
- **Default Referral Account**: `3i9DA5ddTXwDLdaKRpK9BA4oXumVpPWWGuyD3YKxPs1j`
- **Referral Fee**: 251 basis points (2.51%)
- **Automatic Integration**: Every swap includes the referral fee

### 3. **Direct Jupiter API Integration**
- **Endpoint**: Direct use of `https://quote-api.jup.ag/v6/swap`
- **No Intermediate Server**: Reduced latency and points of failure
- **Dynamic Slippage**: Automatic slippage calculation based on price impact

## Implementation Details

### Swap Hook Configuration

```typescript
// src/components/trade/hooks/jupiter/use-jupiter-swap.ts

export const REFERRAL_ACCOUNT = '3i9DA5ddTXwDLdaKRpK9BA4oXumVpPWWGuyD3YKxPs1j'
export const REFERRAL_FEE_BPS = 251 // 2.51% referral fee

// Jupiter swap API call
const swapResponse = await fetch('https://quote-api.jup.ag/v6/swap', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    quoteResponse,
    userPublicKey: walletAddress,
    wrapAndUnwrapSol: true,
    slippageBps: calculateAutoSlippage(priceImpact),
    prioritizationFeeLamports: 10000,
    dynamicComputeUnitLimit: true,
    referralAccount: REFERRAL_ACCOUNT,
    referralFeeBps: REFERRAL_FEE_BPS,
  }),
})
```

### Wallet-Specific Transaction Handling

```typescript
// External wallet handling
if (wallet.walletClientType && wallet.walletClientType !== 'privy') {
  if (wallet.sendTransaction) {
    txSig = await wallet.sendTransaction(transaction, connection)
  } else {
    // Fallback to sign and send
    const signedTransaction = await wallet.signTransaction(transaction)
    txSig = await connection.sendRawTransaction(
      signedTransaction.serialize(),
    )
  }
} else {
  // Privy embedded wallet handling
  const signedTransaction = await wallet.signTransaction(transaction)
  txSig = await connection.sendRawTransaction(
    signedTransaction.serialize(),
  )
}
```

### Dynamic Slippage Calculation

```typescript
function calculateAutoSlippage(priceImpactPct: string): number {
  const impact = Math.abs(parseFloat(priceImpactPct))
  
  if (!impact || isNaN(impact)) return 50  // 0.5% default
  if (impact <= 0.1) return 50             // 0.5% for very low impact
  if (impact <= 0.5) return 100            // 1% for low impact
  if (impact <= 1.0) return 200            // 2% for medium impact
  if (impact <= 2.0) return 500            // 5% for high impact
  if (impact <= 5.0) return 1000           // 10% for very high impact
  return 1500                              // 15% for extreme impact
}
```

## Configuration

### Environment Variables

No additional environment variables are required for the swap functionality. The system uses:
- `NEXT_PUBLIC_RPC_URL` - Solana RPC endpoint (defaults to mainnet)
- `NEXT_PUBLIC_HELIUS_API_KEY` - For enhanced RPC functionality

### Customizing Referral Settings

To use your own referral account and fee:

1. Update the constants in `use-jupiter-swap.ts`:
```typescript
export const REFERRAL_ACCOUNT = 'YOUR_WALLET_ADDRESS_HERE'
export const REFERRAL_FEE_BPS = 100 // 1% fee (100 basis points)
```

2. The referral fee is taken from the output amount of the swap
3. Maximum referral fee allowed by Jupiter is typically 300 bps (3%)

## Error Handling

The implementation includes comprehensive error handling:

1. **Quote Errors**: Clear messages when quote fetching fails
2. **Transaction Errors**: Detailed error messages for signing/sending failures
3. **Wallet Errors**: Specific handling for wallet connection issues
4. **Network Errors**: Graceful handling of RPC failures

## Testing

### Test with External Wallet
1. Connect Phantom or Solflare wallet
2. Select tokens to swap
3. Enter amount and execute swap
4. Verify transaction includes referral fee

### Test with Embedded Wallet
1. Sign up with email via Privy
2. Fund the embedded wallet
3. Execute swap transaction
4. Verify seamless execution

## Revenue Tracking

To track referral revenue:
1. Monitor the referral account on Solscan
2. Filter incoming transactions by Jupiter program
3. Calculate total fees earned from swaps

## Future Enhancements

- [ ] Add swap history tracking
- [ ] Implement fee sharing with users
- [ ] Add analytics dashboard for referral earnings
- [ ] Support for additional DEX aggregators

## Troubleshooting

### Common Issues

1. **"Failed to sign/send transaction"**
   - Ensure wallet is connected
   - Check wallet has sufficient SOL for fees
   - Verify RPC endpoint is responsive

2. **"Failed to create swap transaction"**
   - Check Jupiter API status
   - Verify quote response is valid
   - Ensure tokens are supported

3. **External wallet not working**
   - Update wallet to latest version
   - Check browser permissions
   - Try different wallet provider

## Support

For issues or questions:
- Check Jupiter documentation: https://station.jup.ag/docs
- Review Privy wallet docs: https://docs.privy.io
- Open an issue in the repository

---

Built with ❤️ by Bonk Computer, powered by Tapestry 