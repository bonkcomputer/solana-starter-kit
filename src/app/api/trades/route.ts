import { NextResponse } from 'next/server'
import { timeAgo } from '@/lib/utils'
import { TokenResponse } from '@/models/token.models'

const BCT_MINT = 'D3CVUkqyXZKgVBdRD7XfuRxQXFKJ86474XyFZrqAbonk'
const SSE_MINT = 'H4phNbsqjV5rqk8u6FUACTLB6rNZRTAPGnBb8KXJpump'
const SOL_MINT = 'So11111111111111111111111111111111111111112'

const TARGET_MINTS = [BCT_MINT, SSE_MINT]

const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY

interface HeliusSwapEvent {
  tokenInputs: Array<{
    mint: string
    rawTokenAmount: { tokenAmount: string; decimals: number }
  }>
  tokenOutputs: Array<{
    mint: string
    rawTokenAmount: { tokenAmount: string; decimals: number }
  }>
  nativeInput: { amount: number }
  nativeOutput: { amount: number }
}

interface HeliusTransaction {
  timestamp: number
  signature: string
  events: {
    swap?: HeliusSwapEvent
  }
  tokenTransfers: Array<{
    mint: string
    tokenAmount: number
    fromUserAccount: string
    toUserAccount: string
  }>
  description: string
}

interface TokenMetadata {
  symbol: string
  logo: string
  decimals: number
  price: number
}

const tokenMetadataCache = new Map<string, TokenMetadata>()

async function getTokenMetadata(mint: string): Promise<TokenMetadata> {
  if (tokenMetadataCache.has(mint)) {
    return tokenMetadataCache.get(mint)!
  }

  try {
    const response = await fetch(
      `http://localhost:3000/api/token?id=${mint}`,
    )
    if (response.ok) {
      const data: TokenResponse = await response.json()
      if (data.result) {
        const content = data.result.content
        const name = content?.metadata?.name || 'Unknown Token'
        const symbol = content?.metadata?.symbol || name.split(' ')[0] || '?'
        const imageUrl =
          content?.links?.image || content?.files?.[0]?.uri || ''

        let price = 0
        let decimals = 0
        if ('token_info' in data.result) {
          price = data.result.token_info?.price_info?.price_per_token || 0
          decimals = data.result.token_info?.decimals || 0
        }

        const metadata: TokenMetadata = {
          symbol,
          logo: imageUrl,
          decimals,
          price,
        }
        tokenMetadataCache.set(mint, metadata)
        return metadata
      }
    }
  } catch (error) {
    console.error(`Failed to fetch metadata for ${mint}`, error)
  }

  // Fallback for failed fetch
  const defaultMeta = {
    symbol: mint.slice(0, 4),
    logo: '',
    decimals: 6,
    price: 0,
  }
  tokenMetadataCache.set(mint, defaultMeta)
  return defaultMeta
}

interface FormattedTrade {
  tokenIn: string
  tokenOut: string
  tokenOutLogo: string
  amountOut: number
  valueUsd: number
  time: string
  txHash: string
  block_timestamp: number
}

export async function GET() {
  if (!HELIUS_API_KEY) {
    console.error('NEXT_PUBLIC_HELIUS_API_KEY environment variable is not set.')
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 },
    )
  }

  try {
    const allTrades: FormattedTrade[] = []

    for (const mint of TARGET_MINTS) {
      try {
        const url = `https://api.helius.xyz/v0/addresses/${mint}/transactions?api-key=${HELIUS_API_KEY}&type=SWAP&limit=50`
        const response = await fetch(url)

        if (!response.ok) {
          const errorData = await response.text()
          console.error(
            `Helius API error for mint ${mint}: ${response.status} ${response.statusText}`,
            errorData,
          )
          continue
        }

        const transactions: HeliusTransaction[] = await response.json()

        for (const tx of transactions) {
          if (tx.events.swap) {
            const swapEvent = tx.events.swap

            const buyOutput = swapEvent.tokenOutputs.find((o) => o.mint === mint)
            if (buyOutput) {
              const amountOut =
                parseFloat(buyOutput.rawTokenAmount.tokenAmount) /
                10 ** buyOutput.rawTokenAmount.decimals

              const tokenInput = swapEvent.tokenInputs[0]
              const nativeInputAmount = swapEvent.nativeInput?.amount
              let tokenInMint = SOL_MINT

              if (tokenInput && tokenInput.mint !== mint) {
                tokenInMint = tokenInput.mint
              } else if (
                swapEvent.tokenInputs.length > 1 &&
                swapEvent.tokenInputs[1].mint !== mint
              ) {
                tokenInMint = swapEvent.tokenInputs[1].mint
              } else if (!nativeInputAmount) {
                // If no clear input, skip
                continue
              }

              // A full implementation would require a separate price feed API.
              // const valueUsd = 0 (we now have price)

              const tokenInMeta = await getTokenMetadata(tokenInMint)
              const tokenOutMeta = await getTokenMetadata(mint)
              const valueUsd = amountOut * tokenOutMeta.price

              allTrades.push({
                tokenIn: tokenInMeta.symbol,
                tokenOut: tokenOutMeta.symbol,
                tokenOutLogo: tokenOutMeta.logo,
                amountOut: amountOut,
                valueUsd: valueUsd,
                time: timeAgo(tx.timestamp * 1000),
                txHash: tx.signature,
                block_timestamp: tx.timestamp,
              })
            }
          }
        }
      } catch (error) {
        console.warn(`Could not fetch or process trades for mint ${mint}:`, error)
      }
    }

    allTrades.sort((a, b) => b.block_timestamp - a.block_timestamp)

    return NextResponse.json(allTrades.slice(0, 6))
  } catch (error) {
    console.error('Error fetching recent trades:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent trades' },
      { status: 500 },
    )
  }
} 