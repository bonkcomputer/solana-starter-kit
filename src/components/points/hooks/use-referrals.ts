'use client'

import { useState, useEffect, useCallback } from 'react'
import { IReferralStats, ICheckReferralResponse } from '@/models/points.models'

/**
 * Hook for managing user referrals
 */
export function useReferrals(userId?: string) {
  const [referralStats, setReferralStats] = useState<IReferralStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReferralStats = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/points/referrals?userId=${userId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch referral stats')
      }

      setReferralStats(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchReferralStats()
  }, [fetchReferralStats])

  return { referralStats, loading, error, refetch: fetchReferralStats }
}

/**
 * Hook for checking referral codes
 */
export function useReferralCheck() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkReferralCode = async (referralCode: string): Promise<ICheckReferralResponse | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/points/referrals?action=check&code=${referralCode}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check referral code')
      }

      return data
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { checkReferralCode, loading, error }
}

/**
 * Hook for processing referral signups
 */
export function useReferralSignup() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processReferral = async (referralCode: string, newUserId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/points/referrals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ referralCode, newUserId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process referral')
      }

      return data.success
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  return { processReferral, loading, error }
} 