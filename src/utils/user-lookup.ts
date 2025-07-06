import { prisma } from '@/lib/prisma';

export interface UserLookupCriteria {
  privyDid?: string;
  username?: string;
  solanaWalletAddress?: string;
  embeddedWalletAddress?: string;
}

export interface UserLookupResult {
  user: any | null;
  matchedBy: string | null;
}

/**
 * Robust user lookup that tries multiple criteria to find a user
 * This handles cases where privyDid might have changed due to re-authentication
 */
export async function findUserByCriteria(criteria: UserLookupCriteria): Promise<UserLookupResult> {
  const { privyDid, username, solanaWalletAddress, embeddedWalletAddress } = criteria;

  // Try to find user by privyDid first (most reliable)
  if (privyDid) {
    try {
      const user = await prisma.user.findUnique({
        where: { privyDid }
      });
      if (user) {
        return { user, matchedBy: 'privyDid' };
      }
    } catch (error) {
      console.warn('Failed to find user by privyDid:', error);
    }
  }

  // Try to find by username
  if (username) {
    try {
      const user = await prisma.user.findUnique({
        where: { username }
      });
      if (user) {
        return { user, matchedBy: 'username' };
      }
    } catch (error) {
      console.warn('Failed to find user by username:', error);
    }
  }

  // Try to find by Solana wallet address
  if (solanaWalletAddress) {
    try {
      const user = await prisma.user.findFirst({
        where: { solanaWalletAddress }
      });
      if (user) {
        return { user, matchedBy: 'solanaWalletAddress' };
      }
    } catch (error) {
      console.warn('Failed to find user by solanaWalletAddress:', error);
    }
  }

  // Try to find by embedded wallet address
  if (embeddedWalletAddress) {
    try {
      const user = await prisma.user.findFirst({
        where: { embeddedWalletAddress }
      });
      if (user) {
        return { user, matchedBy: 'embeddedWalletAddress' };
      }
    } catch (error) {
      console.warn('Failed to find user by embeddedWalletAddress:', error);
    }
  }

  return { user: null, matchedBy: null };
}

/**
 * Update user's privyDid if it has changed (for migration scenarios)
 */
export async function updateUserPrivyDid(currentPrivyDid: string, newPrivyDid: string): Promise<boolean> {
  try {
    await prisma.user.update({
      where: { privyDid: currentPrivyDid },
      data: { privyDid: newPrivyDid }
    });
    console.log(`✅ Updated privyDid from ${currentPrivyDid} to ${newPrivyDid}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to update privyDid:', error);
    return false;
  }
}

/**
 * Find and optionally sync user by current authentication data
 * This is useful for handling cases where privyDid might have changed
 */
export async function findAndSyncUser(authData: {
  privyDid: string;
  username?: string;
  solanaWalletAddress?: string;
  embeddedWalletAddress?: string;
}): Promise<UserLookupResult> {
  const { privyDid, username, solanaWalletAddress, embeddedWalletAddress } = authData;

  // First try to find by current privyDid
  let result = await findUserByCriteria({ privyDid });
  
  if (result.user) {
    return result;
  }

  // If not found by privyDid, try other criteria
  result = await findUserByCriteria({
    username,
    solanaWalletAddress,
    embeddedWalletAddress
  });

  // If we found the user by other criteria, update their privyDid
  if (result.user && result.user.privyDid !== privyDid) {
    console.log(`🔄 Found user by ${result.matchedBy}, updating privyDid from ${result.user.privyDid} to ${privyDid}`);
    
    try {
      const updatedUser = await prisma.user.update({
        where: { privyDid: result.user.privyDid },
        data: { privyDid }
      });
      
      return { user: updatedUser, matchedBy: `${result.matchedBy}_synced` };
    } catch (error) {
      console.error('❌ Failed to sync privyDid:', error);
      // Return the user anyway, even if sync failed
      return result;
    }
  }

  return result;
} 