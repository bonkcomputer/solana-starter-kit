'use client'

import { Card } from '@/components/common/card'
import { CopyPaste } from '@/components/common/copy-paste'
import { FollowButton } from '@/components/profile/follow-button'
import { useGetProfileInfo } from '@/components/profile/hooks/use-get-profile-info'
import { User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { WalletDropdownMenu } from './WalletDropdownMenu'

interface Props {
  username: string
}

interface EnhancedProfile {
  username: string
  bio?: string
  image?: string
  solanaWalletAddress?: string
  socialCounts?: {
    followers: number
    following: number
  }
  dataSource?: {
    local: boolean
    tapestry: boolean
    socialData: boolean
  }
}

export function Profile({ username }: Props) {
  const { profile } = useGetProfileInfo(username);
  const [enhancedProfile, setEnhancedProfile] = useState<EnhancedProfile | null>(null)
  const [loadingEnhanced, setLoadingEnhanced] = useState(false)

  // Fetch enhanced profile data with social counts
  useEffect(() => {
    const fetchEnhancedProfile = async () => {
      if (!username) return
      
      setLoadingEnhanced(true)
      try {
        const response = await fetch(`/api/profiles/enhanced?username=${username}`)
        if (response.ok) {
          const data = await response.json()
          setEnhancedProfile(data)
        }
      } catch (error) {
        console.warn('Failed to fetch enhanced profile data:', error)
      } finally {
        setLoadingEnhanced(false)
      }
    }

    fetchEnhancedProfile()
  }, [username])

  // Use enhanced profile data if available, otherwise fall back to basic profile
  const displayProfile = enhancedProfile || profile

  return (
    <Card>
      <div className="flex justify-between items-center">
        <div className="flex flex-col justify-center space-y-2 w-full h-full">
          <div className="flex items-end space-x-4">
            {displayProfile?.image ? (
              <div>
                <Image
                  src={displayProfile.image}
                  width={40}
                  height={40}
                  alt="avatar"
                  className="object-cover rounded-full"
                  unoptimized
                />
              </div>
            ) : (
              <div className="h-10 w-10 bg-muted-light rounded-full flex items-center justify-center">
                <User />
              </div>
            )}
            <Link href={`/${username}`} className="w-full font-bold">
              <h2 className="text-xl">{username}</h2>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray">{displayProfile?.solanaWalletAddress}</p>
            {displayProfile?.solanaWalletAddress && <CopyPaste content={displayProfile.solanaWalletAddress} />}
            <WalletDropdownMenu />
          </div>

          {/* Enhanced Social Counts */}
          {enhancedProfile?.socialCounts && (
            <div className="flex items-center space-x-4 text-sm text-gray">
              <span>
                <strong>{enhancedProfile.socialCounts.followers}</strong> followers
              </span>
              <span>
                <strong>{enhancedProfile.socialCounts.following}</strong> following
              </span>
              {enhancedProfile.dataSource?.tapestry && (
                <span className="text-xs text-green-500">• Tapestry</span>
              )}
            </div>
          )}

          <div className="mt-4">
            <p className="text-gray">{displayProfile?.bio}</p>
          </div>

          {/* Data source indicator for debugging */}
          {enhancedProfile?.dataSource && (
            <div className="text-xs text-muted-foreground">
              Data: {enhancedProfile.dataSource.local && 'Local'} 
              {enhancedProfile.dataSource.local && enhancedProfile.dataSource.tapestry && ' + '}
              {enhancedProfile.dataSource.tapestry && 'Tapestry'}
              {loadingEnhanced && ' (Loading...)'}
            </div>
          )}
        </div>
        <FollowButton username={username} />
      </div>
    </Card>
  )
}
