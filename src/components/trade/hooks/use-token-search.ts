'use client'

import { debounce } from 'lodash'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BAD_SOL_MINT,
  DEFAULT_TOKENS,
  SOL_MINT,
  SortOptionsDetails,
} from '../constants'
import {
  ITokenSearchResult,
} from '@/components/trade/models/jupiter/jup-api-models'
import {
  TokenSearchService,
  searchTokensByAddress,
  searchTokensByKeyword,
} from '@/components/trade/services/token-search-service'
import { useGetProfilePortfolio } from './birdeye/use-get-profile-portfolio'

export function useTokenSearch(walletAddress: string | null) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ITokenSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verifiedOnly, setVerifiedOnly] = useState(true)
  const { data: portfolio, loading: getProfilePortfolioLoading } =
    useGetProfilePortfolio({
      walletAddress,
    })

  const sortOptions = [
    { label: 'marketcap', value: SortOptionsDetails.MARKETCAP },
    { label: 'volume', value: SortOptionsDetails.VOLUME },
    { label: 'name', value: SortOptionsDetails.NAME },
    { label: 'balance', value: SortOptionsDetails.BALANCE },
  ]

  const [sortBy, setSortBy] = useState(SortOptionsDetails.MARKETCAP)

  // Convert wallet items to token format
  const walletTokens = useMemo(() => {
    if (portfolio?.length) return []

    return portfolio.map((item) => {
      let address = item.address
      if (address === BAD_SOL_MINT) {
        address = SOL_MINT
      }

      return {
        name: item.name,
        symbol: item.symbol,
        address: address,
        decimals: item.decimals,
        logoURI: item.logoURI || item.icon,
        icon: item.icon,
        chainId: item.chainId,
        price: item.priceUsd,
        priceUsd: item.priceUsd,
        balance: item.balance,
        uiAmount: item.uiAmount,
        valueUsd: item.valueUsd,
        volume_24h_usd: 0,
        verified: true,
        market_cap: 0,
      }
    })
  }, [portfolio]).filter((token) => token.name)

  // Process wallet tokens when they're available
  useEffect(() => {
    if (!searchQuery.trim()) {
      const newResults =
        walletAddress && walletTokens.length > 0 ? walletTokens : DEFAULT_TOKENS

      // Only update if the results are different
      if (JSON.stringify(newResults) !== JSON.stringify(searchResults)) {
        setSearchResults(newResults)
      }
      setIsLoading(false)
    }
  }, [walletAddress, walletTokens, searchQuery, searchResults])

  const searchTokens = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        return // Early return as the useEffect will handle empty query state
      }

      setIsLoading(true)
      setError(null)

      try {
        // First try to get token by address if the query looks like a Solana address
        if (query.length === 44 || query.length === 43) {
          const token = await searchTokensByAddress(query)
          if (token) {
            setSearchResults([token])
            return
          }
        }

        // If not found by address or not an address, use keyword search
        const results = await searchTokensByKeyword(query, verifiedOnly)
        setSearchResults(results)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'error.an_error_occurred')
      } finally {
        setIsLoading(false)
      }
    },
    [verifiedOnly],
  )

  const debouncedSearch = useMemo(
    () => debounce(searchTokens, 300),
    [searchTokens],
  )

  useEffect(() => {
    debouncedSearch(searchQuery)
    return () => debouncedSearch.cancel()
  }, [searchQuery, debouncedSearch])

  const getTokenSearchService = () => {
    return new TokenSearchService(portfolio || [])
  }

  return {
    searchQuery,
    searchResults,
    isLoading: isLoading || getProfilePortfolioLoading,
    error,
    verifiedOnly,
    sortOptions,
    sortBy,
    setSearchQuery,
    setVerifiedOnly,
    setSortBy,
  }
}
