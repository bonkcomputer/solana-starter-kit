'use client'

import { usePrivy } from '@privy-io/react-auth'

export function PrivyDebug() {
  const { ready, authenticated, user } = usePrivy()
  
  // Only show in development or when explicitly enabled
  const shouldShow = process.env.NODE_ENV === 'development' || 
                    typeof window !== 'undefined' && window.location.search.includes('debug=true')
  
  if (!shouldShow) return null
  
  return (
    <div className="fixed bottom-4 right-4 bg-black border border-yellow-500 p-4 rounded text-xs text-yellow-500 max-w-sm z-50">
      <h3 className="font-bold mb-2">Privy Debug Info</h3>
      <div className="space-y-1">
        <div>App ID: {process.env.NEXT_PUBLIC_PRIVY_APP_ID ? '✅ Set' : '❌ Missing'}</div>
        <div>Ready: {ready ? '✅' : '❌'}</div>
        <div>Authenticated: {authenticated ? '✅' : '❌'}</div>
        <div>User: {user ? '✅ Present' : '❌ None'}</div>
        <div>User ID: {user?.id || 'N/A'}</div>
        <div>Linked Accounts: {user?.linkedAccounts?.length || 0}</div>
        <div className="text-xs text-gray-400 mt-2">
          Add ?debug=true to URL to show in production
        </div>
      </div>
    </div>
  )
} 