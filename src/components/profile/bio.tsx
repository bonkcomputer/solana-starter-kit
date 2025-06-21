'use client'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { Button } from '@/components/common/button'
import { useUpdateProfileInfo } from '@/components/profile/hooks/use-update-profile'
import { IUser } from '@/models/profile.models'
import { Pencil } from 'lucide-react'
import { useState } from 'react'

interface Props {
  username: string
  data?: IUser | null
  refetch: () => void
}

export function Bio({ username, data, refetch }: Props) {
  const { updateProfile, loading } = useUpdateProfileInfo(username)
  const [bio, setBio] = useState(data?.bio || '')
  const [isEditing, setIsEditing] = useState(false)

  const { mainUsername } = useCurrentWallet()

  const handleSaveBio = async () => {
    await updateProfile({ bio })
    refetch()
    setIsEditing(false)
  }

  return (
    <div className="mt-4">
      {mainUsername === username ? (
        isEditing ? (
          <div className="flex flex-col items-center space-y-2">
            <input
              type="text"
              className="border-b border-muted-light p-2 w-full outline-0"
              value={bio}
              placeholder="Enter your bio"
              onChange={(e) => setBio(e.target.value)}
            />
            <div className="w-full flex items-center justify-end space-x-4">
              <Button
                className="!w-20 justify-center"
                onClick={() => setIsEditing(false)}
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
              <Button onClick={() => setIsEditing(true)} variant="ghost">
                <Pencil size={16} />
              </Button>
            </span>
            <p className="text-gray">
              {data?.bio ? data?.bio : 'no bio'}
            </p>
          </div>
        )
      ) : (
        <div>
          <p>Bio</p>
          <p className="text-gray">
            {data?.bio ? data?.bio : 'no bio'}
          </p>
        </div>
      )}
    </div>
  )
}
