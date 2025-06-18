'use client'

import SwapClient from '@/app/swap-client'
import { useEffect, useState } from 'react'
import { SOL_MINT, BCT_MINT } from '../constants'
import TokenChartWidget from './token-chart-widget'

interface TokenChartSwapContainerProps {
  defaultTokenAddress?: string
  defaultTokenSymbol?: string
  defaultOutputAddress?: string
  defaultOutputSymbol?: string
}

export default function TokenChartSwapContainer({
  defaultTokenAddress = SOL_MINT, // SOL token address
  defaultTokenSymbol = 'SOL',
  defaultOutputAddress = BCT_MINT, // BCT token address
  defaultOutputSymbol = 'BCT',
}: TokenChartSwapContainerProps) {
  const [inputToken, setInputToken] = useState({
    address: defaultTokenAddress,
    symbol: defaultTokenSymbol,
  })

  const [outputToken, setOutputToken] = useState({
    address: defaultOutputAddress,
    symbol: defaultOutputSymbol,
  })

  // Debug log values on mount and when they change
  useEffect(() => {
    console.log('TokenChartSwapContainer state:', {
      inputToken,
      outputToken,
      defaultTokenAddress,
      defaultTokenSymbol,
      defaultOutputAddress,
      defaultOutputSymbol,
    })
  }, [
    inputToken.address,
    inputToken.symbol,
    outputToken.address,
    outputToken.symbol,
    defaultTokenAddress,
    defaultTokenSymbol,
    defaultOutputAddress,
    defaultOutputSymbol,
  ])

  // Function to handle token change from swap component
  const handleTokenChange = (address: string, symbol: string) => {
    console.log('handleTokenChange called with:', { address, symbol })
    setInputToken({ address, symbol })
  }

  // Function to handle output token change
  const handleOutputTokenChange = (address: string, symbol: string) => {
    console.log('handleOutputTokenChange called with:', { address, symbol })
    setOutputToken({ address, symbol })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="h-full">
        <TokenChartWidget
          tokenAddress={inputToken.address}
          tokenSymbol={inputToken.symbol}
          outputTokenAddress={outputToken.address}
          outputTokenSymbol={outputToken.symbol}
        />
      </div>
      <div className="py-2">
        <SwapClient
          onTokenChange={handleTokenChange}
          onOutputTokenChange={handleOutputTokenChange}
        />
      </div>
    </div>
  )
}
