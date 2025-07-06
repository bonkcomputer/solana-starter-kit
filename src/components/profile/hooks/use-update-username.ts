'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { useCallback, useState } from 'react'
import { validateUsername } from '@/utils/username-validation'
import { toast } from 'sonner'

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
  const [optimisticUsername, setOptimisticUsername] = useState<string | null>(null)

  // Check if user can change username
  const checkUsernameEligibility = useCallback(async () => {
    if (!user?.id) {
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

  // Update username with optimistic updates
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

    // 🚀 OPTIMISTIC UPDATE: Update UI immediately
    setOptimisticUsername(newUsername)
    setLoading(true)
    setError(null)
    setSuccess(false)
    
    // Show immediate feedback to user
    toast.success(`Username changed to "${newUsername}"`)

    // Dispatch event to update username across the app immediately
    window.dispatchEvent(new CustomEvent('username-updated', {
      detail: { newUsername, oldUsername: mainUsername }
    }))

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
        // 🔄 ROLLBACK: If API fails, revert optimistic update
        setOptimisticUsername(null)
        
        // Dispatch rollback event
        window.dispatchEvent(new CustomEvent('username-update-failed', {
          detail: { failedUsername: newUsername, revertTo: mainUsername }
        }))

        // Handle specific error cases
        if (response.status === 429) {
          const errorMsg = `${result.error}. You can change it again in ${result.daysRemaining} day(s).`
          setError(errorMsg)
          toast.error(errorMsg)
        } else {
          const errorMsg = result.error || 'Failed to update username'
          setError(errorMsg)
          toast.error(`Username change failed: ${errorMsg}`)
        }
        return false
      }

      // ✅ SUCCESS: API succeeded, confirm optimistic update
      setSuccess(true)
      setOptimisticUsername(null) // Clear optimistic state since it's now real
      
      // Dispatch success event
      window.dispatchEvent(new CustomEvent('username-update-confirmed', {
        detail: { newUsername }
      }))

      // Refresh username eligibility info
      await checkUsernameEligibility()
      
      toast.success('Username updated successfully!')
      return true

    } catch (err: any) {
      // 🔄 ROLLBACK: If request fails, revert optimistic update
      setOptimisticUsername(null)
      
      // Dispatch rollback event
      window.dispatchEvent(new CustomEvent('username-update-failed', {
        detail: { failedUsername: newUsername, revertTo: mainUsername }
      }))

      console.error('🔍 Frontend - Error in updateUsername:', err);
      const errorMsg = err.message || 'Something went wrong'
      setError(errorMsg)
      toast.error(`Username change failed: ${errorMsg}`)
      return false
    } finally {
      setLoading(false)
    }
  }, [user, checkUsernameEligibility, mainUsername, walletAddress])

  // Get the current display username (optimistic or actual)
  const getCurrentUsername = useCallback(() => {
    return optimisticUsername || mainUsername
  }, [optimisticUsername, mainUsername])

  return { 
    updateUsername, 
    checkUsernameEligibility,
    getCurrentUsername,
    usernameInfo,
    loading, 
    error, 
    success,
    optimisticUsername,
    setError,
    setSuccess
  }
} 