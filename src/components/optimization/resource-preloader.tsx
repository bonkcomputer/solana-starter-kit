"use client";

import { useEffect } from 'react';

export function ResourcePreloader() {
  useEffect(() => {
    // Only preconnect to the most critical domains that aren't already in layout.tsx
    const criticalDomains = [
      'https://auth.privy.io',
      'https://price.jup.ag',
      'https://public-api.birdeye.so',
      'https://mainnet.helius-rpc.com',
      'https://privy.bonk.computer',
      'https://quote-api.jup.ag',
      'https://api.tapestry.dev',
      'https://api.mainnet-beta.solana.com',
      'https://mainnet.helius-rpc.com',
    ];

    criticalDomains.forEach(domain => {
      const existing = document.querySelector(`link[href="${domain}"]`);
      if (!existing) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    });

    // Preload only the most critical image (BCT logo) if not already loaded
    const img = new Image();
    img.src = '/bctlogo.png';

  }, []);

  return null;
} 