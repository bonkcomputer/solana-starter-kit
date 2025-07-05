'use client'

import { useState, useEffect, useCallback } from 'react'
import { IAchievement, IUserAchievement } from '@/models/points.models'

/**
 * Hook for managing user achievements
 */
export function useUserAchievements(userId?: string) {
  const [achievements, setAchievements] = useState<IUserAchievement[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAchievements = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/points/achievements?userId=${userId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch achievements')
      }

      setAchievements(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchAchievements()
  }, [fetchAchievements])

  return { achievements, loading, error, refetch: fetchAchievements }
}

/**
 * Hook for getting all available achievements
 */
export function useAllAchievements() {
  const [achievements, setAchievements] = useState<IAchievement[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAllAchievements = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/points/achievements?action=all')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch achievements')
      }

      setAchievements(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAllAchievements()
  }, [fetchAllAchievements])

  return { achievements, loading, error, refetch: fetchAllAchievements }
}

/**
 * Hook for initializing default achievements
 */
export function useInitializeAchievements() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initializeAchievements = async (): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/points/achievements?action=init')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize achievements')
      }

      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  return { initializeAchievements, loading, error }
} 