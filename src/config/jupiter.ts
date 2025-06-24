export const JUPITER_CONFIG = {
  // Referral fee configuration (actively used in use-jupiter-swap.ts)
  REFERRAL_ACCOUNT: '3i9DA5ddTXwDLdaKRpK9BA4oXumVpPWWGuyD3YKxPs1j',
  REFERRAL_FEE_BPS: 251, // 2.51% referral fee
  
  // Fee wallet for ATA creation (used in swap.ts)
  FEE_WALLET: '8jTiTDW9ZbMHvAD9SZWvhPfRx5gUgK7HACMdgbFp2tUz',

  // Transaction configuration (actively used)
  DEFAULT_SLIPPAGE_BPS: 50, // 0.5% base slippage
  DEFAULT_PRIORITY_FEE_LAMPORTS: 10000, // Basic priority fee
  
  // Dynamic slippage thresholds (used in calculateAutoSlippage)
  SLIPPAGE_TIERS: {
    VERY_LOW: { maxImpact: 0.1, slippage: 50 },   // 0.5% for <= 0.1% impact
    LOW: { maxImpact: 0.5, slippage: 100 },       // 1% for <= 0.5% impact
    MEDIUM: { maxImpact: 1.0, slippage: 200 },    // 2% for <= 1% impact
    HIGH: { maxImpact: 2.0, slippage: 500 },      // 5% for <= 2% impact
    VERY_HIGH: { maxImpact: 5.0, slippage: 1000 }, // 10% for <= 5% impact
    EXTREME: { slippage: 1500 }                    // 15% for > 5% impact
  },

  // API configuration (actively used)
  API_ENDPOINTS: {
    QUOTE: 'https://quote-api.jup.ag/v6/quote',
    SWAP: 'https://quote-api.jup.ag/v6/swap',
  },

  // Transaction timeout configuration
  TRANSACTION_TIMEOUT_MS: 60000, // 60 seconds

  // Legacy/unused configurations (kept for reference)
  // SSE_TOKEN_MINT: 'H4phNbsqjV5rqk8u6FUACTLB6rNZRTAPGnBb8KXJpump',
  // MIN_PLATFORM_FEE_BPS: 1,
} as const

export type PriorityLevel =
  | 'Min'
  | 'Low'
  | 'Medium'
  | 'High'
  | 'VeryHigh'
  | 'UnsafeMax'
