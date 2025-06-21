'use client'

import { useCallback, useEffect, useState } from 'react'

interface Props {
  followerId: string; // This is the privyDid
  followingId: string; // This is the privyDid
}

export const useGetFollowerState = ({
  followerId,
  followingId,
}: Props) => {
  const [isFollowing, setIsFollowing] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFollowerState = useCallback(async () => {
    if (!followerId || !followingId) return;

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/followers/state?followerId=${followerId}&followingId=${followingId}`,
        {
          method: 'GET',
        },
      )

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to fetch follower state')
      }

      const result = await response.json();
      setIsFollowing(result.isFollowing);

    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [followerId, followingId])

  useEffect(() => {
    fetchFollowerState()
  }, [fetchFollowerState])

  return { isFollowing, loading, error, refetch: fetchFollowerState }
}
