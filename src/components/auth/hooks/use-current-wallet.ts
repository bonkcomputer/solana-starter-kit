'use client'

import { useGetProfiles } from '@/components/auth/hooks/use-get-profiles'
import { useWallets } from '@privy-io/react-auth'
import { useState } from 'react'

export function useCurrentWallet() {
  const { wallets } = useWallets()
  const walletAddress = wallets[0]?.address || ''

  const { profiles, loading } = useGetProfiles({
    walletAddress: walletAddress || '',
  })

  return {
    walletIsConnected: !!walletAddress,
    walletAddress,
    mainUsername: profiles?.[0]?.profile?.username,
    loadingMainUsername: loading,
  }
}
