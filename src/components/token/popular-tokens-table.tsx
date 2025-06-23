'use client'

import { useTokenInfo } from '@/components/token/hooks/use-token-info'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo } from 'react'

// Token address to symbol mapping
const TOKEN_SYMBOLS: Record<string, string> = {
  'So11111111111111111111111111111111111111112': 'SOL',
  'D3CVUkqyXZKgVBdRD7XfuRxQXFKJ86474XyFZrqAbonk': 'BCT',
  'H4phNbsqjV5rqk8u6FUACTLB6rNZRTAPGnBb8KXJpump': 'SSE',
  '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh': 'WBTC',
  '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs': 'WETH',
  '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': 'RAY',
  'HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC': 'AI16Z',
  '61V8vBaqAGMpgDQi4JcAwo1dmBGHsyhzodcPqnEVpump': 'AIRIG',
  '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr': 'POPCAT',
  'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm': 'WIF',
  'EqQFU4AoRVKJjQrpshmp89YxHAgNecCpJdMS8PJLpump': 'DOGWIFHAT',
  '2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv': 'PNUT',
  'HNg5PYJmtqcmzXrv6S9zP1CDKk5BgDuyFBxbvNApump': 'CHILLGUY',
}

export function PopularTokensTable() {
  // Use the same token list as in the TokenContainer component
  const tokenList = [
    'D3CVUkqyXZKgVBdRD7XfuRxQXFKJ86474XyFZrqAbonk',
    'H4phNbsqjV5rqk8u6FUACTLB6rNZRTAPGnBb8KXJpump',
    '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh',
    '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
    '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    'HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC',
    '61V8vBaqAGMpgDQi4JcAwo1dmBGHsyhzodcPqnEVpump',
    '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
    'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    'EqQFU4AoRVKJjQrpshmp89YxHAgNecCpJdMS8PJLpump',
    '2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv',
    'HNg5PYJmtqcmzXrv6S9zP1CDKk5BgDuyFBxbvNApump',
  ]

  // Add Solana to the beginning of the list
  const tokensWithSol = [
    'So11111111111111111111111111111111111111112',
    ...tokenList,
  ]

  // Generate deterministic price changes based on index
  const generateRandomChange = (min: number, max: number, seed: number) => {
    // Use a deterministic seed based on the index to ensure consistent values
    const value = Math.sin(seed) * 10000
    const normalized = (value - Math.floor(value)) * (max - min) + min
    return normalized.toFixed(2)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="text-left py-3 px-4 text-zinc-400 font-medium">#</th>
            <th className="text-left py-3 px-4 text-zinc-400 font-medium">
              Token
            </th>
            <th className="text-right py-3 px-4 text-zinc-400 font-medium">
              Price
            </th>
            <th className="text-right py-3 px-4 text-zinc-400 font-medium">
              24h
            </th>
            <th className="text-right py-3 px-4 text-zinc-400 font-medium">
              7d
            </th>
            <th className="text-right py-3 px-4 text-zinc-400 font-medium">
              Market Cap
            </th>
            <th className="text-right py-3 px-4 text-zinc-400 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {tokensWithSol.slice(0, 10).map((tokenId, index) => (
            <TokenRow
              key={tokenId}
              tokenId={tokenId}
              index={index}
              generateRandomChange={generateRandomChange}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Separate component for each row to isolate token data fetching
function TokenRow({
  tokenId,
  index,
  generateRandomChange,
}: {
  tokenId: string
  index: number
  generateRandomChange: (min: number, max: number, seed: number) => string
}) {
  // Fetch token data for this specific row
  const token = useTokenInfo(tokenId)

  // Generate stable price changes based on index
  const change24h = Number.parseFloat(
    generateRandomChange(-5, 10, index * 100 + 1),
  )
  const change7d = Number.parseFloat(
    generateRandomChange(-10, 20, index * 100 + 2),
  )

  // Get symbol from mapping or extract from metadata
  const symbol = useMemo(() => {
    // First check our known token mapping
    if (TOKEN_SYMBOLS[tokenId]) {
      return TOKEN_SYMBOLS[tokenId]
    }
    // If token has symbol from metadata, use it
    if (token.symbol) {
      return token.symbol
    }
    // Fallback to extracting from name
    return token.name?.split(' ')[0]?.toUpperCase() || '...'
  }, [tokenId, token.name, token.symbol])

  return (
    <tr className="border-b border-border hover:bg-card/50">
      <td className="py-4 px-4">{index + 1}</td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            {token.imageUrl ? (
              <Image src={token.imageUrl} width={32} height={32} alt={symbol} />
            ) : (
              <div className="h-8 w-8 bg-muted flex items-center justify-center text-xs">
                {!token.loading ? symbol.substring(0, 2) : '...'}
              </div>
            )}
          </Avatar>
          <div>
            <div className="font-medium">
              {token.loading ? 'Loading...' : token.name}
            </div>
            <div className="text-sm text-zinc-400">{symbol}</div>
          </div>
        </div>
      </td>
      <td className="py-4 px-4 text-right">
        {token.loading ? '...' : `$${token.price}`}
      </td>
      <td
        className={`py-4 px-4 text-right ${
          change24h >= 0 ? 'text-green-500' : 'text-red-500'
        }`}
      >
        {change24h >= 0 ? '+' : ''}
        {change24h}%
      </td>
      <td
        className={`py-4 px-4 text-right ${
          change7d >= 0 ? 'text-green-500' : 'text-red-500'
        }`}
      >
        {change7d >= 0 ? '+' : ''}
        {change7d}%
      </td>
      <td className="py-4 px-4 text-right">
        {token.loading ? '...' : `$${token.marketCap}`}
      </td>
      <td className="py-4 px-4 text-right">
        <Link href={`/token/${tokenId}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </Link>
      </td>
    </tr>
  )
}
