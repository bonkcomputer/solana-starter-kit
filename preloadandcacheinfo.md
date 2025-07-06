# IMPLEMENT PRELOAD AND CACHE OPTIMIZATION INFO AND EXAMPLES:

## the next.config.js can look like this:

```
/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  /* config options here */
  // Performance optimizations
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'ai', '@privy-io/react-auth'],
  },
  // Image optimization
  images: {
    domains: ['2fkyfggwlscwizn6.public.blob.vercel-storage.com'],
    formats: ['image/avif', 'image/webp'],
  },
  // Headers for caching
  async headers() {
    return [
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
    ];
  },
  // Webpack optimizations for faster builds
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Enable filesystem caching for faster rebuilds
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };
      
      // Reduce bundle analysis in development
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'async',
          cacheGroups: {
            default: false,
            vendors: false,
          },
        },
        // Faster development builds
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
  // Static file optimizations
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['2fkyfggwlscwizn6.public.blob.vercel-storage.com'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Reduce compilation overhead
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Optimize page compilation order
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Reduce bundle size and improve loading
  productionBrowserSourceMaps: false,
  // Optimize static file serving
  trailingSlash: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "frame-src https://*.e2b.dev https://*.e2b.app https://va.vercel-scripts.com https://*.privy.io https://auth.privy.io https://privy.bonk.computer https://terminal.jup.ag https://*.jup.ag",
              "frame-ancestors 'self' https://*.e2b.dev https://*.e2b.app https://*.privy.io https://auth.privy.io",
              [
                "connect-src 'self' https://www.bonk.computer https://*.vercel-scripts.com",
                // E2B and Privy
                "https://*.e2b.dev",
                "https://*.e2b.app",
                "https://auth.privy.io",
                "https://*.privy.io",
                "https://privy.bonk.computer",
                // WalletConnect
                "https://explorer-api.walletconnect.com",
                "https://*.walletconnect.com",
                "https://*.walletconnect.org",
                "https://pulse.walletconnect.org",
                "https://api.web3modal.org",
                "wss://*.walletconnect.com",
                "wss://*.walletconnect.org",
                // Solana RPC endpoints - using wildcards for better compatibility
                "https://*.solana.com",
                "https://api.mainnet-beta.solana.com",
                "https://solana.public-rpc.com",
                "https://*.alchemy.com",
                "https://solana-mainnet.g.alchemy.com",
                "https://solana-mainnet.g.alchemy.com/v2/*",
                "https://solana-mainnet.g.alchemy.com/v2/-4SwPqWYpAI0sBkxfS5pZOQ04lB1qhsZ",
                "https://*.helius-rpc.com",
                "https://mainnet.helius-rpc.com",
                "https://mainnet.helius-rpc.com/*",
                "https://solana-api.projectserum.com",
                "https://ssc-dao.genesysgo.net",
                "https://*.ankr.com",
                "https://rpc.ankr.com",
                "https://rpc.ankr.com/solana",
                "https://api.devnet.solana.com",
                "https://auth.privy.io",
                "https://*.privy.io",
                "https://*.e2b.dev",
                "https://*.e2b.app",
                "https://va.vercel-scripts.com",
                "'self'",
                "data:",
                "blob:",
                "https://*.bonk.computer",
                "https://www.bonk.computer",
                "https://6080-iol0yvcicfxjms6bcmse1-e286be9e.e2b.app",
                "https://*.quicknode.com",
                "https://*.rpcpool.com",
                "https://*.syndica.io",
                // WebSocket endpoints for Solana
                "wss://*.solana.com",
                "wss://*.helius-rpc.com",
                "wss://*.alchemy.com",
                // Other services
                "https://fonts.googleapis.com",
                "https://csp-report.browser-intake-datadoghq.com",
                "https://*.datadoghq.com",
                // Jupiter Terminal
                "https://terminal.jup.ag",
                "https://*.jup.ag",
                "https://quote-api.jup.ag",
                "https://price.jup.ag"
              ].join(" "),
              "img-src 'self' data: blob: https://*.e2b.dev https://*.e2b.app https://*.privy.io https://*.walletconnect.com https://2fkyfggwlscwizn6.public.blob.vercel-storage.com",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.e2b.dev https://*.e2b.app https://va.vercel-scripts.com https://*.privy.io https://terminal.jup.ag https://*.jup.ag",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com"
            ].join("; "),
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);

```

