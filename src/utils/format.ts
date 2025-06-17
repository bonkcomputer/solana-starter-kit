export function formatLargeNumber(
  num: number,
  tokenDecimals: number | undefined
) {
  if (num !== 0 && Math.abs(num) < 0.0001) {
    return num.toExponential(4)
  }
  const decimals = tokenDecimals ?? 6
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  })
}

export function formatUsdValue(value: number | null) {
  if (value === null || isNaN(value)) return '$0.00'

  // For very small values, show more precision
  if (value !== 0 && Math.abs(value) < 0.01) {
    return `$${value.toFixed(6)}`
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatRawAmount(rawAmount: bigint, decimals: bigint) {
  try {
    if (rawAmount === 0n) return '0'

    const divisor = 10n ** decimals
    const integerPart = rawAmount / divisor
    const fractionPart = rawAmount % divisor

    if (fractionPart === 0n) {
      return integerPart.toString()
    }

    // Convert to string and pad with zeros
    let fractionStr = fractionPart.toString()
    while (fractionStr.length < Number(decimals)) {
      fractionStr = '0' + fractionStr
    }

    // Remove trailing zeros
    fractionStr = fractionStr.replace(/0+$/, '')

    return fractionStr
      ? `${integerPart}.${fractionStr}`
      : integerPart.toString()
  } catch (err) {
    console.error('Error formatting amount:', err)
    return '0'
  }
}

export const formatNumber = (num: number) => {
  if (Math.abs(num) < 1) {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    })
  }
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}