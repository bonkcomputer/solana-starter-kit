# Solana Starter Kit

Welcome to the **Solana Starter Kit**! This comprehensive template provides everything you need to build modern blockchain applications on Solana, featuring real-time trading, social profiles, portfolio management, and seamless Web3 authentication. 

**Developed by Bonk Computer with powerful enhancements from Tapestry** 🚀

## 🚀 Features

### **🎉 Monumental Updates in Latest Release**
- **Multi-Wallet Support** - Full support for external Solana wallets (Phantom, Solflare) AND Privy embedded wallets
- **Referral System** - Built-in Jupiter swap referral fees (2.51% default) for monetization
- **Enhanced UX** - Centered dialogs, improved error handling, seamless authentication flow
- **Direct Jupiter API** - Direct integration with Jupiter's swap API for better reliability
- **Smart Transaction Handling** - Automatic detection and handling of different wallet types

### **Core Functionality**
- **Web3 Authentication** - Privy integration with email and wallet login (now with enhanced wallet detection)
- **Profile System** - User profiles with social features (comments, likes, follows) powered by Tapestry
- **Real-time Trading** - Live BCT and SSE trading data with Jupiter integration and referral fees
- **Portfolio Management** - Real-time token prices and NFT viewing with total USD values
- **Social Graph** - Tapestry integration for decentralized social features

### **Technical Stack**
- **Frontend**: Next.js 15.1.7 with TypeScript and Tailwind CSS
- **Authentication**: Privy (Web3 auth + embedded wallets)
- **Database**: PostgreSQL with Prisma ORM
- **Blockchain**: Solana with Helius RPC
- **Trading**: Jupiter API for swaps and real-time pricing
- **Social**: Tapestry API for social graph functionality

## 🎯 User Journey

### 1. Clone the Repo

Clone the repository in your preferred code editor to start working with the code locally:

```bash
git clone https://github.com/Primitives-xyz/solana-starter-kit
cd solana-starter-kit
```

### 2. Get API Keys

Sign up for API keys from each infrastructure partner:

- **Privy**: Web3 authentication and embedded wallet infrastructure – <a href="https://dashboard.privy.io" target="_blank">Sign up for Privy</a>
- **Tapestry**: Social graph and onchain identity API – <a href="https://app.usetapestry.dev/" target="_blank">Get Early Access at Tapestry</a>
- **Jupiter**: Open source liquidity and trading API – <a href="https://portal.jup.ag" target="_blank">Get your Jupiter API key</a>
- **Helius**: Real-time Solana RPC platform - <a href="https://dashboard.helius.dev/" target="_blank">Sign up at Helius</a>

### 3. Configure Environment

Create your environment file and add your API credentials:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
# Authentication
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# Blockchain & Trading
HELIUS_API_KEY=your_helius_api_key
NEXT_PUBLIC_HELIUS_API_KEY=your_helius_api_key
RPC_URL=https://mainnet.helius-rpc.com/?api-key=your_helius_api_key

# Social Features
TAPESTRY_API_KEY=your_tapestry_api_key
TAPESTRY_URL=https://api.tapestry.dev

# Optional: Jupiter API (for enhanced features)
JUPITER_API_KEY=your_jupiter_api_key
```

### 4. Add Docs to Cursor

Navigate to Cursor > Cursor Settings > Features > Docs and add these documentation URLs:

- **Privy**: https://docs.privy.io/
- **Tapestry**: https://docs.usetapestry.dev/api
- **Jupiter**: https://docs.jup.ag/
- **Helius**: https://docs.helius.dev/

### 5. Install Dependencies and Start Development

```bash
pnpm install
pnpm run dev
```

Visit `http://localhost:3000` to see your application running!

## 📱 Application Features

### **Authentication & Profiles**
- **Multiple Login Options**: Email, Phantom, Solflare, and other Solana wallets
- **Embedded Wallets**: Automatic Solana wallet creation for email users
- **Profile Creation**: Username, bio, and social features
- **Persistent Sessions**: Stay logged in across browser sessions

### **Trading & Portfolio**
- **Real-time Trading Data**: Live BCT and SSE trades with transaction details
- **Portfolio Management**: View all tokens and NFTs with real-time USD values
- **Jupiter Integration**: Swap tokens directly in the application
- **Price Tracking**: Live token prices from Jupiter API

### **Social Features**
- **Comments & Likes**: Engage with other users' profiles
- **Follow System**: Build your social network
- **Profile Discovery**: Find users through token ownership and suggestions
- **Dual Storage**: Tapestry for social graph + local database for reliability

## 🛠️ Development

### **Build & Deploy**

```bash
# Development
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start

# Database operations
npx prisma generate
npx prisma db push
npx prisma studio
```

### **Environment Setup**

The application requires both client-side and server-side environment variables:

- **Client-side** (`NEXT_PUBLIC_*`): Available in the browser
- **Server-side**: Only available on the server (API routes)

### **Database Schema**

The application uses Prisma with PostgreSQL for:
- User profiles and authentication data
- Comments, likes, and social interactions
- Backup storage for Tapestry social features

## 📊 API Endpoints

### **Core APIs**
- `/api/health/tapestry` - System health check
- `/api/profiles/*` - Profile management
- `/api/portfolio` - Token and NFT portfolio data
- `/api/trades` - Real-time trading data
- `/api/jupiter/*` - Token swapping and quotes

### **Social APIs**
- `/api/comments` - Comment system
- `/api/likes` - Like functionality
- `/api/followers/*` - Follow/unfollow system
- `/api/identities` - User identity lookup

## 🎨 UI Components

Built with modern design principles:
- **Responsive Design**: Works on all devices
- **Dark/Light Themes**: Automatic theme detection
- **Accessible**: WCAG compliant components
- **Modern Styling**: Tailwind CSS with custom components

## 🔧 Portfolio & Trading Features

### **Real-time Portfolio**
- **Token Holdings**: View all fungible tokens with live USD values
- **NFT Collection**: Browse NFTs with detailed metadata and attributes
- **Total Value**: Real-time portfolio valuation
- **Jupiter Pricing**: Live market prices for accurate valuations

### **Trading Integration**
- **Recent Trades**: Live feed of BCT and SSE trading activity
- **Trade Details**: Transaction hashes, amounts, and token logos
- **Swap Interface**: Direct token swapping through Jupiter
- **Price Quotes**: Real-time swap quotes and rate calculations

## 🌐 Deployment

### **Vercel (Recommended)**

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push

### **Environment Variables for Production**

Ensure all required environment variables are set in your deployment platform:

```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_PRIVY_APP_ID=...
HELIUS_API_KEY=...
NEXT_PUBLIC_HELIUS_API_KEY=...
TAPESTRY_API_KEY=...
TAPESTRY_URL=https://api.tapestry.dev
```

## 📖 Documentation

### **Key Implementation Guides**
- `TAPESTRY_INTEGRATION_COMPLETE.md` - Complete social features implementation
- `PROFILE_SYSTEM_IMPLEMENTATION.md` - Authentication and profile system
- `STYLING_GUIDE.md` - UI/UX design guidelines
- `CONTRIBUTING.md` - Contribution guidelines

### **API Documentation**
Each API endpoint includes comprehensive error handling, type safety, and fallback mechanisms for maximum reliability.

## 🤝 Contributing

We welcome contributions! This project is open source under the MIT License. Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

See `CONTRIBUTING.md` for detailed guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the docs folder for detailed guides
- **Issues**: Create GitHub issues for bugs or feature requests
- **Community**: Join our Discord for real-time support

---

**Built with ❤️ for the Solana ecosystem**
