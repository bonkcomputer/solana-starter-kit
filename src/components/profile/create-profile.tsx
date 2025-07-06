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
import { sanitizeUsername } from '@/utils/username-validation'
import { cn } from '@/utils/utils'
import { usePrivy } from '@privy-io/react-auth'
import { User } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

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
  const { walletAddress } = useCurrentWallet()
  const { logout } = usePrivy()

  const [username, setUsername] = useState('')
  const [selectProfile, setSelectProfile] = useState<IProfileList | null>(null)

  const {
    createProfile,
    loading: creationLoading,
    error,
    response,
  } = useCreateProfile()

  const { data: identities, loading: profilesLoading } = useGetIdentities({
    walletAddress: walletAddress || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (walletAddress && username) {
      try {
        const result = await createProfile({ username, walletAddress })
        if (result) {
          setIsProfileCreated(true)
          setProfileUsername(username)
          setCreateProfileDialog(false)
        }
      } catch (err) {
        console.error('Failed to create profile:', err)
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const sanitized = sanitizeUsername(value)
    setUsername(sanitized)
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
      }
    } catch (err) {
      console.error('Failed to import profile:', err)
    }
  }

  if (profilesLoading) {
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
          {/* Simple import section - only show if we found existing profiles */}
          {identities && identities.identities && identities.identities.length > 0 && (
            <>
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  Found existing profiles. You can import one:
                </p>
              </div>
              
              <div className="w-full max-h-[200px] overflow-auto">
                {identities.identities.map((identity, identityIndex) =>
                  identity?.profiles?.length > 0
                    ? identity.profiles.map((entry, profileIndex) => (
                        <Button
                          key={`${identityIndex}-${profileIndex}`}
                          disabled={profilesLoading}
                          variant="ghost"
                          onClick={() => setSelectProfile(entry)}
                          className="flex items-start justify-start w-full mb-2"
                        >
                          <div
                            className={cn(
                              'flex items-center border rounded-sm w-full p-2',
                              {
                                'border-blue-500': selectProfile === entry,
                                'border-gray-300': selectProfile !== entry,
                              },
                            )}
                          >
                            <div className="flex items-center space-x-2">
                              <div className="relative rounded-full w-8 h-8 bg-gray-200 shrink-0 flex items-center justify-center">
                                {entry.profile.image ? (
                                  <Image
                                    width={24}
                                    height={24}
                                    alt="avatar"
                                    className="rounded-full object-cover"
                                    src={entry.profile.image}
                                    unoptimized
                                  />
                                ) : (
                                  <User size={16} />
                                )}
                              </div>
                              <div className="flex flex-col items-start text-left">
                                <h4 className="text-sm font-semibold">
                                  {entry.profile?.username ?? 'No username'}
                                </h4>
                                {entry.profile?.bio && (
                                  <p className="text-xs text-gray-500 truncate">
                                    {entry.profile?.bio}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </Button>
                      ))
                    : null,
                )}
              </div>

              <Button
                className="w-full"
                variant="secondary"
                disabled={profilesLoading || selectProfile === null}
                onClick={() => {
                  if (selectProfile) {
                    handleClick(selectProfile)
                  }
                }}
              >
                {creationLoading ? 'Importing...' : 'Import Selected Profile'}
              </Button>
              
              <div className="bg-gray-200 h-[1px] w-full my-4" />
            </>
          )}
          
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
