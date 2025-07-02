'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useCallback, useState } from 'react'

interface UsernameChangeInfo {
  canChange: boolean
  currentUsername: string
  lastUsernameChange: string | null
  nextAllowedChange: string | null
  daysRemaining: number
}

export const useUpdateUsername = () => {
  const { user } = usePrivy()
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
    if (!user?.id) {
      setError('User not authenticated')
      return false
    }

    // Client-side validation
    if (!newUsername || newUsername.length < 3 || newUsername.length > 20) {
      setError('Username must be between 3 and 20 characters')
      return false
    }

    const usernameRegex = /^[a-z0-9]+$/
    if (!usernameRegex.test(newUsername)) {
      setError('Username must contain only lowercase letters and numbers')
      return false
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/profiles/username', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newUsername,
          privyDid: user.id
        }),
      })

      const result = await response.json()

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
      setError(err.message || 'Something went wrong')
      return false
    } finally {
      setLoading(false)
    }
  }, [user, checkUsernameEligibility])

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