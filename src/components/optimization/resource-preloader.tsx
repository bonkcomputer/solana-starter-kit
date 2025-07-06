"use client";

import { useEffect } from 'react';

export function ResourcePreloader() {
  useEffect(() => {
    // Add preconnect for external domains
    const preconnectDomains = [
      'https://auth.privy.io',
      'https://privy.bonk.computer',
      'https://quote-api.jup.ag',
      'https://price.jup.ag',
      'https://public-api.birdeye.so',
      'https://api.tapestry.dev',
      'https://api.mainnet-beta.solana.com',
      'https://mainnet.helius-rpc.com',
      'https://fonts.googleapis.com',
      'https://2fkyfggwlscwizn6.public.blob.vercel-storage.com',
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
    const isLandingPage = window.location.pathname === '/';
    
    if (!isLandingPage) {
      // Don't preload API endpoints immediately - wait for page to settle
      setTimeout(() => {
        // Preload critical API endpoints for authenticated users with cache headers
        const authEndpoints = [
          '/api/profiles/info',
          '/api/points/user',
          '/api/portfolio'
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
      // Preload popular tokens data for landing page users
      const publicEndpoints = [
        '/api/token',  // Popular tokens
        '/api/trades'  // Recent trades
      ];

      publicEndpoints.forEach(endpoint => {
        fetch(endpoint, { method: 'GET' }).catch(() => {
          // Silently fail - this improves UX when users navigate
        });
      });
    }

    // Preload Jupiter and trading resources
    const jupiterResources = [
      'https://quote-api.jup.ag/v6/tokens',
      'https://price.jup.ag/v4/price?ids=SOL,BONK,USDC'
    ];

    jupiterResources.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    });

    // Preload critical images that might be used
    const criticalImages = [
      '/bonklogo.svg',
      '/computerlogo.svg',
      '/bctlogo.png',
      'https://2fkyfggwlscwizn6.public.blob.vercel-storage.com/bonkcomputer/BonkComputerLogoMain-FsfKSf0HTyD3BmHlOu3ylJmAaGSeEs.png',
      '/next.svg'
    ];

    criticalImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });

    // Preload token logos ONLY after critical page resources are loaded
    setTimeout(() => {
      const tokenLogos = [
        '/bonklogo.svg',      // BONK - highest priority
        '/computerlogo.svg'   // BCT - high priority  
      ];

      // Preload high priority token logos first (only after page is stable)
      tokenLogos.forEach(src => {
        const img = new Image();
        img.src = src;
      });

      // Preload common token logos with additional delay
      setTimeout(() => {
        const commonTokens = [
          'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png', // SOL
          'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png', // USDC
        ];
        
        commonTokens.forEach(src => {
          const img = new Image();
          img.src = src;
        });
      }, 1000);
    }, 2000); // Wait 2 seconds after page load to start token preloading

    // Preload Solana RPC connection
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        // Warm up RPC connection
        fetch('https://api.mainnet-beta.solana.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getHealth'
          })
        }).catch(() => {
          // Silent fail - just warming up connection
        });
      }, 500);
    }

  }, []);

  return null; // This component doesn't render anything
} 