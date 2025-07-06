'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'

export function PrivyDebug() {
  const { ready, authenticated, user, login, logout } = usePrivy()
  const { walletAddress, mainUsername } = useCurrentWallet()

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg border border-gray-700 text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2 text-yellow-400">🔧 Privy Debug</h3>
      <div className="space-y-1">
        <div>Ready: <span className={ready ? 'text-green-400' : 'text-red-400'}>{ready ? '✅' : '❌'}</span></div>
        <div>Authenticated: <span className={authenticated ? 'text-green-400' : 'text-red-400'}>{authenticated ? '✅' : '❌'}</span></div>
        <div>User ID: <span className="text-blue-400">{user?.id || 'None'}</span></div>
        <div>Wallet Address: <span className="text-purple-400">{walletAddress || 'None'}</span></div>
        <div>Username: <span className="text-green-400">{mainUsername || 'None'}</span></div>
        <div>Email: <span className="text-cyan-400">{user?.email?.address || 'None'}</span></div>
        <div>Wallets: <span className="text-orange-400">{user?.linkedAccounts?.length || 0}</span></div>
        
        {/* Login/Logout buttons for debugging */}
        <div className="mt-3 space-x-2">
          {!authenticated ? (
            <button 
              onClick={() => login()}
              className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs"
            >
              Debug Login
            </button>
          ) : (
            <button 
              onClick={() => logout()}
              className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
            >
              Debug Logout
            </button>
          )}
        </div>

        {/* Environment check */}
        <div className="mt-2 pt-2 border-t border-gray-600">
          <div>App ID: <span className="text-yellow-400">{process.env.NEXT_PUBLIC_PRIVY_APP_ID ? '✅' : '❌'}</span></div>
          <div>RPC URL: <span className="text-yellow-400">{process.env.NEXT_PUBLIC_SOLANA_RPC_URL ? '✅' : '❌'}</span></div>
          <div>WC Project: <span className="text-yellow-400">{process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ? '✅' : '❌'}</span></div>
        </div>

        {/* Recent errors */}
        {user && (
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div className="text-xs text-gray-400">
              Last login: {user.createdAt ? new Date(user.createdAt).toLocaleTimeString() : 'Unknown'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 