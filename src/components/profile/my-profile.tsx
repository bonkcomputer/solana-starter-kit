'use client'

import { Card } from '@/components/common/card'
import { CopyPaste } from '@/components/common/copy-paste'
import { Bio } from '@/components/profile/bio'
import { useGetProfileInfo } from '@/components/profile/hooks/use-get-profile-info'
import { User } from 'lucide-react'
import Image from 'next/image'

interface Props {
  username: string
}

export function MyProfile({ username }: Props) {
  const { profile, refetch } = useGetProfileInfo(username)

  return (
    <Card>
      <div className="flex justify-between items-center">
        <div className="flex flex-col justify-center space-y-2 w-full h-full">
          <div className="flex items-end space-x-4">
            {profile?.image ? (
              <div>
                <Image
                  src={profile.image}
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
            <h2 className="w-full font-bold text-xl">{username}</h2>
          </div>

          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray">{profile?.solanaWalletAddress}</p>
            {profile?.solanaWalletAddress && <CopyPaste content={profile.solanaWalletAddress} />}
          </div>
          {/* Follower counts are not yet in the new IUser model, so this is commented out. */}
          {/* <p>
            {profile?.socialCounts.followers} followers |{' '}
            {profile?.socialCounts.following} following
          </p> */}
          <Bio username={username} data={profile} refetch={refetch} />
        </div>
      </div>
    </Card>
  )
}
