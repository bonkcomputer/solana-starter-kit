'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useCallback, useEffect, useState } from 'react'

interface OGProgress {
  isOG: boolean
  progress: {
    tradingVolume: { current: number; required: number; percentage: number }
    achievements: { current: number; required: number; percentage: number }
    points: { current: number; required: number; percentage: number }
  }
}

export function useOGProgress() {
  const { user } = usePrivy()
  const [progress, setProgress] = useState<OGProgress | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProgress = useCallback(async () => {
    if (!user?.id) {
      setProgress(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/og/progress?privyDid=${user.id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setProgress(null)
          return
        }
        throw new Error('Failed to fetch OG progress')
      }

      const data = await response.json()
      setProgress(data)

    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching OG progress:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchProgress()
  }, [user?.id, fetchProgress])

  return {
    progress,
    loading,
    error,
    refetch: fetchProgress
  }
} 