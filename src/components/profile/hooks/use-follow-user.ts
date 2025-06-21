'use client'

import { useState } from 'react'

interface FollowUserProps {
  followerPrivyDid: string;
  followeePrivyDid: string;
  followerUsername: string;
  followeeUsername: string;
}

export const useFollowUser = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)

  const followUser = async ({
    followerPrivyDid,
    followeePrivyDid,
    followerUsername,
    followeeUsername,
  }: FollowUserProps) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/followers/add', {
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
        throw new Error(result.error || 'Failed to follow user')
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return { followUser, loading, error, success }
}