## the next-env.d.ts can look like this:

```
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.

```

the tsconfig.json can look like this:

```
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}

```

## the service-worker-registration.tsx can look like this:

```
"use client";

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  return null;
}

```



## resource-preloader.tsx can look like this:

```
"use client";

import { useEffect } from 'react';

export function ResourcePreloader() {
  useEffect(() => {
    // Add preconnect for external domains
    const preconnectDomains = [
      'https://api.privy.io',
      'https://auth.privy.io',
      'https://terminal.jup.ag',
      'https://lite-api.jup.ag',
      'https://api.mainnet-beta.solana.com',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ];

    preconnectDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Only preload auth-required endpoints if we're likely authenticated
    // (i.e., not on the landing page)
    const isLandingPage = window.location.pathname === '/';
    
    if (!isLandingPage) {
      // Don't preload API endpoints immediately - wait for page to settle
      setTimeout(() => {
        // Preload critical API endpoints for authenticated users with cache headers
        const authEndpoints = [
          '/api/user',
          '/api/wallet-balance',
          '/api/desktop'
        ];

        // Prefetch critical API routes with cache control
        authEndpoints.forEach(endpoint => {
          fetch(endpoint, { 
            method: 'GET',
            headers: {
              'Cache-Control': 'max-age=300' // 5 minute cache
            }
          }).catch(() => {
            // Silently fail - this is just for DNS/connection warming
          });
        });
      }, 1000); // Wait 1 second after page load
    }

    // Preload public resources that are accessible to all users
    if (isLandingPage) {
      // Preload Info and Manual content for landing page users
      const publicEndpoints = [
        '/api/manual'  // Manual content API
      ];

      publicEndpoints.forEach(endpoint => {
        fetch(endpoint, { method: 'GET' }).catch(() => {
          // Silently fail - this improves UX when users click Info/Manual buttons
        });
      });
    }

    // Preload Jupiter Terminal resources
    const jupiterResources = [
      'https://lite-api.jup.ag/v6/tokens',
      'https://terminal.jup.ag/main-v4.js',
      'https://terminal.jup.ag/main-v4.css'
    ];

    jupiterResources.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    });

    // Preload E2B desktop initialization
    if (typeof window !== 'undefined') {
      // Warm up WebSocket connection preparation
      setTimeout(() => {
        const wsPreload = new WebSocket('wss://api.e2b.dev');
        wsPreload.onopen = () => wsPreload.close();
        wsPreload.onerror = () => {}; // Silent fail
      }, 1000);
    }

    // Preload critical images that might be used
    const criticalImages = [
      '/images/Bonktvframe.png',
      '/images/BpcScreen.png',
      '/images/BonkCoin.png'
    ];

    criticalImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });

    // Preload token logos ONLY after critical page resources are loaded
    // This ensures token ticker doesn't interfere with initial page load performance
    setTimeout(() => {
      const tokenLogos = [
        '/images/tokenlogos/bct-logo.png',     // BCT - highest priority
        '/images/tokenlogos/bonk-logo.jpg',   // BONK - high priority  
        '/images/tokenlogos/solana-logo.png', // SOL - high priority
        '/images/tokenlogos/usdc-logo.png',   // USDC - high priority
        '/images/tokenlogos/jup-logo.png',    // JUP - medium priority
        '/images/tokenlogos/usdt-logo.png',   // USDT - medium priority
        '/images/tokenlogos/wif-logo.jpg',    // WIF - medium priority
        '/images/tokenlogos/jitosol-logo.png', // JitoSOL - medium priority
        '/images/tokenlogos/jupsol-logo.png',  // JupSOL - medium priority
        '/images/tokenlogos/jlp-logo.png',     // JLP - lower priority
        '/images/tokenlogos/jto-logo.webp',    // JTO - lower priority
        '/images/tokenlogos/fartcoin-logo.png', // FARTCOIN - lower priority
        '/images/tokenlogos/spx-logo.png',     // SPX - lower priority
        '/images/tokenlogos/letsbonk-logo.jpg' // LETSBONK - lower priority
      ];

      // Preload high priority token logos first (only after page is stable)
      const highPriorityLogos = tokenLogos.slice(0, 4);
      highPriorityLogos.forEach(src => {
        const img = new Image();
        img.src = src;
      });

      // Preload remaining token logos with additional delay
      setTimeout(() => {
        const remainingLogos = tokenLogos.slice(4);
        remainingLogos.forEach(src => {
          const img = new Image();
          img.src = src;
        });
      }, 1000);
    }, 2000); // Wait 2 seconds after page load to start token preloading

  }, []);

  return null; // This component doesn't render anything
}

```

