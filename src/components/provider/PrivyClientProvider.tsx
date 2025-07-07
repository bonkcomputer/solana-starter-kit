'use client'

import { PrivyProvider } from '@privy-io/react-auth'
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana'

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

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        loginMethods: ['wallet', 'email'],
        appearance: {
          theme: 'dark',
          accentColor: '#676FFF',
          logo: '/bctlogo.png',
        },
        externalWallets: {
          solana: {
            // @ts-expect-error
            connection: {
              endpoint: solanaRpcUrl,
            },
            connectors: toSolanaWalletConnectors({ 
              shouldAutoConnect: false,
            }),
          },
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false,
        },
        walletConnectCloudProjectId: walletConnectProjectId,
      }}
    >
      {children}
    </PrivyProvider>
  )
}
