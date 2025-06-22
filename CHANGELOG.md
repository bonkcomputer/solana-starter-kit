# Changelog

All notable changes to the Solana Starter Kit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-01-20

### 🚀 Monumental Release - Multi-Wallet Support & Referral System

This major release introduces groundbreaking features developed by Bonk Computer with enhancements powered by Tapestry.

### Added
- **Multi-Wallet Support**
  - Full support for external Solana wallets (Phantom, Solflare, Backpack, etc.)
  - Seamless integration with Privy embedded wallets for email sign-ups
  - Automatic wallet type detection for optimal transaction handling
  - Smart transaction routing based on wallet capabilities

- **Referral Fee System**
  - Built-in Jupiter swap referral fees (2.51% default)
  - Configurable referral account and fee percentage
  - Direct revenue generation from all swaps
  - Transparent fee tracking on-chain

- **Direct Jupiter API Integration**
  - Removed intermediate server calls for swaps
  - Direct integration with `https://quote-api.jup.ag/v6/swap`
  - Improved reliability and reduced latency
  - Better error handling and user feedback

- **Enhanced User Experience**
  - Centered dialog positioning for better visual hierarchy
  - Improved error messages with actionable feedback
  - Persistent authentication across all application tabs
  - Username display in header when logged in

### Changed
- **Swap Transaction Flow**
  - Updated to use Jupiter's direct swap API
  - Added intelligent wallet detection for transaction handling
  - Improved error handling with specific messages for different failure types
  - Added console logging for debugging wallet types

- **Authentication Flow**
  - Simplified profile checking to reduce API calls
  - Profile check now happens once at login instead of continuously
  - Better handling of new vs existing users
  - Reduced complexity in authentication state management

- **UI/UX Improvements**
  - Dialog component now properly centers vertically
  - Create Profile dialog appears in the middle of the screen
  - Better visual feedback during swap transactions
  - Cleaner error states with helpful messages

### Fixed
- **Transaction Handling**
  - Fixed duplicate instruction error in swap transactions
  - Resolved issues with external wallet transaction signing
  - Fixed ATA (Associated Token Account) creation conflicts
  - Improved handling of different wallet connection states

- **Profile System**
  - Fixed aggressive profile checking causing performance issues
  - Resolved "User already exists" errors for returning users
  - Fixed profile creation flow for new users
  - Improved error handling in profile creation process

### Technical Details
- **Wallet Detection Logic**
  ```typescript
  if (wallet.walletClientType && wallet.walletClientType !== 'privy') {
    // External wallet handling
  } else {
    // Privy embedded wallet handling
  }
  ```

- **Referral Configuration**
  ```typescript
  export const REFERRAL_ACCOUNT = '3i9DA5ddTXwDLdaKRpK9BA4oXumVpPWWGuyD3YKxPs1j'
  export const REFERRAL_FEE_BPS = 251 // 2.51% referral fee
  ```

- **Dynamic Slippage Calculation**
  - Automatically adjusts slippage based on price impact
  - Ranges from 0.5% to 15% based on trade conditions
  - Ensures optimal trade execution

### Documentation
- Added comprehensive swap and referral implementation guide
- Updated README with monumental updates section
- Enhanced contributing guidelines for wallet testing
- Created detailed changelog for version tracking

### Developer Notes
- When implementing new swap features, ensure compatibility with both wallet types
- Test all trading functionality with BCT and SSE tokens
- Verify referral fees are properly included in transactions
- Use console logging to debug wallet type detection

---

## [1.0.0] - 2024-01-01

### Initial Release
- Basic Solana Starter Kit with authentication
- Profile system with Tapestry integration
- Trading interface with Jupiter quotes
- Portfolio management with token and NFT display
- Social features (comments, likes, follows)

---

Built with ❤️ by Bonk Computer, powered by Tapestry 