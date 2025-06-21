import { usePrivy } from '@privy-io/react-auth';
import { useState } from 'react';

export const useCreateProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<any>(null);
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
    console.log('Creating profile with:', { username, walletAddress, bio, image, userId: user?.id });

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

      console.log('Sending profile creation payload:', payload);

      const res = await fetch('/api/profiles/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log('Profile creation response:', { status: res.status, data });

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create profile');
      }

      setResponse(data);
      return data;
    } catch (err: any) {
      console.error('Profile creation error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createProfile, loading, error, response };
};
