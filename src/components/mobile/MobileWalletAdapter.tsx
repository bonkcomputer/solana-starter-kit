'use client'

import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'

export function MobileWalletAdapter() {
  const { authenticated, login } = usePrivy()
  const [showMobileWallets, setShowMobileWallets] = useState(false)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    try {
      // Only show on mobile/TWA
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                       window.matchMedia('(display-mode: standalone)').matches

      if (isMobile) {
        setShowMobileWallets(true)
      }
    } catch (error) {
      console.warn('MobileWalletAdapter: Error detecting mobile environment:', error)
    }
  }, [])

  const handleMobileWalletConnect = () => {
    try {
      // Use Privy's wallet login method which should handle mobile wallet detection
      login({
        loginMethods: ['wallet']
      })
    } catch (error) {
      console.error('Mobile wallet connect error:', error)
      
      // Fallback: Try to trigger mobile wallet connection via deep links
      const walletDeepLinks = [
        'phantom://browse/mobile.bonk.computer',
        'solflare://browse/mobile.bonk.computer',
        'backpack://browse/mobile.bonk.computer',
        'solana-wallet://browse/mobile.bonk.computer'
      ]
      
      // Try the first available wallet deep link
      if (walletDeepLinks.length > 0) {
        window.location.href = walletDeepLinks[0]
      }
    }
  }

  if (!showMobileWallets || authenticated) {
    return null
  }

  return (
    <div className="mobile-wallet-adapter bg-gray-900 p-4 rounded-lg">
      <h3 className="text-white text-lg font-semibold mb-3">External Wallet</h3>
      <button
        onClick={handleMobileWalletConnect}
        className="w-full flex items-center justify-center p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white font-medium"
      >
        <svg 
          className="w-6 h-6 mr-2" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" 
          />
        </svg>
        Connect Mobile Wallet
      </button>
      <p className="text-gray-400 text-xs mt-2 text-center">
        Works with Phantom, Solflare, Backpack, and other Solana wallets
      </p>
    </div>
  )
}