'use client'

import { TokenResponse } from '@/models/token.models'
import { useEffect, useState } from 'react'

export function useTokenInfo(id: string) {
  const [tokenInfo, setTokenInfo] = useState<TokenResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchTokenInfo() {
      if (!id || id.trim() === '') {
        if (isMounted) {
          setLoading(false)
          setError('No token ID provided')
        }
        return
      }

      try {
        const response = await fetch(`/api/token?id=${id}`)
        const data = await response.json()

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(data.error || `Token not found: ${id}`)
          }
          throw new Error(data.error || `HTTP error! status: ${response.status}`)
        }

        if (isMounted) {
          setTokenInfo(data)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error')
          console.warn('Token info fetch failed:', err)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    if (id) {
      fetchTokenInfo()
    } else {
      setLoading(false)
      setError('No token ID provided')
    }

    return () => {
      isMounted = false
    }
  }, [id])

  let price = 0
  let supply = 0
  let decimals = 0
  let marketCap = 0
  let name = 'Unknown Token'
  let imageUrl = ''
  let formattedPrice = '0.000000'
  let formattedMarketCap = '0.00M'

  if (tokenInfo?.result) {
    const content = tokenInfo.result.content
    name = content?.metadata?.name || 'Unknown Token'
    imageUrl = content?.links?.image || content?.files?.[0]?.uri || ''

    if ('token_info' in tokenInfo.result) {
      price = tokenInfo.result.token_info?.price_info?.price_per_token || 0
      supply = tokenInfo.result.token_info?.supply || 0
      decimals = tokenInfo.result.token_info?.decimals || 0
      marketCap = (supply * price) / 10 ** decimals

      formattedPrice = price.toFixed(6)
      formattedMarketCap = `${(marketCap / 1_000_000).toFixed(2)}M`
    }
  }

  return {
    tokenInfo,
    loading,
    error,
    price: formattedPrice,
    supply,
    decimals,
    marketCap: formattedMarketCap,
    name,
    imageUrl,
  }
}
