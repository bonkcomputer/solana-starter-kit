import { usePrivy } from '@privy-io/react-auth';
import { useState } from 'react';

export const useCreateProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState(null);
  const { user } = usePrivy();

  interface Props {
    username: string;
    walletAddress: string;
    bio?: string | null;
    image?: string | null;
  }

  const createProfile = async ({
    username,
    walletAddress,
    bio,
    image,
  }: Props) => {
    if (!user?.id) {
        setError("User is not authenticated");
        return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const embeddedWallet = user.linkedAccounts.find(
        (account) => account.type === 'wallet' && account.walletClientType === 'privy'
      );

      const embeddedWalletAddress =
        embeddedWallet && 'address' in embeddedWallet
            ? embeddedWallet.address
            : null;

      const payload = {
        privyDid: user.id,
        username,
        solanaWalletAddress: walletAddress,
        embeddedWalletAddress: embeddedWalletAddress,
        bio,
        image,
      };

      const res = await fetch('/api/profiles/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorResponse = await res.json();
        throw new Error(errorResponse.error || 'Failed to create profile');
      }

      const data = await res.json();
      setResponse(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createProfile, loading, error, response };
};
