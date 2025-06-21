'use client'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import Dialog from '@/components/common/dialog'
import { CreateProfile } from '@/components/profile/create-profile'
import { usePrivy } from '@privy-io/react-auth'
import { useEffect, useState } from 'react'

interface CreateProfileContainerProps {
  setIsProfileCreated: (username: string) => void
  setProfileUsername: (val: string) => void
}

export function CreateProfileContainer({
  setIsProfileCreated,
  setProfileUsername,
}: CreateProfileContainerProps) {
  const { walletAddress, loadingMainUsername } = useCurrentWallet()
  const { ready, authenticated } = usePrivy()
  const [isOpen, setIsOpen] = useState(false)

  // Auto-open dialog when user is authenticated but has no profile
  useEffect(() => {
    if (ready && authenticated && walletAddress && !loadingMainUsername) {
      setIsOpen(true)
    }
  }, [ready, authenticated, walletAddress, loadingMainUsername])

  const handleProfileCreated = (isCreated: boolean) => {
    if (isCreated) {
      setIsOpen(false)
    }
  }

  const handleProfileUsername = (username: string) => {
    setProfileUsername(username)
    setIsProfileCreated(username)
  }

  // Show loading state while determining authentication status
  if (!ready || !authenticated || !walletAddress || loadingMainUsername) {
    return (
      <button className="px-4 py-2 text-sm text-muted-foreground">
        {!ready ? 'Loading...' : 'Loading profile...'}
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
