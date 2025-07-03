import { PublicKey } from '@solana/web3.js'

/**
 * Validates if a string is a valid Solana address
 * @param address - The address to validate
 * @returns boolean indicating if the address is valid
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address)
    return true
  } catch {
    return false
  }
}

/**
 * Validates a wallet address and determines if it's a Solana address
 * @param address - The address to validate
 * @returns Object with validation results
 */
export function validateWalletAddress(address: string): {
  isValid: boolean
  isSolana: boolean
  error?: string
} {
  if (!address || typeof address !== 'string') {
    return {
      isValid: false,
      isSolana: false,
      error: 'Invalid address format'
    }
  }

  try {
    new PublicKey(address)
    return {
      isValid: true,
      isSolana: true
    }
  } catch (_error) {
    return {
      isValid: false,
      isSolana: false,
      error: 'Not a valid Solana address'
    }
  }
} 