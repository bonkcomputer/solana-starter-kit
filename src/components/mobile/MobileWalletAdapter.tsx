'use client'

import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'

interface MobileWallet {
  name: string
  icon: string
  installed: boolean
  deepLink: string
}

// Mobile wallet detection for Android
const detectMobileWallets = (): MobileWallet[] => {
  if (typeof window === 'undefined') return []
  
  const wallets: MobileWallet[] = []
  
  // Phantom Wallet
  wallets.push({
    name: 'Phantom',
    icon: '👻',
    installed: !!(window as any).phantom?.solana,
    deepLink: 'phantom://browse/mobile.bonk.computer'
  })
  
  // Solflare Wallet
  wallets.push({
    name: 'Solflare',
    icon: '🌟',
    installed: !!(window as any).solflare,
    deepLink: 'solflare://browse/mobile.bonk.computer'
  })
  
  return wallets
}

export function MobileWalletAdapter() {
  const { authenticated } = usePrivy()
  const [wallets, setWallets] = useState<MobileWallet[]>([])
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
        setWallets(detectMobileWallets())
      }
    } catch (error) {
      console.warn('MobileWalletAdapter: Error detecting mobile environment:', error)
    }
  }, [])

  const handleMobileWalletConnect = (wallet: MobileWallet) => {
    if (wallet.installed) {
      // Try to connect via deep link
      window.location.href = wallet.deepLink
    } else {
      // Redirect to wallet installation
      const installUrl = wallet.name === 'Phantom' 
        ? 'https://play.google.com/store/apps/details?id=app.phantom'
        : 'https://play.google.com/store/apps/details?id=com.solflare.mobile'
      
      window.open(installUrl, '_blank')
    }
  }

  if (!showMobileWallets || authenticated) {
    return null
  }

  return (
    <div className="mobile-wallet-adapter bg-gray-900 p-4 rounded-lg">
      <h3 className="text-white text-lg font-semibold mb-3">Connect Mobile Wallet</h3>
      <div className="space-y-2">
        {wallets.map((wallet) => (
          <button
            key={wallet.name}
            onClick={() => handleMobileWalletConnect(wallet)}
            className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{wallet.icon}</span>
              <span className="text-white font-medium">{wallet.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              {wallet.installed ? (
                <span className="text-green-400 text-sm">Installed</span>
              ) : (
                <span className="text-gray-400 text-sm">Install</span>
              )}
              <span className="text-gray-400">→</span>
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-gray-400 text-sm text-center">
          Mobile wallets connect via deep linking
        </p>
      </div>
    </div>
  )
}