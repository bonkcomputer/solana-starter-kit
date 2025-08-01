'use client'

import { PrivyProvider } from '@privy-io/react-auth'
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana'

// Mobile wallet detection utility
const isMobileOrTWA = () => {
  if (typeof window === 'undefined') return false
  
  // Check for TWA (Trusted Web Activity)
  const isTWA = window.matchMedia('(display-mode: standalone)').matches ||
                (window.navigator as any).standalone === true ||
                window.document.referrer.includes('android-app://')
  
  // Check for mobile user agent
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  return isTWA || isMobile
}

export function PrivyClientProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID
  const solanaRpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
  const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

  // Robust env var checks
  if (!privyAppId) {
    const errorMsg = 'NEXT_PUBLIC_PRIVY_APP_ID is required';
    console.error('PrivyClientProvider error:', errorMsg);
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Configuration Error</h2>
          <p className="text-red-600 mb-4">{errorMsg}</p>
          <p className="text-sm text-gray-700">Please check your environment configuration and refresh the page.</p>
        </div>
      </div>
    )
  }
  if (!solanaRpcUrl) {
    const errorMsg = 'NEXT_PUBLIC_SOLANA_RPC_URL is required';
    console.error('PrivyClientProvider error:', errorMsg);
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Configuration Error</h2>
          <p className="text-red-600 mb-4">{errorMsg}</p>
          <p className="text-sm text-gray-700">Please check your environment configuration and refresh the page.</p>
        </div>
      </div>
    )
  }
  if (!walletConnectProjectId) {
    const errorMsg = 'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is required for WalletConnect functionality.';
    console.error('PrivyClientProvider error:', errorMsg);
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Configuration Error</h2>
          <p className="text-red-600 mb-4">{errorMsg}</p>
          <p className="text-sm text-gray-700">Please check your environment configuration and refresh the page.</p>
        </div>
      </div>
    )
  }

  // Dynamic configuration based on environment
  const isMobile = isMobileOrTWA()
  
  // Mobile-optimized configuration
  const mobileConfig = {
    loginMethods: ['wallet', 'email', 'twitter'] as ('wallet' | 'email' | 'twitter')[],
    appearance: {
      theme: 'dark' as const,
      accentColor: '#676FFF' as `#${string}`,
      logo: '/bctlogo.png',
    },
    externalWallets: {
      solana: {
        connection: {
          endpoint: solanaRpcUrl,
        },
        connectors: toSolanaWalletConnectors({ 
          shouldAutoConnect: false,
        }),
      },
    },
    embeddedWallets: {
      createOnLogin: 'users-without-wallets' as const,
      requireUserPasswordOnCreate: false,
    },
    walletConnectCloudProjectId: walletConnectProjectId,
  }

  // Desktop configuration with external wallets
  const desktopConfig = {
    loginMethods: ['wallet', 'email', 'twitter'] as ('wallet' | 'email' | 'twitter')[],
    appearance: {
      theme: 'dark' as const,
      accentColor: '#676FFF' as `#${string}`,
      logo: '/bctlogo.png',
    },
    externalWallets: {
      solana: {
        connection: {
          endpoint: solanaRpcUrl,
        },
        connectors: toSolanaWalletConnectors({ 
          shouldAutoConnect: false,
        }),
      },
    },
    embeddedWallets: {
      createOnLogin: 'users-without-wallets' as const,
      requireUserPasswordOnCreate: false,
    },
    walletConnectCloudProjectId: walletConnectProjectId,
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      config={isMobile ? mobileConfig : desktopConfig}
    >
      {children}
    </PrivyProvider>
  )
}
