import bundleAnalyzer from '@next/bundle-analyzer';

/** @type {import('next').NextConfig} */
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  reactStrictMode: false,
  
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  serverExternalPackages: ['@prisma/client'],
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', '@privy-io/react-auth', 'sonner'],
  },
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Static asset caching
  async headers() {
    return [
      // Static assets cache
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Enhanced CSP and security headers
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              [
                "connect-src 'self' https://cc.bonk.computer",
                // Privy authentication
                "https://auth.privy.io",
                "https://*.privy.io",
                "https://privy.bonk.computer",
                // Solana RPC endpoints
                "https://*.solana.com",
                "https://api.mainnet-beta.solana.com",
                "https://solana.public-rpc.com",
                "https://*.alchemy.com",
                "https://solana-mainnet.g.alchemy.com",
                "https://*.helius-rpc.com",
                "https://mainnet.helius-rpc.com",
                "https://solana-api.projectserum.com",
                "https://*.ankr.com",
                "https://rpc.ankr.com",
                "https://*.quicknode.com",
                "https://*.rpcpool.com",
                "https://*.syndica.io",
                // WebSocket endpoints for Solana
                "wss://*.solana.com",
                "wss://*.helius-rpc.com",
                "wss://*.alchemy.com",
                // Jupiter API
                "https://quote-api.jup.ag",
                "https://price.jup.ag",
                "https://*.jup.ag",
                // Birdeye API
                "https://public-api.birdeye.so",
                "https://*.birdeye.so",
                // Tapestry API
                "https://api.tapestry.dev",
                "https://*.tapestry.dev",
                // Other services
                "https://fonts.googleapis.com",
                "'self'",
                "data:",
                "blob:"
              ].join(" "),
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://auth.privy.io https://privy.bonk.computer https://*.privy.io https://*.jup.ag",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https: https://*.privy.io",
              "font-src 'self' https://fonts.gstatic.com",
              "frame-src 'self' https://auth.privy.io https://privy.bonk.computer https://birdeye.so https://*.jup.ag",
              "frame-ancestors 'self' https://bcttrading.vercel.app https://auth.privy.io https://privy.bonk.computer",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ]
  },

  // Webpack optimizations for faster builds and smaller bundles
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Enable filesystem caching for faster rebuilds
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };
      
      // Optimize development builds
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
    }
    
    // Optimize for faster builds
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // Reduce module resolution time
    config.resolve.extensions = ['.tsx', '.ts', '.jsx', '.js', '.json'];
    
    return config;
  },

  // Reduce compilation overhead
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Optimize page compilation order
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // Optimize static file serving
  productionBrowserSourceMaps: false,
  trailingSlash: false,
}

export default withBundleAnalyzer(nextConfig)
