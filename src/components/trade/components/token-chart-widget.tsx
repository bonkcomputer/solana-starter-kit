import { useTokenInfo } from '@/components/token/hooks/use-token-info'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CopyPaste } from '@/components/common/copy-paste'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { USDC_MINT, BCT_MINT } from '../constants'

interface TokenChartWidgetProps {
  tokenAddress: string
  tokenSymbol?: string
  outputTokenAddress?: string
  outputTokenSymbol?: string
  defaultTab?: string
}

export default function TokenChartWidget({
  tokenAddress,
  tokenSymbol = 'SOL',
  outputTokenAddress,
  outputTokenSymbol = 'SSE',
  defaultTab = 'price',
}: TokenChartWidgetProps) {
  // Get info for the output token as that's what we want to display
  const { name, price, marketCap, imageUrl } = useTokenInfo(
    outputTokenAddress || '',
  )
  const [priceChange, setPriceChange] = useState<number>(0)

  // Simulating price change for demo purposes
  useEffect(() => {
    setPriceChange(Math.random() * 5 - 1) // Random change between -1% and 4%
  }, [])

  // Debug log values on mount and when they change
  useEffect(() => {
    console.log('TokenChartWidget values:', {
      tokenAddress,
      tokenSymbol,
      outputTokenAddress,
      outputTokenSymbol,
    })

    if (outputTokenAddress) {
      console.log(
        'Chart URL:',
        `https://birdeye.so/tv-widget/${outputTokenAddress}?chain=solana&vs=${USDC_MINT}&viewMode=pair&chartInterval=1D&chartType=CANDLE&chartTimezone=UTC&chartLeftToolbar=show&theme=dark`,
      )
    }
  }, [tokenAddress, tokenSymbol, outputTokenAddress, outputTokenSymbol])

  return (
    <Card className="bg-background border-border h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 border-2 border-zinc-950">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  width={32}
                  height={32}
                  alt={name || outputTokenSymbol}
                />
              ) : (
                <Image
                  src="/placeholder.svg?height=32&width=32"
                  width={32}
                  height={32}
                  alt={name || outputTokenSymbol}
                />
              )}
            </Avatar>
            <span>{outputTokenSymbol}/USD</span>
            <Badge
              variant="outline"
              className={`ml-2 ${
                priceChange >= 0
                  ? 'bg-green-950/20 text-green-500 border-green-800 hover:bg-green-950/30'
                  : 'bg-red-950/20 text-red-500 border-red-800 hover:bg-red-950/30'
              }`}
            >
              {priceChange >= 0 ? '+' : ''}
              {priceChange.toFixed(2)}%
            </Badge>
          </div>
          <div className="text-xl">${price}</div>
        </CardTitle>
        <CardDescription className="flex items-center justify-between">
          <span className="text-zinc-400">{name}</span>
          <span className="text-zinc-400">Market Cap: ${marketCap}</span>
        </CardDescription>
        {outputTokenAddress === BCT_MINT && (
          <div className="flex items-center justify-center gap-2 mt-2 p-2 bg-muted/50 rounded-md">
            <span className="text-xs text-muted-foreground">Contract Address:</span>
            <span className="text-xs font-mono text-foreground">
              {BCT_MINT.slice(0, 6)}...{BCT_MINT.slice(-6)}
            </span>
            <CopyPaste content={BCT_MINT} />
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        <Tabs defaultValue={defaultTab} className="w-full h-full">
          <TabsList className="grid w-full grid-cols-3 bg-card">
            <TabsTrigger value="price">Price</TabsTrigger>
            <TabsTrigger value="volume">Volume</TabsTrigger>
            <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
          </TabsList>
          <TabsContent value="price" className="pt-4 h-[360px]">
            <div className="h-full w-full">
              <iframe
                title="Birdeye Price Chart"
                width="100%"
                height="100%"
                src={`https://birdeye.so/tv-widget/${outputTokenAddress || ''}?chain=solana&vs=${USDC_MINT}&viewMode=pair&chartInterval=1D&chartType=CANDLE&chartTimezone=UTC&chartLeftToolbar=show&theme=dark`}
                frameBorder="0"
                allowFullScreen
              />
            </div>
          </TabsContent>
          <TabsContent value="volume" className="pt-4 h-[360px]">
            <div className="h-full w-full">
              <iframe
                title="Birdeye Volume Chart"
                width="100%"
                height="100%"
                src={`https://birdeye.so/tv-widget/${outputTokenAddress || ''}?chain=solana&vs=${USDC_MINT}&viewMode=pair&chartInterval=1D&chartType=BAR&chartTimezone=UTC&chartLeftToolbar=show&theme=dark`}
                frameBorder="0"
                allowFullScreen
              />
            </div>
          </TabsContent>
          <TabsContent value="liquidity" className="pt-4 h-[360px]">
            <div className="h-full w-full">
              <iframe
                title="Birdeye Liquidity Chart"
                width="100%"
                height="100%"
                src={`https://birdeye.so/tv-widget/${outputTokenAddress || ''}?chain=solana&vs=${USDC_MINT}&viewMode=pair&chartInterval=1D&chartType=AREA&chartTimezone=UTC&chartLeftToolbar=show&theme=dark`}
                frameBorder="0"
                style={{ border: 'none' }}
                allowFullScreen
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
