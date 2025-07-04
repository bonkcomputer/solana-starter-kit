import { useState, useRef, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { toast } from 'sonner';
import { isValidSolanaAddress } from '@/utils/wallet';
import { Clipboard, Power, LogOut } from 'lucide-react';
import { abbreviateWalletAddress } from '@/components/common/tools';

export function WalletDropdownMenu() {
  const { user, logout, exportWallet } = usePrivy();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Wallet detection logic - ONLY look for Solana wallets
  const potentialConnectedWallet = user?.linkedAccounts?.find(
    (account): account is any =>
      account.type === 'wallet' &&
      (account as any).chainType === 'solana'
  ) as any | undefined;

  const connectedSolanaWallet = potentialConnectedWallet?.address && isValidSolanaAddress(potentialConnectedWallet.address)
    ? potentialConnectedWallet
    : undefined;

  // Look for Solana embedded wallet in linkedAccounts instead of user.wallet
  const solanaEmbeddedWallet = user?.linkedAccounts?.find(
    (account): account is any =>
      account.type === 'wallet' &&
      (account as any).chainType === 'solana' &&
      (account as any).walletClientType === 'privy' &&
      (account as any).address &&
      isValidSolanaAddress((account as any).address)
  ) as any | undefined;

  let solanaWalletAddress: string | undefined;
  let isEmailUser = false;

  if (connectedSolanaWallet?.address && isValidSolanaAddress(connectedSolanaWallet.address)) {
    solanaWalletAddress = connectedSolanaWallet.address;
  } else if (solanaEmbeddedWallet?.address && isValidSolanaAddress(solanaEmbeddedWallet.address)) {
    solanaWalletAddress = solanaEmbeddedWallet.address;
  }

  if (user?.email?.address && !connectedSolanaWallet) {
    isEmailUser = true;
  }

  const displayInfo = solanaWalletAddress
    ? abbreviateWalletAddress({ address: solanaWalletAddress })
    : user?.email?.address
    ? user.email.address.slice(0, 8) + '...'
    : 'No Wallet';

  const copyEmail = () => {
    if (user?.email?.address) {
      navigator.clipboard.writeText(user.email.address);
      toast.success('Email copied to clipboard');
    }
  };

  const copyWalletAddress = () => {
    if (solanaWalletAddress) {
      navigator.clipboard.writeText(solanaWalletAddress);
      toast.success('Wallet address copied to clipboard');
    }
  };

  const handleExportWallet = async () => {
    if (!user) return;
    try {
      const hasExternalWallet = !!(connectedSolanaWallet && connectedSolanaWallet.walletClientType !== 'privy');
      
      // Debug logging
      console.log('🔍 Export wallet debug info:', {
        hasExternalWallet,
        connectedSolanaWallet,
        detectedSolanaEmbedded: solanaEmbeddedWallet,
        solanaWalletAddress,
        user
      });
      
      if (hasExternalWallet) {
        toast.info('Please get private key from your connected wallet (Phantom, Solflare, etc.)');
        return;
      }
      
      // --- Surgical fix: Find the correct Solana embedded wallet in linkedAccounts ---
      const exportableSolanaWallet = user.linkedAccounts?.find(
        (account: any) =>
          account.type === 'wallet' &&
          account.chainType === 'solana' &&
          account.walletClientType === 'privy'
      );
      if (exportableSolanaWallet) {
        console.log('🔑 Attempting to export Solana embedded wallet:', exportableSolanaWallet);
        await exportWallet({ id: (exportableSolanaWallet as any).id, chainType: 'solana' } as any);
        toast.success('Private key export initiated - check the modal');
        return;
      }
      // --- End surgical fix ---
      
      // Use the solanaWalletAddress we already validated
      if (solanaWalletAddress && !hasExternalWallet) {
        console.log('🔑 Attempting to export wallet with address:', solanaWalletAddress);
        await exportWallet({ address: solanaWalletAddress, chainType: 'solana' } as any);
        toast.success('Private key export initiated - check the modal');
      } else {
        console.error('❌ No valid Solana wallet address found for export');
        toast.error('No valid wallet address found');
      }
    } catch (error) {
      console.error('Wallet export error:', error);
      toast.error('Failed to export wallet');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !(dropdownRef.current as HTMLElement).contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen((v) => !v)}
        className="flex items-center space-x-1 text-xs font-medium border rounded px-2 py-1 bg-background hover:bg-accent"
        type="button"
      >
        {solanaWalletAddress ? '🟣' : (user?.email?.address ? '📧' : '⚠️')}
        <span className="hidden sm:inline ml-1">{displayInfo}</span>
        <span className="sm:hidden ml-1">
          {solanaWalletAddress ? `${solanaWalletAddress.slice(0, 3)}...${solanaWalletAddress.slice(-3)}` : (user?.email?.address ? user.email.address.slice(0, 8) + '...' : 'No Wallet')}
        </span>
      </button>
      {isDropdownOpen && (
        <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg p-2 z-50 min-w-48 max-w-xs">
          <div className="space-y-2">
            <div className="text-xs text-gray-500 border-b pb-2">
              {user?.email?.address && <div className="break-all">Email: {user.email.address}</div>}
              {solanaWalletAddress && <div className="break-all">Solana Wallet: {solanaWalletAddress}</div>}
              <div>Type: {isEmailUser ? 'Email Account' : 'Solana Wallet Account'}</div>
              <div>Network: Solana Mainnet</div>
            </div>
            {user?.email?.address && (
              <button
                onClick={copyEmail}
                className="w-full flex items-center text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-900 font-semibold border border-yellow-300 rounded px-2 py-1"
              >
                <Clipboard className="mr-2 h-4 w-4" />📧 Copy Email
              </button>
            )}
            {solanaWalletAddress && (
              <button
                onClick={copyWalletAddress}
                className="w-full flex items-center text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-900 font-semibold border border-yellow-300 rounded px-2 py-1"
              >
                <Clipboard className="mr-2 h-4 w-4" />📋 Copy Solana Address
              </button>
            )}
            <button
              onClick={handleExportWallet}
              className="w-full flex items-center text-xs border rounded px-2 py-1"
            >
              <Power className="mr-2 h-4 w-4" />🔑 Export Private Key
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center text-xs text-red-600 border rounded px-2 py-1"
            >
              <LogOut className="mr-2 h-4 w-4" />🚪 Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 