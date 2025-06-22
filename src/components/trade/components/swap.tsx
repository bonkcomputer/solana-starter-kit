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
import { TopSwap } from './swap-elements/top-swap'

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

export function Swap({ onTokenChange, onOutputTokenChange }: SwapProps) {
  const { replace, push } = useRouter()
  const { walletAddress, mainUsername } = useCurrentWallet()
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
  const { inputs, setInputs } = useSwapStore()

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

  const { balance: inputBalance, rawBalance: inputRawBalance } =
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
      !inputBalance ||
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

    // Notify parent component about token change
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

    // Notify parent component about output token change
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
      /^[0]?\.[0-9]*$/.test(val) ||
      /^[0-9]*\.?[0-9]*$/.test(val)
    ) {
      const cursorPosition = e.target.selectionStart
      setInAmount(val)
      window.setTimeout(() => {
        e.target.focus()
        e.target.setSelectionRange(cursorPosition, cursorPosition)
      }, 0)
    }
  }

  const handleOutAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (
      val === '' ||
      val === '.' ||
      /^[0]?\.[0-9]*$/.test(val) ||
      /^[0-9]*\.?[0-9]*$/.test(val)
    ) {
      const cursorPosition = e.target.selectionStart
      setOutAmount(val)
      window.setTimeout(() => {
        e.target.focus()
        e.target.setSelectionRange(cursorPosition, cursorPosition)
      }, 0)
    }
  }

  const handleSwapDirection = () => {
    setInputs({
      inputMint: outputTokenMint,
      outputMint: inputTokenMint,
      inputAmount: parseFloat(outAmount),
    })
  }

  useEffect(() => {
    if (swapMode === ESwapMode.EXACT_IN) {
      if (inAmount == '' || isNaN(parseFloat(expectedOutput))) {
        setOutAmount('')
      } else {
        setOutAmount(expectedOutput)
      }
    } else {
      if (outAmount == '' || isNaN(parseFloat(expectedOutput))) {
        setInAmount('')
      } else {
        setInAmount(expectedOutput)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expectedOutput])

  useEffect(() => {
    if (inputs) {
      setInputTokenMint(inputs.inputMint)
      setOutputTokenMint(inputs.outputMint)
      setInAmount(inputs.inputAmount.toString())
      updateTokensInURL(inputs.inputMint, inputs.outputMint)
    }
  }, [inputs, updateTokensInURL])

  useEffect(() => {
    if (inputTokenMint && outputTokenMint) {
      updateTokensInURL(inputTokenMint, outputTokenMint)
    }
  }, [inputTokenMint, outputTokenMint, updateTokensInURL])

  useEffect(() => {
    console.log('++++++:', walletAddress)
  }, [walletAddress])

  return (
    <div className="space-y-4 flex flex-col flex-grow">
      <TopSwap
        walletAddress={walletAddress}
        inputTokenMint={inputTokenMint}
        outputTokenMint={outputTokenMint}
        displayInAmount={displayInAmount}
        displayInAmountInUsd={displayInAmountInUsd}
        inputTokenImageUri={inputTokenImageUri}
        inputTokenSymbol={inputTokenSymbol}
        displayOutAmount={displayOutAmount}
        displayOutAmountInUsd={displayOutAmountInUsd}
        outputTokenImageUri={outputTokenImageUri}
        outputTokenSymbol={outputTokenSymbol}
        setSwapMode={setSwapMode}
        handleInAmountChange={handleInAmountChange}
        setShowInputTokenSearch={setShowInputTokenSearch}
        handleInputAmountByPercentage={handleInputAmountByPercentage}
        handleOutAmountChange={handleOutAmountChange}
        setShowOutputTokenSearch={setShowOutputTokenSearch}
        handleSwapDirection={handleSwapDirection}
      />

      <div className="w-full mt-auto">
        {walletAddress !== '' ? (
          <Button
            variant={ButtonVariant.OUTLINE}
            onClick={handleSwap}
            size={ButtonSize.LG}
            disabled={loading}
            className="rounded-full w-full"
          >
            {loading ? <Spinner /> : 'Execute Swap'}
          </Button>
        ) : (
          <Button
            variant={ButtonVariant.OUTLINE}
            size={ButtonSize.LG}
            disabled={!ready}
            onClick={() => {
              // If already authenticated and has profile, go to profile
              if (authenticated && mainUsername) {
                push(`/${mainUsername}`)
              } else {
                // Otherwise, trigger login
                login()
              }
            }}
            className="rounded-full w-full"
          >
            {!ready ? 'Loading...' : authenticated && mainUsername ? `Go to ${mainUsername}` : 'Go to Login to swap'}
          </Button>
        )}
      </div>

      {(showInputTokenSearch || showOutputTokenSearch) && (
        <TokenSearch
          openModal={showInputTokenSearch || showOutputTokenSearch}
          onSelect={
            showInputTokenSearch
              ? handleInputTokenSelect
              : handleOutputTokenSelect
          }
          onClose={() => {
            if (showInputTokenSearch) {
              setShowInputTokenSearch(false)
            } else {
              setShowOutputTokenSearch(false)
            }
            setInAmount('')
          }}
        />
      )}
    </div>
  )
}
