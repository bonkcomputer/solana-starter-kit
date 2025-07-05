'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  IUserPoints, 
  IAwardPointsResponse, 
  PointActionType,
  IPointsHistory
} from '@/models/points.models'

/**
 * Hook for managing user points
 */
export function useUserPoints(userId?: string) {
  const [points, setPoints] = useState<IUserPoints | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPoints = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/points/user?userId=${userId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch points')
      }

      setPoints(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchPoints()
  }, [fetchPoints])

  return { points, loading, error, refetch: fetchPoints }
}

/**
 * Hook for awarding points to users
 */
export function useAwardPoints() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResponse, setLastResponse] = useState<IAwardPointsResponse | null>(null)

  const awardPoints = async (
    userId: string,
    actionType: PointActionType,
    metadata?: any
  ): Promise<IAwardPointsResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/points/award', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, actionType, metadata }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to award points')
      }

      setLastResponse(data)
      return data
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { awardPoints, loading, error, lastResponse }
}

/**
 * Hook for getting user points history
 */
export function usePointsHistory(userId?: string, page: number = 1, limit: number = 20) {
  const [history, setHistory] = useState<IPointsHistory | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/points/history?userId=${userId}&page=${page}&limit=${limit}`
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch points history')
      }

      setHistory(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId, page, limit])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return { history, loading, error, refetch: fetchHistory }
}

/**
 * Hook for automatic point awarding with toast notifications
 */
export function useAutoAwardPoints() {
  const { awardPoints } = useAwardPoints()

  const awardPointsWithToast = async (
    userId: string,
    actionType: PointActionType,
    metadata?: any,
    showToast: boolean = true
  ) => {
    const result = await awardPoints(userId, actionType, metadata)

    if (result && showToast) {
      // Dynamic import to avoid SSR issues
      const { toast } = await import('sonner')

      if (result.success && result.pointsAwarded > 0) {
        let message = `+${result.pointsAwarded} points!`
        
        if (result.achievementsUnlocked && result.achievementsUnlocked.length > 0) {
          message += ` 🏆 Achievement unlocked: ${result.achievementsUnlocked[0].name}`
        }
        
        if (result.streakInfo && result.streakInfo.streakBonus) {
          message += ` 🔥 ${result.streakInfo.currentStreak} day streak!`
        }

        toast.success(message, {
          duration: 3000,
          style: {
            background: '#10B981',
            color: 'white',
            border: 'none'
          }
        })
      }
    }

    return result
  }

  return { awardPointsWithToast }
} 