use this script:
```bash
const handleExportWallet = async () => {
    if (!user) return;
    
    try {
      // Check if user connected with external wallet (with validation)
      const potentialConnectedWallet = user.linkedAccounts?.find(
        (account): account is WalletWithMetadata =>
          account.type === 'wallet' &&
          (account as WalletWithMetadata).chainType === 'solana'
      ) as WalletWithMetadata | undefined;
      
      const connectedSolanaWallet = potentialConnectedWallet?.address && isValidSolanaAddress(potentialConnectedWallet.address)
        ? potentialConnectedWallet
        : undefined;
      
      // Check if it's truly an external wallet (not Privy embedded)
      const hasExternalWallet = !!(connectedSolanaWallet && 
        connectedSolanaWallet.walletClientType !== 'privy');
      
      // Debug logging
      console.log('🔍 Export wallet debug info:', {
        hasExternalWallet,
        connectedSolanaWallet: connectedSolanaWallet ? {
          walletClientType: connectedSolanaWallet.walletClientType,
          address: connectedSolanaWallet.address
        } : null,
        embeddedWallet: user.wallet ? {
          address: user.wallet.address,
          walletClientType: user.wallet.walletClientType
        } : null
      });
      
      // Users with external Solana wallets get private key from their wallet
      if (hasExternalWallet) {
        console.log('📄 External wallet user: Please get private key from your wallet');
        toast.info('Please get private key from your connected wallet (Phantom, Solflare, etc.)');
        return;
      }
      
      // Users with embedded wallets: Use Privy's built-in wallet export
      console.log('🔑 Using Privy wallet export for embedded wallet user');
      await exportWallet();
      toast.success('Private key export initiated - check the modal');
      
    } catch (error) {
      console.error('Wallet export error:', error);
      toast.error('Failed to export wallet');
    }
  };

  if (!user || isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-pulse bg-gray-200 h-8 w-24 rounded" />
      </div>
    );
  }

  const email = user.email?.address;
  
  // Get Solana wallet address with proper validation - prioritize connected Solana wallet, then embedded wallet
  const potentialConnectedWallet = user?.linkedAccounts?.find(
    (account): account is WalletWithMetadata =>
      account.type === 'wallet' &&
      (account as WalletWithMetadata).chainType === 'solana'
  ) as WalletWithMetadata | undefined;

  const connectedSolanaWallet = potentialConnectedWallet?.address && isValidSolanaAddress(potentialConnectedWallet.address)
    ? potentialConnectedWallet
    : undefined;
  
  // For embedded wallets, validate if it's a proper Solana wallet
  const embeddedWallet = user.wallet;
  let solanaWalletAddress: string | undefined;
  
  if (connectedSolanaWallet?.address && isValidSolanaAddress(connectedSolanaWallet.address)) {
    // Use connected Solana wallet address
    solanaWalletAddress = connectedSolanaWallet.address;
    console.log('🟣 Using connected Solana wallet:', solanaWalletAddress);
  } else if (embeddedWallet?.address) {
    // Validate embedded wallet is actually a Solana address
    const validation = validateWalletAddress(embeddedWallet.address);
    if (validation.isValid && validation.isSolana) {
      solanaWalletAddress = embeddedWallet.address;
      console.log('🧠 Using embedded Solana wallet:', solanaWalletAddress);
    } else {
      console.warn('⚠️ Embedded wallet validation failed:', validation.error, embeddedWallet.address);
    }
  }
  ```

here's the code we need in the ui for users to connect to the above function:
```bash
  // Show only wallet info section (for right side of header)
  if (showWalletInfoOnly) {
    return (
      <>
        <WalletBalancesDisplay user={user} onOpenStaking={() => setShowStakingModal(true)} />

        <div className="flex flex-col items-end">
          <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
            {/* User Info */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWalletMenu(!showWalletMenu)}
                className="text-xs"
              >
                {solanaWalletAddress ? '🟣' : (email ? '📧' : '⚠️')}
                <span className="hidden sm:inline ml-1">{displayInfo}</span>
                <span className="sm:hidden ml-1">
                  {solanaWalletAddress ? `${solanaWalletAddress.slice(0, 3)}...${solanaWalletAddress.slice(-3)}` : (email ? email.slice(0, 8) + '...' : 'No Wallet')}
                </span>
              </Button>
              
              {showWalletMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg p-2 z-50 min-w-48 max-w-xs">
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500 border-b pb-2">
                      {email && <div className="break-all">Email: {email}</div>}
                      {solanaWalletAddress && <div className="break-all">Solana Wallet: {solanaWalletAddress}</div>}
                      <div>Type: {isEmailUser ? 'Email Account' : 'Solana Wallet Account'}</div>
                      <div>Network: Solana Mainnet</div>
                    </div>
                    
                    {email && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyEmail}
                        className="w-full justify-start text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-900 font-semibold border border-yellow-300 rounded"
                      >
                        📧 Copy Email
                      </Button>
                    )}
                    
                    {solanaWalletAddress && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyWalletAddress}
                        className="w-full justify-start text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-900 font-semibold border border-yellow-300 rounded"
                      >
                        📋 Copy Solana Address
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleExportWallet}
                      className="w-full justify-start text-xs"
                    >
                      🔑 Copy Private Key
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={logout}
                      className="w-full justify-start text-xs text-red-600"
                    >
                      🚪 Logout
                    </Button>
                  </div>
                </div>
              )}
```

