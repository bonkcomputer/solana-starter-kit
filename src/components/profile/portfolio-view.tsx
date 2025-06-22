'use client'

import type { HeliusAsset } from '@/types/helius'
import { PublicKey } from '@solana/web3.js'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { CopyPaste } from '@/components/common/copy-paste'

interface PortfolioViewProps {
  username: string
  initialTokenType?: 'fungible' | 'nft'
}

interface TokenHolding {
  address: string
  name: string
  symbol: string
  decimals: number
  balance: string
  uiAmount: number
  logoURI: string
  priceUsd: number
  valueUsd: number
}

export function PortfolioView({
  username,
  initialTokenType = 'fungible',
}: PortfolioViewProps) {
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [tokenType, setTokenType] = useState<'fungible' | 'nft'>(initialTokenType)
  const [tokens, setTokens] = useState<TokenHolding[]>([])
  const [nfts, setNfts] = useState<HeliusAsset[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedNft, setSelectedNft] = useState<HeliusAsset | null>(null)
  const [isNftModalOpen, setIsNftModalOpen] = useState(false)

  useEffect(() => {
    async function getWalletAddress() {
      try {
        if (username && username.length >= 32 && username.length <= 44) {
          try {
            const pubkey = new PublicKey(username)
            setWalletAddress(pubkey.toString())
            return
          } catch {
            // Not a valid public key, continue with username flow
          }
        }

        const response = await fetch(`/api/profiles/info?username=${username}`)
        const data = await response.json()

        if (data?.solanaWalletAddress) {
          setWalletAddress(data.solanaWalletAddress)
        }
      } catch (error) {
        console.error('Error getting wallet address:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (username) {
      getWalletAddress()
    } else {
      setIsLoading(false)
    }
  }, [username])

  useEffect(() => {
    setTokenType(initialTokenType)
  }, [initialTokenType])

  const fetchPortfolioData = useCallback(async () => {
    if (!walletAddress) return

    try {
      setLoading(true)
      setError(null)
      
      // Fetch portfolio data from our API endpoint
      const response = await fetch(`/api/portfolio?walletAddress=${walletAddress}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch portfolio data')
      }

      setTokens(data.tokens || [])
      setNfts(data.nfts || [])
      
    } catch (error) {
      console.error('Error fetching portfolio:', error)
      setError(error instanceof Error ? error.message : 'Failed to load portfolio')
    } finally {
      setLoading(false)
    }
  }, [walletAddress])

  useEffect(() => {
    fetchPortfolioData()
  }, [walletAddress, fetchPortfolioData])

  if (isLoading || loading) {
    return (
      <div className="p-6 bg-background rounded-lg border border-border flex justify-center items-center min-h-[300px]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-muted mb-4" />
          <div className="h-4 w-40 bg-muted rounded mb-2" />
          <div className="h-3 w-32 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-background rounded-lg border border-border">
        <div className="text-center py-8">
          <h3 className="text-xl font-medium mb-2 text-destructive">Error loading portfolio</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={fetchPortfolioData} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!walletAddress) {
    return (
      <div className="p-6 bg-background rounded-lg border border-border">
        <div className="text-center py-8">
          <h3 className="text-xl font-medium mb-2">No wallet address found</h3>
          <p className="text-muted-foreground">
            We couldn&apos;t find a wallet address for this profile.
          </p>
        </div>
      </div>
    )
  }

  const totalValue = tokens.reduce((sum, token) => sum + (token.valueUsd || 0), 0)

  const handleViewNftDetails = (nft: HeliusAsset) => {
    setSelectedNft(nft)
    setIsNftModalOpen(true)
  }

  const closeNftModal = () => {
    setIsNftModalOpen(false)
    setSelectedNft(null)
  }

  return (
    <div className="bg-background rounded-lg border border-border p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Portfolio</h2>
        <div className="space-y-1">
          <p className="text-muted-foreground">
            {tokenType === 'fungible' 
              ? `${tokens.length} tokens found`
              : `${nfts.length} NFTs found`
            }
          </p>
          {tokenType === 'fungible' && totalValue > 0 && (
            <p className="text-lg font-medium text-green-600">
              Total Value: ${totalValue.toFixed(2)} USD
            </p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex space-x-3">
          <button
            type="button"
            className={`px-5 py-2.5 rounded-md transition-all duration-200 ${
              tokenType === 'fungible'
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
            onClick={() => setTokenType('fungible')}
          >
            Tokens ({tokens.length})
          </button>
          <button
            type="button"
            className={`px-5 py-2.5 rounded-md transition-all duration-200 ${
              tokenType === 'nft'
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
            onClick={() => setTokenType('nft')}
          >
            NFTs ({nfts.length})
          </button>
        </div>
      </div>

      {tokenType === 'fungible' ? (
        <div className="space-y-4">
          {tokens.length > 0 ? (
            tokens.map((token) => (
              <TokenCard key={token.address} token={token} />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No tokens found in this wallet.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {nfts.length > 0 ? (
            nfts.map((nft) => (
              <NFTCard
                key={nft.id}
                nft={nft}
                onViewDetails={() => handleViewNftDetails(nft)}
              />
            ))
          ) : (
            <div className="text-center py-8 col-span-full">
              <p className="text-muted-foreground">No NFTs found in this wallet.</p>
            </div>
          )}
        </div>
      )}

      {isNftModalOpen && selectedNft && (
        <NftDetailModal nft={selectedNft} onClose={closeNftModal} />
      )}
    </div>
  )
}

function TokenCard({ token }: { token: TokenHolding }) {
  const formatBalance = (balance: string, symbol: string) => {
    const num = parseFloat(balance)
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(2)}M ${symbol}`
    }
    if (num >= 1_000) {
      return `${(num / 1_000).toFixed(2)}K ${symbol}`
    }
    return `${num.toFixed(6)} ${symbol}`
  }

  // Check if this is a priority token (SOL, BCT, or SSE)
  const isPriorityToken = token.symbol === 'SOL' || token.symbol === 'BCT' || token.symbol === 'SSE'
  const isZeroBalance = parseFloat(token.balance) === 0

  return (
    <div className={`p-4 rounded-lg flex items-center space-x-4 ${
      isPriorityToken 
        ? 'bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 dark:from-blue-900/20 dark:to-green-900/20 dark:border-blue-700' 
        : 'bg-muted'
    }`}>
      <div className="w-12 h-12 rounded-full bg-muted-foreground flex-shrink-0 relative overflow-hidden">
        {token.logoURI ? (
          <Image
            src={token.logoURI}
            alt={`${token.symbol} logo`}
            fill
            className="object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs font-bold">
            {token.symbol.slice(0, 2)}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`font-semibold truncate flex items-center ${isPriorityToken ? 'text-blue-700 dark:text-blue-300' : ''}`}>
          {token.symbol}
          {isPriorityToken && (
            <svg 
              className="ml-2 w-4 h-4 text-yellow-500" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              aria-label="Verified token"
            >
              <path 
                fillRule="evenodd" 
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                clipRule="evenodd" 
              />
            </svg>
          )}
        </h4>
        <p className="text-sm text-muted-foreground truncate">{token.name}</p>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${isZeroBalance && isPriorityToken ? 'text-orange-600 dark:text-orange-400' : ''}`}>
          {formatBalance(token.balance, token.symbol)}
          {isZeroBalance && isPriorityToken && (
            <span className="ml-1 text-xs text-orange-500">
              (Empty)
            </span>
          )}
        </p>
        {token.valueUsd > 0 && (
          <p className="text-sm font-medium text-green-600">
            ${token.valueUsd.toFixed(2)}
          </p>
        )}
        {token.priceUsd > 0 && (
          <p className="text-xs text-muted-foreground">
            ${token.priceUsd.toFixed(4)} each
          </p>
        )}
        <div className="flex items-center gap-1">
          <p className="text-xs text-muted-foreground">
            Contract: {token.address.slice(0, 4)}...{token.address.slice(-4)}
          </p>
          <CopyPaste content={token.address} />
        </div>
      </div>
    </div>
  )
}

function getNftImageUrl(nft: HeliusAsset): string {
  return (
    nft.content?.links?.image ||
    nft.content?.files?.[0]?.uri ||
    '/placeholder.svg'
  )
}

interface NFTCardProps {
  nft: HeliusAsset
  onViewDetails: () => void
}

function NFTCard({ nft, onViewDetails }: NFTCardProps) {
  const imageUrl = getNftImageUrl(nft)

  return (
    <div 
      className="bg-muted rounded-lg overflow-hidden cursor-pointer hover:bg-muted/80 transition-colors"
      onClick={onViewDetails}
    >
      <div className="aspect-square bg-muted-foreground relative">
        <Image
          src={imageUrl}
          alt={nft.content?.metadata?.name ?? 'NFT'}
          fill
          className="object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg'
          }}
        />
      </div>
      <div className="p-3">
        <h4 className="font-semibold text-sm truncate">
          {nft.content?.metadata?.name ?? 'Unnamed NFT'}
        </h4>
        <p className="text-xs text-muted-foreground truncate">
          {nft.content?.metadata?.description ?? 'No description'}
        </p>
      </div>
    </div>
  )
}

interface NftDetailModalProps {
  nft: HeliusAsset
  onClose: () => void
}

function NftDetailModal({ nft, onClose }: NftDetailModalProps) {
  if (!nft) return null

  const imageUrl = getNftImageUrl(nft)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground h-8 w-8 flex items-center justify-center text-xl"
          aria-label="Close"
        >
          ×
        </button>
        <div className="w-full h-64 bg-muted rounded-lg mb-4 relative">
          <Image
            src={imageUrl}
            alt={nft.content?.metadata?.name ?? 'NFT Image'}
            fill
            className="object-contain rounded-lg"
          />
        </div>
        <h2 className="text-xl font-bold mb-2 break-words">
          {nft.content?.metadata?.name ?? 'Unnamed NFT'}
        </h2>
        <p className="text-muted-foreground mb-4 break-words">
          {nft.content?.metadata?.description ?? 'No description available.'}
        </p>
        
        {/* Attributes */}
        {nft.content?.metadata?.attributes && nft.content.metadata.attributes.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Attributes</h3>
            <div className="grid grid-cols-2 gap-2">
              {nft.content.metadata.attributes.map((attr, index) => (
                <div key={index} className="bg-muted p-2 rounded text-sm">
                  <div className="font-medium">{attr.trait_type}</div>
                  <div className="text-muted-foreground">{attr.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <a
            href={`https://solscan.io/token/${nft.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            View on Solscan
          </a>
          <a
            href={`https://magiceden.io/item-details/${nft.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            View on Magic Eden
          </a>
        </div>
      </div>
    </div>
  )
}
