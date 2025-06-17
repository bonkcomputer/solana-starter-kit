'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import { useRecentTrades } from './use-recent-trades'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { formatNumber } from '@/utils/format'

export function RecentTrades() {
  const { trades, isLoading, isError } = useRecentTrades()

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-[125px] w-full" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center text-red-500">
        Failed to load recent trades. Please ensure your NEXT_PUBLIC_HELIUS_API_KEY is
        set correctly.
      </div>
    )
  }

  if (!isLoading && trades?.length === 0) {
    return (
      <div className="text-center text-zinc-400 py-8">
        No recent trades found for BCT or SSE.
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {trades?.map((trade) => (
        <Link
          href={`https://solscan.io/tx/${trade.txHash}`}
          key={trade.txHash}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Card className="bg-background border-border hover:border-primary transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    {trade.tokenOutLogo ? (
                      <Image
                        src={trade.tokenOutLogo}
                        width={24}
                        height={24}
                        alt={`${trade.tokenOut} logo`}
                      />
                    ) : (
                      <AvatarFallback>
                        {trade.tokenOut.slice(0, 1)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="font-medium">
                    {trade.tokenIn} → {trade.tokenOut}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="bg-card text-card-foreground border-border"
                >
                  {trade.time}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Amount</span>
                <span>
                  {formatNumber(trade.amountOut)} {trade.tokenOut}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-zinc-400">Value</span>
                <span>${formatNumber(trade.valueUsd)}</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
} 