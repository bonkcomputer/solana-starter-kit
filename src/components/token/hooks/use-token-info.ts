'use client'

import { TokenResponse } from '@/models/token.models'
import { useEffect, useState } from 'react'

// Simple cache for token data
const tokenCache = new Map<string, { data: TokenResponse; timestamp: number }>()
const CACHE_DURATION = 2 * 60 * 1000 // 2 minutes

export function useTokenInfo(id: string) {
  const [tokenInfo, setTokenInfo] = useState<TokenResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [jupiterMarketData, setJupiterMarketData] = useState<{ price: number; marketCap: number } | null>(null)

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
        // Check cache first
        const cached = tokenCache.get(id)
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          if (isMounted) {
            setTokenInfo(cached.data)
            setError(null)
          }
          return
        }

        const response = await fetch(`/api/token?id=${id}`)
        const data = await response.json()

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(data.error || `Token not found: ${id}`)
          }
          throw new Error(data.error || `HTTP error! status: ${response.status}`)
        }

        // Cache the successful response
        tokenCache.set(id, { data, timestamp: Date.now() })

        if (isMounted) {
          setTokenInfo(data)
          setError(null)
        }

        // Fetch real-time price and market data from Jupiter
        try {
          const priceResponse = await fetch(`https://api.jup.ag/price/v2?ids=${id}`)
          if (priceResponse.ok) {
            const priceData = await priceResponse.json()
            const tokenData = priceData.data?.[id]
            if (tokenData && isMounted) {
              const tokenPrice = parseFloat(tokenData.price || '0')
              
              // For SOL, we know the circulating supply
              if (id === 'So11111111111111111111111111111111111111112') {
                const solCirculatingSupply = 570000000
                setJupiterMarketData({
                  price: tokenPrice,
                  marketCap: tokenPrice * solCirculatingSupply
                })
              } else {
                // For other tokens, try to get market cap from DexScreener API
                try {
                  const dexScreenerResponse = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${id}`)
                  if (dexScreenerResponse.ok) {
                    const dexData = await dexScreenerResponse.json()
                    if (dexData.pairs && dexData.pairs.length > 0 && isMounted) {
                      // Get the pair with highest liquidity
                      const bestPair = dexData.pairs.reduce((prev: any, current: any) => 
                        (current.liquidity?.usd || 0) > (prev.liquidity?.usd || 0) ? current : prev
                      )
                      
                      const marketCap = bestPair.fdv || bestPair.marketCap || 0
                      setJupiterMarketData({
                        price: tokenPrice,
                        marketCap: marketCap
                      })
                    } else {
                      // If no market cap data available, just set price
                      setJupiterMarketData({
                        price: tokenPrice,
                        marketCap: 0
                      })
                    }
                  }
                } catch (dexErr) {
                  console.warn('Failed to fetch market cap from DexScreener:', dexErr)
                  setJupiterMarketData({
                    price: tokenPrice,
                    marketCap: 0
                  })
                }
              }
            }
          }
        } catch (jupiterErr) {
          console.warn('Failed to fetch price from Jupiter:', jupiterErr)
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
  let symbol = ''
  let imageUrl = ''
  let formattedPrice = '0.000000'
  let formattedMarketCap = '0.00M'

  if (tokenInfo?.result) {
    const content = tokenInfo.result.content
    name = content?.metadata?.name || 'Unknown Token'
    symbol = content?.metadata?.symbol || ''
    
    // Override "Wrapped SOL" to just "SOL"
    if (id === 'So11111111111111111111111111111111111111112' || name === 'Wrapped SOL') {
      name = 'SOL'
      symbol = 'SOL'
    }
    
    // For fungible tokens, also check token_info for symbol
    if ('token_info' in tokenInfo.result && tokenInfo.result.token_info?.symbol) {
      symbol = tokenInfo.result.token_info.symbol
    }
    
    imageUrl = content?.links?.image || content?.files?.[0]?.uri || ''

    if ('token_info' in tokenInfo.result) {
      price = tokenInfo.result.token_info?.price_info?.price_per_token || 0
      supply = tokenInfo.result.token_info?.supply || 0
      decimals = tokenInfo.result.token_info?.decimals || 0
      marketCap = (supply * price) / 10 ** decimals
      


      // Format price based on magnitude
      if (price < 0.000001) {
        formattedPrice = price.toExponential(2)
      } else if (price < 0.01) {
        formattedPrice = price.toFixed(6)
      } else if (price < 1) {
        formattedPrice = price.toFixed(4)
      } else {
        formattedPrice = price.toFixed(2)
      }
      

      
      if (marketCap > 0) {
        // Format market cap based on size
        if (marketCap >= 1e9) {
          formattedMarketCap = `${(marketCap / 1e9).toFixed(2)}B`
        } else if (marketCap >= 1e6) {
          formattedMarketCap = `${(marketCap / 1e6).toFixed(2)}M`
        } else if (marketCap >= 1e3) {
          formattedMarketCap = `${(marketCap / 1e3).toFixed(2)}K`
        } else {
          formattedMarketCap = `${marketCap.toFixed(2)}`
        }
      } else {
        formattedMarketCap = 'N/A'
      }
    }

    // Use Jupiter data if available (for better price and market cap accuracy)
    if (jupiterMarketData) {
      price = jupiterMarketData.price
      marketCap = jupiterMarketData.marketCap
      
      // Format price based on magnitude
      if (price < 0.000001) {
        formattedPrice = price.toExponential(2)
      } else if (price < 0.01) {
        formattedPrice = price.toFixed(6)
      } else if (price < 1) {
        formattedPrice = price.toFixed(4)
      } else {
        formattedPrice = price.toFixed(2)
      }
      
      // Format market cap based on size
      if (marketCap === 0) {
        formattedMarketCap = 'N/A'
      } else if (marketCap >= 1e12) {
        formattedMarketCap = `${(marketCap / 1e12).toFixed(2)}T`
      } else if (marketCap >= 1e9) {
        formattedMarketCap = `${(marketCap / 1e9).toFixed(2)}B`
      } else if (marketCap >= 1e6) {
        formattedMarketCap = `${(marketCap / 1e6).toFixed(2)}M`
      } else if (marketCap >= 1e3) {
        formattedMarketCap = `${(marketCap / 1e3).toFixed(2)}K`
      } else {
        formattedMarketCap = `${marketCap.toFixed(2)}`
      }
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
    symbol,
    imageUrl,
  }
}