## accessibility-enhancements.tsx can look like this:

```
"use client";

import { useEffect } from 'react';

export function AccessibilityEnhancements() {
  useEffect(() => {
    // Function to add accessibility attributes to Privy iframe
    const enhancePrivyAccessibility = () => {
      // Find Privy iframes and add accessibility attributes
      const privyIframes = document.querySelectorAll('iframe[src*="privy.bonk.computer"]');
      privyIframes.forEach((iframe) => {
        if (!iframe.getAttribute('title')) {
          iframe.setAttribute('title', 'Privy Wallet Authentication');
          iframe.setAttribute('aria-label', 'Privy embedded wallet authentication interface');
        }
      });

      // Find bonk logo images and add alt text (including hidden ones)
      const bonkImages = document.querySelectorAll('img[src*="bonklogo.png"]');
      bonkImages.forEach((img) => {
        if (!img.getAttribute('alt') && !img.getAttribute('title')) {
          img.setAttribute('alt', 'Bonk Computer Logo');
          img.setAttribute('title', 'Bonk Computer Logo');
        }
      });

      // Also check for images with computed style display:none
      const allImages = document.querySelectorAll('img[src*="bonklogo"]');
      allImages.forEach((img) => {
        const computedStyle = window.getComputedStyle(img);
        if (computedStyle.display === 'none' && !img.getAttribute('alt')) {
          img.setAttribute('alt', 'Bonk Computer Logo');
          img.setAttribute('title', 'Bonk Computer Logo');
        }
      });

      // Find any other iframes without titles
      const iframes = document.querySelectorAll('iframe:not([title])');
      iframes.forEach((iframe) => {
        const src = iframe.getAttribute('src') || '';
        if (src.includes('privy')) {
          iframe.setAttribute('title', 'Privy Authentication Interface');
          iframe.setAttribute('aria-label', 'Authentication interface for wallet connection');
        } else if (src.includes('e2b')) {
          iframe.setAttribute('title', 'Virtual Machine Interface');
          iframe.setAttribute('aria-label', 'Interactive virtual machine terminal');
        } else if (src.includes('jup.ag')) {
          iframe.setAttribute('title', 'Jupiter Swap Terminal');
          iframe.setAttribute('aria-label', 'Token swap interface powered by Jupiter');
        } else {
          iframe.setAttribute('title', 'Embedded Content');
          iframe.setAttribute('aria-label', 'Embedded interactive content');
        }
      });
    };

    // Function to handle fetchpriority compatibility
    const handleFetchPriorityCompatibility = () => {
      // Find all link elements with fetchpriority and add data-fetchpriority for Firefox compatibility
      const linksWithFetchPriority = document.querySelectorAll('link[fetchpriority]');
      linksWithFetchPriority.forEach((link) => {
        const fetchPriority = link.getAttribute('fetchpriority');
        if (fetchPriority && !link.getAttribute('data-fetchpriority')) {
          link.setAttribute('data-fetchpriority', fetchPriority);
        }
      });
    };

    // Function to remove deprecated unload event listeners
    const removeDeprecatedUnloadListeners = () => {
      // Override addEventListener to prevent unload event listeners
      const originalAddEventListener = window.addEventListener;
      window.addEventListener = function(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) {
        if (type === 'unload') {
          console.warn('Unload event listener blocked - deprecated feature');
          return;
        }
        if (listener) {
          return originalAddEventListener.call(this, type, listener, options);
        }
      };
    };

    // Run enhancements immediately
    enhancePrivyAccessibility();
    handleFetchPriorityCompatibility();
    removeDeprecatedUnloadListeners();

    // Set up mutation observer to handle dynamically added content
    const observer = new MutationObserver((mutations) => {
      let shouldEnhance = false;
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.tagName === 'IFRAME' || element.querySelector('iframe') ||
                  element.tagName === 'IMG' || element.querySelector('img') ||
                  element.tagName === 'LINK' || element.querySelector('link')) {
                shouldEnhance = true;
              }
            }
          });
        }
      });
      
      if (shouldEnhance) {
        setTimeout(() => {
          enhancePrivyAccessibility();
          handleFetchPriorityCompatibility();
        }, 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, []);

  return null; // This component doesn't render anything
}
```

