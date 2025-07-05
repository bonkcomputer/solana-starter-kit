'use client'

import { useState, useEffect, useCallback } from 'react'
import { IPointsLeaderboard } from '@/models/points.models'

/**
 * Hook for managing the points leaderboard
 */
export function useLeaderboard(
  limit: number = 50,
  period: 'daily' | 'weekly' | 'monthly' | 'all' = 'all',
  userId?: string
) {
  const [leaderboard, setLeaderboard] = useState<IPointsLeaderboard | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        period
      })

      if (userId) {
        params.append('userId', userId)
      }

      const response = await fetch(`/api/points/leaderboard?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch leaderboard')
      }

      setLeaderboard(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [limit, period, userId])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  return { leaderboard, loading, error, refetch: fetchLeaderboard }
} 