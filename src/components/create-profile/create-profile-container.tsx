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
  const { walletAddress } = useCurrentWallet()
  const { ready, authenticated } = usePrivy()
  const [isOpen, setIsOpen] = useState(true) // Start with dialog open

  // Handle profile creation success
  const handleProfileCreated = (isCreated: boolean) => {
    if (isCreated) {
      setIsOpen(false)
    }
  }

  // Handle username setting
  const handleProfileUsername = (username: string) => {
    setProfileUsername(username)
    setIsProfileCreated(username)
  }

  // Auto-open dialog when component mounts
  useEffect(() => {
    setIsOpen(true)
  }, [])

  // Only show if user is authenticated and has a wallet but no profile
  if (!ready || !authenticated || !walletAddress) {
    return null
  }

  return (
    <Dialog isOpen={isOpen} setIsOpen={setIsOpen}>
      <CreateProfile
        setCreateProfileDialog={setIsOpen}
        setIsProfileCreated={handleProfileCreated}
        setProfileUsername={handleProfileUsername}
      />
    </Dialog>
  )
}
