'use client'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { Button } from '@/components/common/button'
import { useUpdateProfileInfo } from '@/components/profile/hooks/use-update-profile'
import { IUser } from '@/models/profile.models'
import { usePrivy } from '@privy-io/react-auth'
import { Pencil } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Props {
  username: string
  data?: IUser | null
  refetch: () => void
}

export function Bio({ username, data, refetch }: Props) {
  const { updateProfile, getCurrentProfileData, loading, optimisticProfile } = useUpdateProfileInfo(username)
  const [bio, setBio] = useState(data?.bio || '')
  const [isEditing, setIsEditing] = useState(false)
  const [displayBio, setDisplayBio] = useState(data?.bio || '')

  const { mainUsername, walletAddress } = useCurrentWallet()
  const { user } = usePrivy()

  // Listen for profile update events
  useEffect(() => {
    const handleProfileUpdated = (event: CustomEvent) => {
      const { profileData } = event.detail
      if (profileData.bio !== undefined) {
        setDisplayBio(profileData.bio || '')
      }
    }

    const handleProfileUpdateFailed = () => {
      // Revert to original bio
      setDisplayBio(data?.bio || '')
    }

    const handleProfileUpdateConfirmed = (event: CustomEvent) => {
      const { profileData } = event.detail
      if (profileData.bio !== undefined) {
        setDisplayBio(profileData.bio || '')
        refetch() // Refresh the data
      }
    }

    window.addEventListener('profile-updated', handleProfileUpdated as EventListener)
    window.addEventListener('profile-update-failed', handleProfileUpdateFailed as EventListener)
    window.addEventListener('profile-update-confirmed', handleProfileUpdateConfirmed as EventListener)

    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdated as EventListener)
      window.removeEventListener('profile-update-failed', handleProfileUpdateFailed as EventListener)
      window.removeEventListener('profile-update-confirmed', handleProfileUpdateConfirmed as EventListener)
    }
  }, [data?.bio, refetch])

  // Update display bio when data changes
  useEffect(() => {
    if (data?.bio !== undefined) {
      setDisplayBio(data.bio || '')
    }
  }, [data?.bio])

  // Update display bio when optimistic profile changes
  useEffect(() => {
    if (data) {
      const currentProfile = getCurrentProfileData(data)
      if (currentProfile.bio !== undefined) {
        setDisplayBio(currentProfile.bio || '')
      }
    }
  }, [getCurrentProfileData, data])

  const handleSaveBio = async () => {
    await updateProfile({ bio })
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setBio(displayBio) // Reset to current display bio
    setIsEditing(false)
  }

  const handleStartEdit = () => {
    setBio(displayBio)
    setIsEditing(true)
  }

  // Check ownership by comparing mainUsername, or by checking if the profile data matches the current user
  const isOwner = mainUsername === username || 
                  (data?.privyDid && user?.id && data.privyDid === user.id) ||
                  (data?.solanaWalletAddress && walletAddress && data.solanaWalletAddress === walletAddress)

  return (
    <div className="mt-4">
      {isOwner ? (
        isEditing ? (
          <div className="flex flex-col items-center space-y-2">
            <input
              type="text"
              className="border-b border-muted-light p-2 w-full outline-0"
              value={bio}
              placeholder="Enter your bio"
              onChange={(e) => setBio(e.target.value)}
              maxLength={160}
            />
            <div className="text-sm text-gray-400 w-full text-right">
              {bio.length}/160 characters
            </div>
            <div className="w-full flex items-center justify-end space-x-4">
              <Button
                className="!w-20 justify-center"
                onClick={handleCancelEdit}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                className="!w-20 justify-center"
                type="submit"
                variant="secondary"
                onClick={handleSaveBio}
                disabled={loading}
              >
                {loading ? '. . .' : 'Save'}
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <span className="flex items-center space-x-2">
              <p>Bio</p>
              <Button onClick={handleStartEdit} variant="ghost">
                <Pencil size={16} />
              </Button>
            </span>
            <p className="text-gray">
              {displayBio || 'no bio'}
              {optimisticProfile?.bio !== undefined && (
                <span className="ml-2 text-sm text-blue-600">(updating...)</span>
              )}
            </p>
          </div>
        )
      ) : (
        <div>
          <p>Bio</p>
          <p className="text-gray">
            {displayBio || 'no bio'}
          </p>
        </div>
      )}
    </div>
  )
}
