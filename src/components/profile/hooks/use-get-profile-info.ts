'use client'

import { IUser } from '@/models/profile.models'; // We will need to create/update this model
import { useCallback, useEffect, useState } from 'react'

// We should define this in a model file, but for now this will do.
// Assuming IUser will have privyDid, username, bio, image, etc.

export const useGetProfileInfo = (username: string) => {
  const [profile, setProfile] = useState<IUser | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!username) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/profiles/info?username=${username}`)
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to fetch profile')
      }
      const data = await response.json()
      setProfile(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [username])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return { profile, loading, error, refetch: fetchProfile }
}
