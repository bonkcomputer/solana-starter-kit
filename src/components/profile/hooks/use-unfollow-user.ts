'use client'

import { useState } from 'react'

interface UnfollowUserProps {
  followerPrivyDid: string;
  followeePrivyDid: string;
  followerUsername: string;
  followeeUsername: string;
}

export const useUnfollowUser = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)

  const unfollowUser = async ({
    followerPrivyDid,
    followeePrivyDid,
    followerUsername,
    followeeUsername,
  }: UnfollowUserProps) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/followers/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            followerPrivyDid,
            followeePrivyDid,
            followerUsername,
            followeeUsername,
        }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to unfollow user')
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return { unfollowUser, loading, error, success }
}
