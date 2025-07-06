'use client'

import { IUser } from '@/models/profile.models'
import { usePrivy } from '@privy-io/react-auth'
import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { useCallback, useState } from 'react'

export const useUpdateProfileInfo = (username: string) => {
  const { user } = usePrivy()
  const { walletAddress } = useCurrentWallet()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)

  const updateProfile = useCallback(async (profileData: Partial<IUser>) => {
    console.log('🔍 Frontend - updateProfile called with:', {
      profileData,
      username,
      userPrivyId: user?.id,
      walletAddress,
      userExists: !!user
    });

    if (!user?.id) {
        setError('User not authenticated');
        return;
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const payload = {
        ...profileData,
        privyDid: user.id,
        solanaWalletAddress: walletAddress
      };

      console.log('🔍 Frontend - Sending profile update API request with payload:', payload);

      const response = await fetch(`/api/profiles/info?username=${username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      console.log('🔍 Frontend - Profile update API response:', {
        status: response.status,
        ok: response.ok,
        result
      });

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile')
      }

      setSuccess(true)
      return result
    } catch (err: any) {
      console.error('🔍 Frontend - Error in updateProfile:', err);
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [username, user, walletAddress])

  return { updateProfile, loading, error, success }
}
