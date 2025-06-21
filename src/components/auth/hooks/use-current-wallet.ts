'use client'

import { useSolanaWallets, usePrivy } from '@privy-io/react-auth'
import { useEffect, useState } from 'react'
import { useGetProfiles } from './use-get-profiles'

export function useCurrentWallet() {
  const { wallets } = useSolanaWallets()
  const { ready, authenticated } = usePrivy()
  const [walletAddress, setWalletAddress] = useState('')
  const [loadingMainUsername, setLoadingMainUsername] = useState(true)
  const [mainUsername, setMainUsername] = useState<string | null>(null)

  // Get profiles for the current wallet
  const { profiles, loading: profilesLoading } = useGetProfiles({
    walletAddress: walletAddress || '',
  })

  useEffect(() => {
    if (!ready) {
      setLoadingMainUsername(true)
      return
    }

    if (!authenticated) {
      setWalletAddress('')
      setMainUsername(null)
      setLoadingMainUsername(false)
      return
    }

    // useSolanaWallets already filters for Solana wallets only
    // So we can safely use the first available wallet
    if (wallets.length > 0) {
      const primaryWallet = wallets[0]
      console.log('Found Solana wallet:', primaryWallet.address)
      setWalletAddress(primaryWallet.address)
    } else {
      console.log('No Solana wallets found')
      setWalletAddress('')
      setLoadingMainUsername(false)
    }
  }, [wallets, ready, authenticated])

  useEffect(() => {
    // Only manage loading state if we're authenticated and ready
    if (!ready || !authenticated) {
      return
    }

    if (profilesLoading) {
      setLoadingMainUsername(true)
      return
    }

    // Profiles have finished loading
    if (profiles && profiles.length > 0) {
      setMainUsername(profiles[0].profile.username)
    } else {
      setMainUsername(null)
    }
    
    setLoadingMainUsername(false)
  }, [profiles, profilesLoading, ready, authenticated])

  return { 
    walletAddress, 
    mainUsername, 
    loadingMainUsername 
  }
}
