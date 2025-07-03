'use client'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { useTokenBalance } from '@/components/token/hooks/use-token-balance'
import { useTokenInfo } from '@/components/token/hooks/use-token-info'
import { useTokenUSDCPrice } from '@/components/token/hooks/use-token-usdc-price'
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@/components/ui/custom-button'
import { Spinner } from '@/components/ui/spinner'
import {
  formatLargeNumber,
  formatRawAmount,
  formatUsdValue,
} from '@/utils/format'
import { useSolanaWallets, useLogin, usePrivy } from '@privy-io/react-auth'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { SOL_MINT, BCT_MINT } from '../constants'
import { useJupiterSwap } from '../hooks/jupiter/use-jupiter-swap'
import { ESwapMode } from '../models/jupiter/jup-api-models'
import { useSwapStore } from '../stores/use-swap-store'
import { TokenSearch } from './swap-dialog/token-search'
import { Pay } from './swap-elements/pay'
import { Receive } from './swap-elements/received'

const validateAmount = (value: string, decimals: number = 6): boolean => {
  if (value === '') return true

  // Check if the value is a valid number
  const numericValue = Number(value)
  if (isNaN(numericValue)) {
    return false
  }

  // Check if the value is positive
  if (numericValue <= 0) {
    return false
  }

  // Check if the value has too many decimal places
  const decimalParts = value.split('.')
  if (
    decimalParts.length > 1 &&
    decimalParts[1]?.length &&
    decimalParts[1]?.length > decimals
  ) {
    return false
  }

  return true
}

interface SwapProps {
  onTokenChange?: (address: string, symbol: string) => void
  onOutputTokenChange?: (address: string, symbol: string) => void
}

