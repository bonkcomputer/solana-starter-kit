'use client'

import { useState, useEffect } from 'react'
import { isOGUser, OGUserCheck } from '@/utils/og-user'

interface UseOGStatusProps {
  username?: string;
  privyDid?: string;
}

interface UseOGStatusReturn {
  ogStatus: OGUserCheck | null;
  isLoading: boolean;
  error: string | null;
}

export function useOGStatus({ username, privyDid }: UseOGStatusProps): UseOGStatusReturn {
  const [ogStatus, setOgStatus] = useState<OGUserCheck | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username || !privyDid) {
      setOgStatus(null);
      return;
    }

    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch user data from API
        const response = await fetch(`/api/profiles/${username}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        
        // Check if user is OG (using database fields if available)
        const ogCheck = isOGUser(
          userData.username,
          userData.createdAt,
          userData.privyDid,
          userData.isOG,
          userData.ogReason
        );

        setOgStatus(ogCheck);
      } catch (err) {
        console.error('Error checking OG status:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        
        // Fallback: check based on available data (no database fields)
        const fallbackCheck = isOGUser(username, new Date(), privyDid);
        setOgStatus(fallbackCheck);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [username, privyDid]);

  return {
    ogStatus,
    isLoading,
    error
  };
}
