'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useEffect, useState } from 'react'
import { isValidSolanaAddress, validateWalletAddress } from '@/utils/wallet'

export function useCurrentWallet() {
  const { user, ready, authenticated } = usePrivy()
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [mainUsername, setMainUsername] = useState<string | null>(null)
  const [loadingMainUsername, setLoadingMainUsername] = useState(true)

  useEffect(() => {
    if (!ready) {
      return // Wait for Privy to be ready
    }

    if (!authenticated) {
      setWalletAddress(null)
      setMainUsername(null)
      setLoadingMainUsername(false)
      return
    }

    // New, robust wallet detection logic
    const potentialConnectedWallet = user?.linkedAccounts?.find(
      (account): account is any =>
        account.type === 'wallet' &&
        (account as any).chainType === 'solana'
    ) as any | undefined

    const connectedSolanaWallet = potentialConnectedWallet?.address && isValidSolanaAddress(potentialConnectedWallet.address)
      ? potentialConnectedWallet
      : undefined
    
    const embeddedWallet = user?.wallet
    let finalSolanaWalletAddress: string | undefined

    if (connectedSolanaWallet?.address && isValidSolanaAddress(connectedSolanaWallet.address)) {
      finalSolanaWalletAddress = connectedSolanaWallet.address
    } else if (embeddedWallet?.address) {
      const validation = validateWalletAddress(embeddedWallet.address)
      if (validation.isValid && validation.isSolana) {
        finalSolanaWalletAddress = embeddedWallet.address
      }
    }
    setWalletAddress(finalSolanaWalletAddress || null)
  }, [user, ready, authenticated])

  useEffect(() => {
    if (walletAddress) {
      checkProfile(walletAddress)
    } else if (ready && authenticated) {
        // If ready and authenticated but we have no valid solana wallet
        setLoadingMainUsername(false)
        setMainUsername(null)
    }
  }, [walletAddress, ready, authenticated])

  // Automatic profile check function
  const checkProfile = async (address: string) => {
    try {
      setLoadingMainUsername(true)
      const response = await fetch(`/api/profiles?walletAddress=${address}`, {
        cache: 'no-store',
      })
      const data = await response.json()
      
      if (data.profiles && data.profiles.length > 0) {
        const username = data.profiles[0].profile?.username || data.profiles[0].username
        setMainUsername(username)
      } else {
        setMainUsername(null)
      }
    } catch (error) {
      console.error('Error checking profile:', error)
      setMainUsername(null)
    } finally {
      setLoadingMainUsername(false)
    }
  }

  return { 
    walletAddress, 
    mainUsername, 
    loadingMainUsername,
    checkProfile: () => walletAddress ? checkProfile(walletAddress) : Promise.resolve(null)
  }
}
