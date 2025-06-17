import useSWR from 'swr'
import { fetcher } from '@/utils/api'

export interface RecentTrade {
  tokenIn: string
  tokenOut: string
  tokenOutLogo: string
  amountOut: number
  valueUsd: number
  time: string
  txHash: string
}

export function useRecentTrades() {
  const { data, error, isLoading } = useSWR<RecentTrade[]>(
    '/api/trades',
    fetcher,
    {
      refreshInterval: 15000, // Refresh every 15 seconds
    },
  )

  return {
    trades: data,
    isLoading,
    isError: error,
  }
} 