'use client'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import Dialog from '@/components/common/dialog'
import { CreateProfile } from '@/components/profile/create-profile'
import { usePrivy } from '@privy-io/react-auth'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface CreateProfileContainerProps {
  setIsProfileCreated: (username: string) => void
  setProfileUsername: (val: string) => void
}

export function CreateProfileContainer({
  setIsProfileCreated,
  setProfileUsername,
}: CreateProfileContainerProps) {
  const { walletAddress, loadingMainUsername, mainUsername } = useCurrentWallet()
  const { ready, authenticated, user } = usePrivy()
  const [isOpen, setIsOpen] = useState(false)
  const [checkingExistingProfile, setCheckingExistingProfile] = useState(false)
  const [existingProfile, setExistingProfile] = useState<any>(null)
  const router = useRouter()

  // Check if user already has a profile
  useEffect(() => {
    const checkExistingProfile = async () => {
      if (!ready || !authenticated || !user?.id || !walletAddress) {
        return
      }

      setCheckingExistingProfile(true)
      try {
        const response = await fetch(`/api/profiles/info?privyDid=${user.id}`)
        if (response.ok) {
          const profileData = await response.json()
          if (profileData && profileData.username) {
            setExistingProfile(profileData)
            // User already has a profile, redirect them
            setIsProfileCreated(profileData.username)
            setProfileUsername(profileData.username)
            router.push(`/${profileData.username}`)
            return
          }
        }
        // If we get here, user doesn't have a profile yet
        setExistingProfile(null)
      } catch (error) {
        console.error('Error checking existing profile:', error)
        // On error, assume no profile and allow creation
        setExistingProfile(null)
      } finally {
        setCheckingExistingProfile(false)
      }
    }

    checkExistingProfile()
  }, [ready, authenticated, user?.id, walletAddress, setIsProfileCreated, setProfileUsername, router])

  // Auto-open dialog when user is authenticated but has no profile
  useEffect(() => {
    if (ready && authenticated && walletAddress && !loadingMainUsername && !checkingExistingProfile && !existingProfile && !mainUsername) {
      setIsOpen(true)
    }
  }, [ready, authenticated, walletAddress, loadingMainUsername, checkingExistingProfile, existingProfile, mainUsername])

  const handleProfileCreated = (isCreated: boolean) => {
    if (isCreated) {
      setIsOpen(false)
    }
  }

  const handleProfileUsername = (username: string) => {
    setProfileUsername(username)
    setIsProfileCreated(username)
  }

  // Show loading state while determining authentication status or checking existing profile
  if (!ready || !authenticated || !walletAddress || loadingMainUsername || checkingExistingProfile) {
    return (
      <button className="px-4 py-2 text-sm text-muted-foreground">
        {!ready ? 'Loading...' : checkingExistingProfile ? 'Checking profile...' : 'Loading profile...'}
      </button>
    )
  }

  // If user already has a profile, show their username instead of create button
  if (existingProfile || mainUsername) {
    return (
      <button
        onClick={() => router.push(`/${existingProfile?.username || mainUsername}`)}
        className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 rounded-md transition-colors"
      >
        {existingProfile?.username || mainUsername}
      </button>
    )
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
      >
        Create Profile
      </button>
      
      <Dialog isOpen={isOpen} setIsOpen={setIsOpen}>
        <CreateProfile
          setCreateProfileDialog={setIsOpen}
          setIsProfileCreated={handleProfileCreated}
          setProfileUsername={handleProfileUsername}
        />
      </Dialog>
    </>
  )
}
