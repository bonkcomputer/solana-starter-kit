import { useState, useRef, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { toast } from 'sonner';
import { isValidSolanaAddress } from '@/utils/wallet';
import { Clipboard, Power, LogOut } from 'lucide-react';

export function WalletDropdownMenu() {
  const { user, logout, exportWallet } = usePrivy();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Simple wallet detection using user.wallet (works with Privy solana-only config)
  const email = user?.email?.address;
  const walletAddress = user?.wallet?.address;
  const walletType = user?.wallet?.walletClientType;
  const isEmailUser = !!email && !walletAddress;
  
  // Validate that the wallet address is actually a Solana address
  const solanaWalletAddress = walletAddress && isValidSolanaAddress(walletAddress) ? walletAddress : undefined;

  const displayInfo = solanaWalletAddress
    ? `${solanaWalletAddress.slice(0, 4)}...${solanaWalletAddress.slice(-4)}`
    : (email || 'No Wallet');

  const copyEmail = async () => {
    if (email) {
      try {
        await navigator.clipboard.writeText(email);
        toast.success('Email address copied to clipboard');
      } catch {
        toast.error('Failed to copy email address');
      }
    } else {
      toast.error('No email address found');
    }
  };

  const copyWalletAddress = async () => {
    if (solanaWalletAddress) {
      try {
        await navigator.clipboard.writeText(solanaWalletAddress);
        toast.success('Solana wallet address copied to clipboard');
      } catch {
        toast.error('Failed to copy wallet address');
      }
    } else {
      toast.error('No Solana wallet address found');
    }
  };

  const exportWalletData = async () => {
    try {
      const exportData = {
        walletAddress: solanaWalletAddress || 'N/A',
        email: email || 'N/A',
        walletType: walletType || 'N/A',
        network: 'Solana Mainnet',
        exportedAt: new Date().toISOString(),
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `bonk-computer-wallet-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Wallet data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export wallet data');
    }
  };

  const handleExportWallet = async () => {
    try {
      if (walletType === 'privy') {
        await exportWallet();
        toast.success('Privy wallet export initiated');
      } else {
        // For external Solana wallets, provide export data instead
        await exportWalletData();
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
        {solanaWalletAddress ? '🟣' : (email ? '📧' : '⚠️')}
        <span className="hidden sm:inline ml-1">{displayInfo}</span>
        <span className="sm:hidden ml-1">
          {solanaWalletAddress ? `${solanaWalletAddress.slice(0, 3)}...${solanaWalletAddress.slice(-3)}` : (email ? email.slice(0, 8) + '...' : 'No Wallet')}
        </span>
      </button>
      {isDropdownOpen && (
        <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg p-2 z-50 min-w-48 max-w-xs">
          <div className="space-y-2">
            <div className="text-xs text-gray-500 border-b pb-2">
              {email && <div className="break-all">Email: {email}</div>}
              {solanaWalletAddress && <div className="break-all">Solana Wallet: {solanaWalletAddress}</div>}
              <div>Type: {isEmailUser ? 'Email Account' : 'Solana Wallet Account'}</div>
              <div>Network: Solana Mainnet</div>
            </div>
            {email && (
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