## service worker sw.js can look like this:

```
// Service Worker for Bonk Computer
const CACHE_NAME = 'bonk-computer-v1';
const STATIC_CACHE = 'static-v1';
const API_CACHE = 'api-v1';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/app',
  '/login',
  '/manifest.json',
  '/bonklogo.svg',
  '/images/BonkComputerLogoMain.png',
  '/images/bct-logo.png',
  '/bctgates.jpeg'
  // Token logos removed from immediate cache - will be cached on-demand when requested
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) return;

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - cache with network first strategy
    event.respondWith(handleApiRequest(request));
  } else if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf)$/)) {
    // Static assets - cache first strategy
    event.respondWith(handleStaticAsset(request));
  } else {
    // HTML pages - network first with cache fallback
    event.respondWith(handlePageRequest(request));
  }
});

// Network first strategy for API requests
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  // Don't cache sensitive API endpoints
  const sensitiveEndpoints = ['/api/user', '/api/wallet-balance', '/api/desktop'];
  if (sensitiveEndpoints.some(endpoint => url.pathname.includes(endpoint))) {
    return fetch(request);
  }

  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return cached version if network fails
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Cache first strategy for static assets
async function handleStaticAsset(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Update cache in background
    fetch(request).then(response => {
      if (response.ok) {
        caches.open(STATIC_CACHE).then(cache => {
          cache.put(request, response);
        });
      }
    }).catch(() => {
      // Ignore network errors for background updates
    });
    
    return cachedResponse;
  }

  // If not in cache, fetch from network and cache
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Failed to fetch static asset:', request.url);
    throw error;
  }
}

// Network first strategy for HTML pages
async function handlePageRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return cached version if network fails
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page if available
    return caches.match('/');
  }
}

```

## postinstall scripts:

```
// This script ensures Prisma client is generated during build
import { execSync } from 'node:child_process';

try {
  console.log('Running Prisma generate...');
  execSync('npx prisma generate');
  console.log('Prisma client generated successfully!');
} catch (error) {
  console.error('Error generating Prisma client:', error.message);
  process.exit(1);
}

```

```
// This script ensures Prisma client is generated during build
import { execSync } from 'node:child_process';

try {
  console.log('Running Prisma generate...');
  execSync('npx prisma generate');
  console.log('Prisma client generated successfully!');
} catch (error) {
  console.error('Error generating Prisma client:', error.message);
  process.exit(1);
}

```

## IMPLEMENT THESE TYPES OF OPTIMIZATIONS BUT FOR OUR APPLICATION. INTEGRATE CAREFULLY AND MATICULASLY TO ENSURE NO EXISTING CODE IS DELETED OR MODIFIED IN THE PROCESS.
