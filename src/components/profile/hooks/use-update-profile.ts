'use client'

import { IUser } from '@/models/profile.models'
import { usePrivy } from '@privy-io/react-auth'
import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

export const useUpdateProfileInfo = (username: string) => {
  const { user } = usePrivy()
  const { walletAddress } = useCurrentWallet()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [optimisticProfile, setOptimisticProfile] = useState<Partial<IUser> | null>(null)

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

    // 🚀 OPTIMISTIC UPDATE: Update UI immediately
    setOptimisticProfile(profileData)
    setLoading(true)
    setError(null)
    setSuccess(false)

    // Show immediate feedback to user
    if (profileData.bio !== undefined) {
      toast.success('Bio updated!')
    }
    if (profileData.image !== undefined) {
      toast.success('Profile image updated!')
    }

    // Dispatch event to update profile across the app immediately
    window.dispatchEvent(new CustomEvent('profile-updated', {
      detail: { profileData, username }
    }))

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
        // 🔄 ROLLBACK: If API fails, revert optimistic update
        setOptimisticProfile(null)
        
        // Dispatch rollback event
        window.dispatchEvent(new CustomEvent('profile-update-failed', {
          detail: { failedProfileData: profileData, username }
        }))

        const errorMsg = result.error || 'Failed to update profile'
        setError(errorMsg)
        toast.error(`Profile update failed: ${errorMsg}`)
        throw new Error(errorMsg)
      }

      // ✅ SUCCESS: API succeeded, confirm optimistic update
      setSuccess(true)
      setOptimisticProfile(null) // Clear optimistic state since it's now real
      
      // Dispatch success event
      window.dispatchEvent(new CustomEvent('profile-update-confirmed', {
        detail: { profileData, username }
      }))

      toast.success('Profile updated successfully!')
      return result

    } catch (err: any) {
      // 🔄 ROLLBACK: If request fails, revert optimistic update
      setOptimisticProfile(null)
      
      // Dispatch rollback event
      window.dispatchEvent(new CustomEvent('profile-update-failed', {
        detail: { failedProfileData: profileData, username }
      }))

      console.error('🔍 Frontend - Error in updateProfile:', err);
      const errorMsg = err.message || 'Something went wrong'
      setError(errorMsg)
      toast.error(`Profile update failed: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }, [username, user, walletAddress])

  // Get current profile data (optimistic or actual)
  const getCurrentProfileData = useCallback((originalProfile: Partial<IUser>) => {
    if (optimisticProfile) {
      return { ...originalProfile, ...optimisticProfile }
    }
    return originalProfile
  }, [optimisticProfile])

  return { 
    updateProfile, 
    getCurrentProfileData,
    loading, 
    error, 
    success,
    optimisticProfile
  }
}
