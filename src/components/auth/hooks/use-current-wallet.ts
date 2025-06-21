'use client'

import { useWallets, usePrivy } from '@privy-io/react-auth'
import { useEffect, useState } from 'react'
import { useGetProfiles } from './use-get-profiles'

export function useCurrentWallet() {
  const { wallets } = useWallets()
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

    // Find Solana wallet - check wallet properties
    const solanaWallet = wallets.find((wallet: any) => {
      console.log('Checking wallet:', wallet)
      
      // Check for Solana-specific properties and address format
      const isSolanaAddress = wallet.address && 
        wallet.address.length >= 32 && 
        wallet.address.length <= 44 && 
        !wallet.address.startsWith('0x') &&
        /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(wallet.address)
      
      // Check various possible properties that might indicate Solana
      const hasSolanaProperty = Object.keys(wallet).some(key => 
        wallet[key] === 'solana' || 
        (typeof wallet[key] === 'string' && wallet[key].toLowerCase().includes('solana'))
      )
      
      return isSolanaAddress || hasSolanaProperty
    })

    if (solanaWallet) {
      console.log('Found Solana wallet:', solanaWallet.address)
      setWalletAddress(solanaWallet.address)
    } else {
      // Check if we have any wallets at all - if yes, try the first one
      if (wallets.length > 0) {
        console.log('No clear Solana wallet found, using first available wallet:', wallets[0].address)
        setWalletAddress(wallets[0].address)
      } else {
        console.log('No wallets found')
        setWalletAddress('')
        setLoadingMainUsername(false)
      }
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
