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

  // Auto-open dialog when component mounts
  useEffect(() => {
    setIsOpen(true)
  }, [])

  // Only show if user is authenticated and has a wallet but no profile
  if (!ready || !authenticated || !walletAddress) {
    return null
  }

  // Handle username setting - this gets called with username string from CreateProfile
  const handleProfileUsername = (username: string) => {
    console.log('📝 CreateProfileContainer: Setting username and marking profile as created:', username)
    
    // Set both the username and mark profile as created
    setProfileUsername(username)
    setIsProfileCreated(username) // Parent expects username string, not boolean
  }

  // Handle profile creation success - this gets called with boolean from CreateProfile
  const handleProfileCreated = (isCreated: boolean) => {
    if (isCreated) {
      console.log('✅ CreateProfileContainer: Profile creation completed, closing dialog')
      setIsOpen(false) // Close dialog when profile creation succeeds
    }
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
