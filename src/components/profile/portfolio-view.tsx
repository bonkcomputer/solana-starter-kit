'use client'

import { useGetProfilePortfolio } from '@/components/trade/hooks/birdeye/use-get-profile-portfolio'
import type { ITokenPortfolioItem } from '@/components/trade/models/birdeye/birdeye-api-models'
import type { HeliusAsset } from '@/types/helius'
import { fetchAssets } from '@/utils/helius/fetch-assets'
import { PublicKey } from '@solana/web3.js'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface PortfolioViewProps {
  username: string
  initialTokenType?: 'fungible' | 'nft'
}

export function PortfolioView({
  username,
  initialTokenType = 'fungible',
}: PortfolioViewProps) {
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [tokenType, setTokenType] = useState<'fungible' | 'nft'>(
    initialTokenType,
  )
  const [nfts, setNfts] = useState<HeliusAsset[]>([])
  const [nftsLoading, setNftsLoading] = useState(false)
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

        if (data?.profile?.wallet_address) {
          setWalletAddress(data.profile.wallet_address)
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

  useEffect(() => {
    async function fetchNfts() {
      if (!walletAddress || tokenType !== 'nft') return

      try {
        setNftsLoading(true)
        const response = await fetchAssets(walletAddress)
        const nftAssets =
          response.items?.filter(
            (asset: HeliusAsset) =>
              asset.interface === 'ProgrammableNFT' ||
              asset.interface === 'NFT',
          ) ?? []
        setNfts(nftAssets)
      } catch (error) {
        console.error('Error fetching NFTs:', error)
        setNfts([])
      } finally {
        setNftsLoading(false)
      }
    }

    fetchNfts()
  }, [walletAddress, tokenType])

  const {
    data: portfolioItems,
    loading: portfolioLoading,
    error,
  } = useGetProfilePortfolio({
    walletAddress,
  })

  if (
    isLoading ||
    (portfolioLoading && tokenType === 'fungible') ||
    (nftsLoading && tokenType === 'nft')
  ) {
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
      <div className="p-6 bg-background rounded-lg border border-border text-destructive">
        Error loading portfolio: {error}
      </div>
    )
  }

  if (!walletAddress) {
    return (
      <div className="p-6 bg-background rounded-lg border border-border">
        <div className="text-center py-8">
          <h3 className="text-xl font-medium mb-2">No wallet address found</h3>
          <p className="text-gray-400">
            We couldn&apos;t find a wallet address for this profile.
          </p>
        </div>
      </div>
    )
  }

  const totalValue = portfolioItems.reduce(
    (sum, item) => sum + (item.valueUsd || 0),
    0,
  )

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
        <p className="text-gray-400">
          Total Value: $
          {totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </p>
      </div>

      <div className="mb-6">
        <div className="flex space-x-3">
          <button
            type="button"
            className={`px-5 py-2.5 rounded-md transition-all duration-200 ${
              tokenType === 'fungible'
                ? 'button-primary shadow-lg'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
            onClick={() => setTokenType('fungible')}
          >
            Tokens
          </button>
          <button
            type="button"
            className={`px-5 py-2.5 rounded-md transition-all duration-200 ${
              tokenType === 'nft'
                ? 'button-primary shadow-lg'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
            onClick={() => setTokenType('nft')}
          >
            NFTs
          </button>
        </div>
      </div>

      {tokenType === 'fungible' ? (
        <div className="space-y-4">
          {portfolioItems.length > 0 ? (
            portfolioItems.map((token) => (
              <TokenCard key={token.address} token={token} />
            ))
          ) : (
            <p>No tokens found.</p>
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
            <p>No NFTs found.</p>
          )}
        </div>
      )}

      {isNftModalOpen && selectedNft && (
        <NftDetailModal nft={selectedNft} onClose={closeNftModal} />
      )}
    </div>
  )
}

function TokenCard({ token }: { token: ITokenPortfolioItem }) {
  const value = token.valueUsd?.toLocaleString() ?? '0'

  return (
    <div className="bg-muted p-4 rounded-lg flex items-center space-x-4">
      <div className="w-12 h-12 rounded-full bg-muted-light flex-shrink-0 relative">
        {token.logoURI && (
          <Image
            src={token.logoURI}
            alt={`${token.symbol} logo`}
            layout="fill"
            objectFit="cover"
            className="rounded-full"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg'
            }}
          />
        )}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold">{token.symbol}</h4>
        <p className="text-sm text-gray-400">{token.name}</p>
      </div>
      <div className="text-right">
        <p className="font-semibold">${value}</p>
        <p className="text-sm text-gray-400">
          {token.balance.toLocaleString()} {token.symbol}
        </p>
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
      className="bg-muted rounded-lg overflow-hidden cursor-pointer group"
      onClick={onViewDetails}
    >
      <div className="w-full h-48 bg-muted-light relative">
        <Image
          src={imageUrl}
          alt={nft.content?.metadata?.name ?? 'NFT Image'}
          layout="fill"
          objectFit="cover"
          className="group-hover:scale-105 transition-transform"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg'
          }}
        />
      </div>
      <div className="p-4">
        <h4 className="font-semibold truncate">
          {nft.content?.metadata?.name ?? 'Unnamed NFT'}
        </h4>
      </div>
    </div>
  )
}

interface NftDetailModalProps {
  nft: HeliusAsset | null
  onClose: () => void
}

function NftDetailModal({ nft, onClose }: NftDetailModalProps) {
  if (!nft) return null

  const imageUrl = getNftImageUrl(nft)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-lg w-full p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white h-8 w-8 flex items-center justify-center"
          aria-label="Close"
        >
          &times;
        </button>
        <div className="w-full h-64 bg-muted-light rounded-lg mb-4 relative">
          <Image
            src={imageUrl}
            alt={nft.content?.metadata?.name ?? 'NFT Image'}
            layout="fill"
            objectFit="contain"
            className="rounded-lg"
          />
        </div>
        <h2 className="text-xl font-bold mb-2 break-words">
          {nft.content?.metadata?.name ?? 'Unnamed NFT'}
        </h2>
        <p className="text-gray-400 mb-4 break-words">
          {nft.content?.metadata?.description ?? 'No description available.'}
        </p>
        <a
          href={`https://solscan.io/token/${nft.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline break-all"
        >
          View on Solscan
        </a>
      </div>
    </div>
  )
}
