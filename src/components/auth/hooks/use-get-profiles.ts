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
    if (!walletAddress) return

    const fetchProfiles = async () => {
      setLoading(true)
      try {
        const url = new URL('/api/profiles', 'http://localhost') // Base is ignored for relative URLs
        url.searchParams.append('walletAddress', walletAddress)

        if (shouldIncludeExternalProfiles) {
          url.searchParams.append('includeExternal', 'true')
        }

        const res = await fetch(url.pathname + url.search)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch profiles')
        }

        setProfiles(data.profiles)
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchProfiles()
  }, [walletAddress, shouldIncludeExternalProfiles])

  return { profiles, loading, error }
}
