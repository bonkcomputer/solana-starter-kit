'use client'

import { useSolanaWallets, usePrivy } from '@privy-io/react-auth'
import { useEffect, useState } from 'react'

export function useCurrentWallet() {
  const { wallets } = useSolanaWallets()
  const { ready, authenticated } = usePrivy()
  const [walletAddress, setWalletAddress] = useState('')
  const [mainUsername, setMainUsername] = useState<string | null>(null)
  const [loadingMainUsername, setLoadingMainUsername] = useState(false)

  // Handle wallet detection and clear state on logout
  useEffect(() => {
    if (!ready) {
      setLoadingMainUsername(true)
      return
    }

    if (!authenticated) {
      // Clear all state when user logs out
      setWalletAddress('')
      setMainUsername(null)
      setLoadingMainUsername(false)
      return
    }

    // Get the first Solana wallet
    if (wallets.length > 0) {
      const primaryWallet = wallets[0]
      setWalletAddress(primaryWallet.address)
      setLoadingMainUsername(false)
    } else {
      setWalletAddress('')
      setLoadingMainUsername(false)
    }
  }, [wallets, ready, authenticated])

  // Clear username when authentication changes
  useEffect(() => {
    if (!authenticated && mainUsername) {
      setMainUsername(null)
    }
  }, [authenticated, mainUsername])

  // Force clear cache on logout
  useEffect(() => {
    if (!authenticated && ready) {
      // Clear any cached profile data
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            if (name.includes('api')) {
              caches.delete(name)
            }
          })
        })
      }
    }
  }, [authenticated, ready])

  // Manual profile check function (not automatic)
  const checkProfile = async () => {
    if (!walletAddress || !authenticated) return null

    try {
      setLoadingMainUsername(true)
      const response = await fetch(`/api/profiles?walletAddress=${walletAddress}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      })
      const data = await response.json()
      
      if (data.profiles && data.profiles.length > 0) {
        const username = data.profiles[0].profile?.username || data.profiles[0].username
        setMainUsername(username)
        return username
      } else {
        setMainUsername(null)
        return null
      }
    } catch (error) {
      console.error('Error checking profile:', error)
      setMainUsername(null)
      return null
    } finally {
      setLoadingMainUsername(false)
    }
  }

  return { 
    walletAddress, 
    mainUsername, 
    loadingMainUsername,
    checkProfile
  }
}
