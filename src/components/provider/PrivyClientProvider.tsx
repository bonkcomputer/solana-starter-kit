'use client'

import { PrivyProvider } from '@privy-io/react-auth'
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana'

export function PrivyClientProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID

  if (!privyAppId) {
    console.error('NEXT_PUBLIC_PRIVY_APP_ID is not set')
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Configuration Error</h1>
          <p className="text-gray-600">NEXT_PUBLIC_PRIVY_APP_ID is not configured</p>
        </div>
      </div>
    )
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: { 
          walletChainType: 'solana-only',
          theme: 'dark',
          accentColor: '#10b981', // Green accent color
          logo: 'https://trade.bonk.computer/bctlogo.png'
        },
        externalWallets: {
          solana: { 
            connectors: toSolanaWalletConnectors()
          },
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false,
        },
        mfa: {
          noPromptOnMfaRequired: false,
        }
      }}
    >
      {children}
    </PrivyProvider>
  )
}
