'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { useCallback, useState } from 'react'
import { validateUsername } from '@/utils/username-validation'

interface UsernameChangeInfo {
  canChange: boolean
  currentUsername: string
  lastUsernameChange: string | null
  nextAllowedChange: string | null
  daysRemaining: number
}

export const useUpdateUsername = () => {
  const { user } = usePrivy()
  const { walletAddress, mainUsername } = useCurrentWallet()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [usernameInfo, setUsernameInfo] = useState<UsernameChangeInfo | null>(null)

  // Check if user can change username
  const checkUsernameEligibility = useCallback(async () => {
    if (!user?.id) {
      // Don't set error for unauthenticated users, just return null silently
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/profiles/username?privyDid=${user.id}`, {
        method: 'GET',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to check username eligibility')
      }

      setUsernameInfo(result)
      return result
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      return null
    } finally {
      setLoading(false)
    }
  }, [user])

  // Update username
  const updateUsername = useCallback(async (newUsername: string) => {
    console.log('🔍 Frontend - updateUsername called with:', {
      newUsername,
      userPrivyId: user?.id,
      mainUsername,
      walletAddress,
      userExists: !!user
    });

    if (!user?.id) {
      setError('User not authenticated')
      return false
    }

    // Client-side validation
    const validation = validateUsername(newUsername)
    if (!validation.isValid) {
      setError(validation.error || 'Invalid username')
      return false
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const requestBody = {
        newUsername,
        privyDid: user.id,
        currentUsername: mainUsername,
        solanaWalletAddress: walletAddress
      };

      console.log('🔍 Frontend - Sending API request with body:', requestBody);

      const response = await fetch('/api/profiles/username', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const result = await response.json()

      console.log('🔍 Frontend - API response:', {
        status: response.status,
        ok: response.ok,
        result
      });

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 429) {
          setError(`${result.error}. You can change it again in ${result.daysRemaining} day(s).`)
        } else {
          setError(result.error || 'Failed to update username')
        }
        return false
      }

      setSuccess(true)
      // Refresh username eligibility info
      await checkUsernameEligibility()
      return true
    } catch (err: any) {
      console.error('🔍 Frontend - Error in updateUsername:', err);
      setError(err.message || 'Something went wrong')
      return false
    } finally {
      setLoading(false)
    }
  }, [user, checkUsernameEligibility, mainUsername, walletAddress])

  return { 
    updateUsername, 
    checkUsernameEligibility,
    usernameInfo,
    loading, 
    error, 
    success,
    setError,
    setSuccess
  }
} 