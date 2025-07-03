import { usePrivy } from '@privy-io/react-auth';
import { useState } from 'react';
import { toast } from 'sonner';

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
    execution?: 'FAST_UNCONFIRMED' | 'CONFIRMED_AND_PARSED';
  }

  const createProfile = async ({
    username,
    walletAddress,
    bio,
    image,
    execution = 'FAST_UNCONFIRMED',
  }: Props) => {
    console.log('Creating profile with:', { username, walletAddress, bio, image, userId: user?.id, execution });

    if (!user?.id) {
        toast.error("User is not authenticated");
        setError("User is not authenticated");
        return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    const toastId = toast.loading('Creating Profile...', {
        description: 'Please wait while we set things up...',
    });

    if (execution === 'CONFIRMED_AND_PARSED') {
        setTimeout(() => {
            toast.loading('Writing Data On-Chain, Stand By.', {
                id: toastId,
                description: "This can take a few seconds. Please don't close this window.",
            });
        }, 2000); // Switch to the on-chain message after 2 seconds
    }

    try {
      const embeddedWallet = user.linkedAccounts.find(
        (account) => account && account.type === 'wallet' && account.walletClientType === 'privy'
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
        execution,
      };

      console.log('Sending profile creation payload:', payload);

      const res = await fetch('/api/profiles/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log('Create profile API response:', { status: res.status, data });

      if (res.ok) {
        toast.success('Profile created successfully!', {
            id: toastId,
            description: `Welcome, ${username}! Redirecting...`,
        });
        console.log('✅ Profile created successfully:', data);
        setResponse(data);
        return data;
      } else {
        // Handle specific error cases
        let errorMessage = "Profile creation failed. Please try again shortly.";
        if (res.status === 409) {
          if (data.error === "User with this privyDid already exists") {
            errorMessage = "You already have a profile.";
            console.log('🔄 User already exists, redirecting to profile:', data.existingProfile?.username);
            if (data.existingProfile?.username) {
              window.location.href = `/${data.existingProfile.username}`;
              toast.success('Profile already exists!', { id: toastId, description: 'Redirecting you now...' });
              return;
            }
          } else if (data.error === "Username already exists") {
            errorMessage = "This username is already taken. Please choose a different one.";
          }
        }
        
        toast.error(errorMessage, { id: toastId });
        setError(errorMessage);
        return null;
      }
    } catch (err: any) {
      console.error('Profile creation error:', err);
      toast.error('An unexpected error occurred. Please try again shortly.', { id: toastId });
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createProfile, loading, error, response };
};
