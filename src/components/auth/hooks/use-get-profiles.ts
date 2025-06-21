import { IProfileList } from '@/models/profile.models'
import { useEffect, useState } from 'react'

interface Props {
  walletAddress: string
  shouldIncludeExternalProfiles?: boolean
}

export function useGetProfiles({
  walletAddress,
  shouldIncludeExternalProfiles,
}: Props) {
  const [profiles, setProfiles] = useState<IProfileList[]>()
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // If no wallet address, immediately set loading to false
    if (!walletAddress) {
      setLoading(false)
      setProfiles([])
      setError(null)
      return
    }

    const controller = new AbortController()
    let timeoutId: NodeJS.Timeout

    const fetchProfiles = async () => {
      setLoading(true)
      setError(null)
      
      // Set a timeout to prevent infinite loading
      timeoutId = setTimeout(() => {
        controller.abort()
        setError('Request timed out')
        setLoading(false)
      }, 10000) // 10 second timeout

      try {
        const url = new URL('/api/profiles', window.location.origin)
        url.searchParams.append('walletAddress', walletAddress)

        if (shouldIncludeExternalProfiles) {
          url.searchParams.append('includeExternal', 'true')
        }

        const res = await fetch(url.pathname + url.search, {
          signal: controller.signal
        })
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch profiles')
        }

        setProfiles(data.profiles || [])
        clearTimeout(timeoutId)
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('Fetch aborted')
          return
        }
        console.error('Error fetching profiles:', err)
        setError(err.message || 'An unknown error occurred')
        setProfiles([])
      } finally {
        setLoading(false)
      }
    }

    fetchProfiles()

    // Cleanup function
    return () => {
      controller.abort()
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [walletAddress, shouldIncludeExternalProfiles])

  return { profiles, loading, error }
}
