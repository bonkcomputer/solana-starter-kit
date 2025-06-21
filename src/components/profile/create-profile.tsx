'use client'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { Alert } from '@/components/common/alert'
import { Button } from '@/components/common/button'
import { LoadCircle } from '@/components/common/load-circle'
import { Input } from '@/components/form/input'
import { SubmitButton } from '@/components/form/submit-button'
import { useCreateProfile } from '@/components/profile/hooks/use-create-profile'
import { useGetIdentities } from '@/components/profile/hooks/use-get-identities'
import { IProfileList } from '@/models/profile.models'
import { cn } from '@/utils/utils'
import { usePrivy } from '@privy-io/react-auth'
import { User } from 'lucide-react'
import Image from 'next/image'
import { useState, useEffect } from 'react'

interface Props {
  setCreateProfileDialog: (isOpen: boolean) => void
  setIsProfileCreated: (val: boolean) => void
  setProfileUsername: (val: string) => void
}

export function CreateProfile({
  setCreateProfileDialog,
  setIsProfileCreated,
  setProfileUsername,
}: Props) {
  const { walletAddress, loadingMainUsername, mainUsername } = useCurrentWallet()
  const { logout, user } = usePrivy()

  const [username, setUsername] = useState('')
  const [selectProfile, setSelectProfile] = useState<IProfileList | null>(null)
  const [checkingExistingProfile, setCheckingExistingProfile] = useState(true)
  const [existingProfile, setExistingProfile] = useState<any>(null)

  const {
    createProfile,
    loading: creationLoading,
    error,
    response,
  } = useCreateProfile()

  const { data: identities, loading: profilesLoading } = useGetIdentities({
    walletAddress: walletAddress || '',
  })

  // Check if user already has a profile
  useEffect(() => {
    const checkExistingProfile = async () => {
      if (!user?.id) {
        setCheckingExistingProfile(false)
        return
      }

      try {
        const response = await fetch(`/api/profiles/info?privyDid=${user.id}`)
        if (response.ok) {
          const profileData = await response.json()
          if (profileData && profileData.username) {
            setExistingProfile(profileData)
          }
        }
      } catch (error) {
        console.error('Error checking existing profile:', error)
      } finally {
        setCheckingExistingProfile(false)
      }
    }

    checkExistingProfile()
  }, [user?.id])

  // If user already has a profile, show redirect message
  if (checkingExistingProfile) {
    return (
      <div className="flex items-center justify-center w-full py-32">
        <LoadCircle />
        <p className="ml-2 text-sm text-muted-foreground">Checking existing profile...</p>
      </div>
    )
  }

  if (existingProfile) {
    return (
      <div className="w-full max-w-md mx-auto text-center py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Profile Already Exists</h2>
        </div>
        
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">You already have a profile:</p>
          <p className="text-lg font-bold">{existingProfile.username}</p>
        </div>
        
        <div className="space-y-3">
          <Button
            className="w-full"
            onClick={() => {
              setIsProfileCreated(true)
              setProfileUsername(existingProfile.username)
              setCreateProfileDialog(false)
              window.location.href = `/${existingProfile.username}`
            }}
          >
            Go to My Profile
          </Button>
          
          <Button
            className="w-full"
            variant="secondary"
            onClick={() => setCreateProfileDialog(false)}
          >
            Close
          </Button>
          
          <Button
            className="w-full text-xs underline"
            variant="ghost"
            onClick={() => {
              logout()
              setCreateProfileDialog(false)
            }}
          >
            Disconnect wallet
          </Button>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (walletAddress && username) {
      try {
        const result = await createProfile({ username, walletAddress })
        if (result) {
          setIsProfileCreated(true)
          setProfileUsername(username)
          setCreateProfileDialog(false)
          // Force refresh to ensure all components get updated state
          setTimeout(() => {
            window.location.reload()
          }, 500)
        }
      } catch (err) {
        console.error('Failed to create profile:', err)
        // Error will be displayed through the error state in the UI
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    const validValue = value.toLowerCase().replace(/[^a-z0-9]/g, '')
    setUsername(validValue)
  }

  const handleClick = async (elem: IProfileList) => {
    if (!walletAddress) {
      return
    }

    try {
      const result = await createProfile({
        username: elem.profile.username,
        walletAddress: walletAddress,
        bio: elem.profile.bio,
        image: elem.profile.image,
      })

      if (result) {
        setIsProfileCreated(true)
        setProfileUsername(elem.profile.username)
        setCreateProfileDialog(false)
        // Add a small delay before reload to ensure state updates are processed
        setTimeout(() => {
          window.location.reload()
        }, 100)
      }
    } catch (err) {
      console.error('Failed to import profile:', err)
      // Error will be displayed through the error state in the UI
    }
  }

  if (loadingMainUsername && profilesLoading) {
    return (
      <div className="flex items-center justify-center w-full py-32">
        <LoadCircle />
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Create Profile</h2>
      </div>
        
        {/* Display wallet address */}
        {walletAddress && (
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Connected Wallet:</p>
            <p className="text-sm font-mono break-all">{walletAddress}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex items-center">
            <Input
              value={username}
              onChange={handleInputChange}
              name="username"
              placeholder="username"
            />
          </div>
          <SubmitButton>
            {creationLoading ? 'Creating...' : 'Create Profile'}
          </SubmitButton>
        </form>

        {error && <Alert type="error" message={error} />}
        {response && (
          <Alert type="success" message="Profile created successfully!" />
        )}
        
        <div className="bg-border h-[1px] w-full my-6" />
        
        <div className="space-y-4">
          <div className="w-full">
            {identities &&
            identities.identities &&
            identities.identities.length > 0 ? (
              <div className="w-full h-[200px] overflow-auto">
                {identities.identities.map((identity, identityIndex) =>
                  identity?.profiles?.length > 0
                    ? identity.profiles.map((entry, profileIndex) => (
                        <Button
                          key={`${identityIndex}-${profileIndex}`}
                          disabled={profilesLoading}
                          variant="ghost"
                          onClick={() => setSelectProfile(entry)}
                          className="flex items-start justify-start w-full"
                        >
                          <div
                            className={cn(
                              'flex items-center border-2 rounded-sm w-full p-2 space-y-2',
                              {
                                'border border-accent': selectProfile === entry,
                                'border border-mutedLight':
                                  selectProfile !== entry,
                              },
                            )}
                          >
                            <div className="flex items-center space-x-2">
                              <div className="relative rounded-full w-11 h-11 bg-muted-foreground shrink-0 flex items-center justify-center">
                                {entry.profile.image ? (
                                  <div>
                                    <Image
                                      width={30}
                                      height={30}
                                      alt="avatar"
                                      className="rounded-full object-cover"
                                      src={entry.profile.image}
                                      unoptimized
                                    />
                                  </div>
                                ) : (
                                  <User />
                                )}
                              </div>
                              <div className="w-2/3 flex flex-col items-start text-left">
                                <h4 className="text-md font-bold truncate w-full">
                                  {entry.profile?.username ?? 'No username'}
                                </h4>
                                {entry.profile?.bio && (
                                  <p className="text-xs text-muted-foreground truncate w-full">
                                    {entry.profile?.bio}
                                  </p>
                                )}
                                {entry?.namespace?.faviconURL && (
                                  <div className="mt-2 w-full">
                                    <Image
                                      width={15}
                                      height={15}
                                      alt="favicon"
                                      className="rounded-full object-cover"
                                      src={entry.namespace.faviconURL}
                                      unoptimized
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </Button>
                      ))
                    : null,
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                {profilesLoading && (
                  <div className="space-y-2">
                    <LoadCircle />
                    <p className="text-sm text-muted-foreground">
                      Getting profiles from Tapestry.. Please wait
                    </p>
                  </div>
                )}

                {!profilesLoading && (
                  <p className="text-sm text-muted-foreground">
                    We could not find any profiles on Tapestry.
                    <br /> Create one to get started!
                  </p>
                )}
              </div>
            )}
          </div>

          <Button
            className="w-full justify-center"
            variant="secondary"
            disabled={profilesLoading || selectProfile === null}
            onClick={() => {
              if (selectProfile) {
                handleClick(selectProfile)
              }
            }}
          >
            {creationLoading ? 'Importing...' : 'Import profile'}
          </Button>
          
          <Button
            className="w-full text-xs underline justify-center"
            variant="ghost"
            onClick={() => {
              logout()
              setCreateProfileDialog(false)
            }}
          >
            Disconnect wallet
          </Button>
        </div>
    </div>
  )
}
