import { PublicKey } from '@solana/web3.js';

/**
 * Validates if a given address is a valid Solana wallet address
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    // Additional validation checks before using PublicKey constructor
    if (!address || typeof address !== 'string') {
      console.warn('Solana address validation failed: Invalid input type or empty address');
      return false;
    }
    
    // Trim whitespace
    address = address.trim();
    
    // Basic length and character checks for Solana addresses
    if (address.length < 32 || address.length > 44) {
      console.warn(`Solana address validation failed: Invalid length ${address.length} (expected 32-44)`);
      return false;
    }
    
    // Check if it contains only valid base58 characters
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
    if (!base58Regex.test(address)) {
      console.warn('Solana address validation failed: Contains invalid base58 characters');
      return false;
    }
    
    // Try to create PublicKey - this is the definitive test
    new PublicKey(address);
    return true;
  } catch (error) {
    console.warn('Solana address validation failed:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

/**
 * Validates wallet address and returns validation result with details
 */
export function validateWalletAddress(address: string): {
  isValid: boolean;
  isSolana: boolean;
  error?: string;
} {
  try {
    if (!address) {
      return {
        isValid: true, // Allow empty addresses - users can still use the service
        isSolana: false,
        error: undefined
      };
    }

    // Trim whitespace
    const trimmedAddress = address.trim();
    
    // Check if it's a valid Solana address
    const isSol = isValidSolanaAddress(trimmedAddress);

    if (isSol) {
      return {
        isValid: true,
        isSolana: true
      };
    }

    // For non-Solana addresses (including Ethereum), allow them but mark as non-Solana
    // This relaxes validation to let users proceed with the AI
    return {
      isValid: true, // Allow any wallet format - users can still use the service
      isSolana: false
    };
  } catch (error) {
    console.error('Exception in validateWalletAddress:', error);
    // Even on error, allow users to proceed
    return {
      isValid: true,
      isSolana: false
    };
  }
}