function SwapContainer({ walletAddress, onTokenChange, onOutputTokenChange }: SwapProps & { walletAddress: string }) {
  const { replace } = useRouter()
  const { ready, wallets } = useSolanaWallets()
  const { authenticated } = usePrivy()
  const { login } = useLogin()
  const wallet = wallets[0]
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [inputTokenMint, setInputTokenMint] = useState<string>(SOL_MINT)
  const [outputTokenMint, setOutputTokenMint] = useState<string>(BCT_MINT)
  const [inAmount, setInAmount] = useState('')
  const [outAmount, setOutAmount] = useState('')
  const [swapMode, setSwapMode] = useState(ESwapMode.EXACT_IN)
  const [showInputTokenSearch, setShowInputTokenSearch] = useState(false)
  const [showOutputTokenSearch, setShowOutputTokenSearch] = useState(false)
  const { setInputs } = useSwapStore()

  const {
    name: inputTokenSymbol,
    decimals: inputTokenDecimals,
    imageUrl: inputTokenImageUri,
  } = useTokenInfo(inputTokenMint)
  const {
    name: outputTokenSymbol,
    decimals: outputTokenDecimals,
    imageUrl: outputTokenImageUri,
  } = useTokenInfo(outputTokenMint)
  const { price: inputTokenUsdPrice } = useTokenUSDCPrice({
    tokenMint: inputTokenMint,
    decimals: inputTokenDecimals,
  })
  const { price: outputTokenUsdPrice } = useTokenUSDCPrice({
    tokenMint: outputTokenMint,
    decimals: outputTokenDecimals,
  })
  const { rawBalance: inputRawBalance } =
    useTokenBalance(inputTokenMint, walletAddress)
  const { loading, expectedOutput, isQuoteRefreshing, handleSwap } =
    useJupiterSwap({
      inputMint: inputTokenMint,
      outputMint: outputTokenMint,
      inputAmount: swapMode === ESwapMode.EXACT_IN ? inAmount : outAmount,
      inputDecimals:
        swapMode === ESwapMode.EXACT_IN
          ? inputTokenDecimals
          : outputTokenDecimals,
      outputDecimals:
        swapMode === ESwapMode.EXACT_OUT
          ? inputTokenDecimals
          : outputTokenDecimals,
      wallet: !ready || !wallet ? null : wallet,
      walletAddress: walletAddress,
      swapMode: swapMode,
    })
  const displayInAmount = useMemo(() => {
    if (isQuoteRefreshing && swapMode === ESwapMode.EXACT_OUT) {
      return '...'
    }
    if (inAmount == '') {
      return ''
    } else {
      if (swapMode === ESwapMode.EXACT_IN) {
        return inAmount
      } else {
        return formatLargeNumber(parseFloat(inAmount), inputTokenDecimals)
      }
    }
  }, [inAmount, inputTokenDecimals, isQuoteRefreshing, swapMode])
  const displayOutAmount = useMemo(() => {
    if (isQuoteRefreshing && swapMode === ESwapMode.EXACT_IN) {
      return '...'
    }
    if (outAmount == '') {
      return ''
    } else {
      if (swapMode === ESwapMode.EXACT_OUT) {
        return outAmount
      } else {
        return formatLargeNumber(parseFloat(outAmount), outputTokenDecimals)
      }
    }
  }, [isQuoteRefreshing, swapMode, outAmount, outputTokenDecimals])
  const displayInAmountInUsd = useMemo(() => {
    if (
      isQuoteRefreshing ||
      !inputTokenUsdPrice ||
      isNaN(parseFloat(inAmount))
    ) {
      return '...'
    }
    return formatUsdValue(inputTokenUsdPrice * parseFloat(inAmount))
  }, [isQuoteRefreshing, inputTokenUsdPrice, inAmount])
  const displayOutAmountInUsd = useMemo(() => {
    if (
      isQuoteRefreshing ||
      !outputTokenUsdPrice ||
      isNaN(parseFloat(outAmount))
    ) {
      return '...'
    }
    return formatUsdValue(outputTokenUsdPrice * parseFloat(outAmount))
  }, [isQuoteRefreshing, outputTokenUsdPrice, outAmount])

  const handleInputAmountByPercentage = (percent: number) => {
    if (
      typeof inputRawBalance !== 'bigint' ||
      !inputTokenDecimals
    )
      return
    try {
      const quarterAmount = inputRawBalance / BigInt(100 / percent)
      const formattedQuarter = formatRawAmount(
        quarterAmount,
        BigInt(inputTokenDecimals),
      )
      if (validateAmount(formattedQuarter, inputTokenDecimals)) {
        setInAmount(formattedQuarter)
      }
    } catch (err) {
      console.error('Error calculating amount:', err)
    }
  }

  const handleInputTokenSelect = (token: {
    address: string
    symbol: string
    name: string
    decimals: number
  }) => {
    setInputTokenMint(token.address)
    setInputs({
      inputMint: token.address,
      outputMint: outputTokenMint,
      inputAmount: parseFloat(inAmount),
    })
    if (onTokenChange) {
      onTokenChange(token.address, token.symbol)
    }
  }

  const handleOutputTokenSelect = (token: {
    address: string
    symbol: string
    name: string
    decimals: number
  }) => {
    setOutputTokenMint(token.address)
    setInputs({
      inputMint: inputTokenMint,
      outputMint: token.address,
      inputAmount: parseFloat(inAmount),
    })
    if (onOutputTokenChange) {
      onOutputTokenChange(token.address, token.symbol)
    }
  }

  const updateTokensInURL = useCallback(
    (input: string, output: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('inputMint', input)
      params.set('outputMint', output)
      replace(`${pathname}?${params.toString()}`)
    },
    [searchParams, pathname, replace],
  )

  const handleInAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (
      val === '' ||
      val === '.' ||
      (validateAmount(val, inputTokenDecimals) && !val.endsWith('.'))
    ) {
      setInAmount(val)
      setSwapMode(ESwapMode.EXACT_IN)
    }
  }

  const handleOutAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (
      val === '' ||
      val === '.' ||
      (validateAmount(val, outputTokenDecimals) && !val.endsWith('.'))
    ) {
      setOutAmount(val)
      setSwapMode(ESwapMode.EXACT_OUT)
    }
  }

  const handleSwapDirection = () => {
    setInputTokenMint(outputTokenMint)
    setOutputTokenMint(inputTokenMint)
    setInAmount(outAmount)
    setOutAmount(inAmount)

    updateTokensInURL(outputTokenMint, inputTokenMint)
  }

  useEffect(() => {
    if (
      expectedOutput !== null &&
      !isNaN(Number(expectedOutput)) &&
      isQuoteRefreshing === false
    ) {
      if (swapMode === ESwapMode.EXACT_IN) {
        setOutAmount(expectedOutput.toString())
      } else {
        setInAmount(expectedOutput.toString())
      }
    }
  }, [expectedOutput, isQuoteRefreshing, swapMode])

  useEffect(() => {
    const inputMint = searchParams.get('inputMint')
    const outputMint = searchParams.get('outputMint')
    if (inputMint) setInputTokenMint(inputMint)
    if (outputMint) setOutputTokenMint(outputMint)
  }, [searchParams])

  useEffect(() => {
    setInputs({
      inputMint: inputTokenMint,
      outputMint: outputTokenMint,
      inputAmount: parseFloat(inAmount),
    })
  }, [inAmount, inputTokenMint, outputTokenMint, setInputs])

  useEffect(() => {
    if (!wallet) setOutAmount('')
  }, [wallet])
  
  useEffect(() => {
    if (onTokenChange) {
      onTokenChange(inputTokenMint, inputTokenSymbol ?? '')
    }
  }, [inputTokenMint, inputTokenSymbol, onTokenChange])

  return (
    <div className="flex w-full flex-col items-center">
      <div className="w-full">
        <Pay
            walletAddress={walletAddress}
            inputTokenMint={inputTokenMint}
            displayInAmount={displayInAmount}
            displayInAmountInUsd={displayInAmountInUsd}
            inputTokenImageUri={inputTokenImageUri}
            inputTokenSymbol={inputTokenSymbol}
            setSwapMode={setSwapMode}
            handleInAmountChange={handleInAmountChange}
            setShowInputTokenSearch={setShowInputTokenSearch}
            handleInputAmountByPercentage={handleInputAmountByPercentage}
        />
      </div>

      <div className="my-2 flex w-full justify-center">
        <button
          onClick={handleSwapDirection}
          className="rounded-full border p-2 transition-all hover:rotate-180"
          title="Swap input and output tokens"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-arrow-down-up"
          >
            <path d="m3 16 4 4 4-4" />
            <path d="M7 20V4" />
            <path d="m21 8-4-4-4 4" />
            <path d="M17 4v16" />
          </svg>
        </button>
      </div>

      <div className="w-full">
        <Receive
          displayOutAmount={displayOutAmount}
          displayOutAmountInUsd={displayOutAmountInUsd}
          outputTokenMint={outputTokenMint}
          outputTokenImageUri={outputTokenImageUri}
          outputTokenSymbol={outputTokenSymbol}
          setSwapMode={setSwapMode}
          handleOutAmountChange={handleOutAmountChange}
          setShowOutputTokenSearch={setShowOutputTokenSearch}
        />
      </div>

      <div className="mt-4 w-full">
        <Button
          onClick={authenticated ? () => handleSwap() : login}
          className="w-full"
          size={ButtonSize.LG}
          variant={ButtonVariant.DEFAULT}
          disabled={
            loading ||
            !inAmount ||
            !outAmount ||
            !wallet ||
            parseFloat(inAmount) <= 0
          }
        >
          {loading && <Spinner />}
          {authenticated
            ? loading
              ? 'Swapping...'
              : 'Swap'
            : 'Login to Swap'}
        </Button>
      </div>

      <TokenSearch
        openModal={showInputTokenSearch}
        onSelect={handleInputTokenSelect}
        onClose={() => setShowInputTokenSearch(false)}
      />

      <TokenSearch
        openModal={showOutputTokenSearch}
        onSelect={handleOutputTokenSelect}
        onClose={() => setShowOutputTokenSearch(false)}
      />
    </div>
  )
}

export function Swap({ onTokenChange, onOutputTokenChange }: SwapProps) {
  const { walletAddress } = useCurrentWallet()

  if (!walletAddress) {
    return (
        <div className="flex items-center justify-center p-8 text-muted-foreground">
            Please connect your wallet to swap tokens.
        </div>
    )
  }

  return <SwapContainer walletAddress={walletAddress} onTokenChange={onTokenChange} onOutputTokenChange={onOutputTokenChange} />
}
