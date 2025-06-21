import { NextRequest, NextResponse } from 'next/server'

interface HeliusAsset {
  id: string
  interface: string
  content?: {
    metadata?: {
      name?: string
      symbol?: string
      description?: string
      attributes?: Array<{
        trait_type: string
        value: string
      }>
    }
    links?: {
      image?: string
    }
    files?: Array<{
      uri?: string
    }>
  }
  token_info?: {
    balance?: number
    decimals?: number
  }
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Use server-side environment variable
    const heliusApiKey = process.env.HELIUS_API_KEY || process.env.NEXT_PUBLIC_HELIUS_API_KEY

    if (!heliusApiKey) {
      console.error('Helius API key not configured')
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      )
    }

    const url = `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`

    // Fetch SOL balance separately
    let solBalance = 0
    try {
      const solResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'sol-balance',
          method: 'getBalance',
          params: [walletAddress],
        }),
      })
      
      if (solResponse.ok) {
        const solData = await solResponse.json()
        if (solData.result) {
          solBalance = solData.result.value / 1e9 // Convert lamports to SOL
        }
      }
    } catch (solError) {
      console.warn('Error fetching SOL balance:', solError)
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'portfolio-fetch',
        method: 'searchAssets',
        params: {
          ownerAddress: walletAddress,
          tokenType: 'all',
          displayOptions: {
            showCollectionMetadata: true,
          },
        },
      }),
    })

    if (!response.ok) {
      console.error('Helius API error:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch portfolio data' },
        { status: 500 }
      )
    }

    const data = await response.json()
    
    // Handle different response formats
    let assets: HeliusAsset[] = []
    if (data.result && Array.isArray(data.result)) {
      assets = data.result
    } else if (data.result && data.result.items && Array.isArray(data.result.items)) {
      assets = data.result.items
    } else if (Array.isArray(data)) {
      assets = data
    } else {
      console.warn('Unexpected Helius API response format:', data)
      assets = []
    }

    // Separate tokens and NFTs
    const tokenAssets: TokenHolding[] = []
    const nftAssets: HeliusAsset[] = []
    
    // Define priority tokens that should always be shown (even with 0 balance)
    const priorityTokens: { [key: string]: string } = {
      'So11111111111111111111111111111111111111112': 'SOL', // Wrapped SOL
      'D3CVUkqyXZKgVBdRD7XfuRxQXFKJ86474XyFZrqAbonk': 'BCT', // BCT token
      'H4phNbsqjV5rqk8u6FUACTLB6rNZRTAPGnBb8KXJpump': 'SSE', // SSE token
    }
    
    // Track which priority tokens we've found
    const foundPriorityTokens = new Set<string>()
    
    // Collect all token addresses for batch price fetching
    const tokenIds = assets
      .filter(asset => asset.interface === 'FungibleToken' || asset.interface === 'FungibleAsset')
      .map(asset => asset.id)
      .filter(Boolean)
    
    // Add priority tokens to price fetch even if not found in assets
    Object.keys(priorityTokens).forEach(address => {
      if (!tokenIds.includes(address)) {
        tokenIds.push(address)
      }
    })
    
    // Fetch all prices in a single batch request
    let priceData: { [key: string]: { price: string } } = {}
    if (tokenIds.length > 0) {
      try {
        const priceResponse = await fetch(`https://api.jup.ag/price/v2?ids=${tokenIds.join(',')}`)
        if (priceResponse.ok) {
          const priceResult = await priceResponse.json()
          priceData = priceResult.data || {}
        }
      } catch (priceError) {
        console.warn('Error fetching batch prices:', priceError)
      }
    }
    
    // First, add native SOL balance
    try {
      let solPriceUsd = 0
      if (priceData['So11111111111111111111111111111111111111112'] && priceData['So11111111111111111111111111111111111111112'].price) {
        solPriceUsd = parseFloat(priceData['So11111111111111111111111111111111111111112'].price)
      }

      const solValueUsd = solBalance * solPriceUsd

      tokenAssets.push({
        address: 'So11111111111111111111111111111111111111112',
        name: 'Solana',
        symbol: 'SOL',
        decimals: 9,
        balance: solBalance.toString(),
        uiAmount: solBalance,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
        priceUsd: solPriceUsd,
        valueUsd: solValueUsd
      })
      foundPriorityTokens.add('So11111111111111111111111111111111111111112')
    } catch (solError) {
      console.warn('Error processing SOL balance:', solError)
    }
    
    for (const asset of assets) {
      if (asset.interface === 'FungibleToken' || asset.interface === 'FungibleAsset') {
        // Process fungible tokens
        try {
          // Get token metadata from Jupiter
          const jupiterResponse = await fetch(`https://api.jup.ag/tokens/v1/token/${asset.id}`)
          let tokenInfo = null
          
          if (jupiterResponse.ok) {
            tokenInfo = await jupiterResponse.json()
          }
          
          const balance = asset.token_info?.balance || 0
          const decimals = asset.token_info?.decimals || 6
          const uiAmount = balance / Math.pow(10, decimals)
          
          // Mark priority token as found
          if (priorityTokens[asset.id]) {
            foundPriorityTokens.add(asset.id)
          }
          
          // Include token if it has balance OR is a priority token
          const isPriorityToken = priorityTokens[asset.id] !== undefined
          if (uiAmount > 0 || isPriorityToken) {
            // Get real-time price from batch data
            let priceUsd = 0
            if (asset.id && priceData[asset.id] && priceData[asset.id].price) {
              priceUsd = parseFloat(priceData[asset.id].price)
            }

            const valueUsd = uiAmount * priceUsd

            tokenAssets.push({
              address: asset.id,
              name: tokenInfo?.name || asset.content?.metadata?.name || 'Unknown Token',
              symbol: tokenInfo?.symbol || asset.content?.metadata?.symbol || 'UNK',
              decimals: decimals,
              balance: uiAmount.toString(),
              uiAmount: uiAmount,
              logoURI: tokenInfo?.logoURI || asset.content?.links?.image || '',
              priceUsd: priceUsd,
              valueUsd: valueUsd
            })
          }
        } catch (tokenError) {
          console.warn(`Error processing token ${asset.id}:`, tokenError)
        }
      } else if (asset.interface === 'ProgrammableNFT' || asset.interface === 'NFT') {
        // Process NFTs
        nftAssets.push(asset)
      }
    }
    
    // Add any missing priority tokens with 0 balance
    for (const [address, symbol] of Object.entries(priorityTokens)) {
      if (!foundPriorityTokens.has(address) && address !== 'So11111111111111111111111111111111111111112') {
        try {
          // Get token metadata from Jupiter
          const jupiterResponse = await fetch(`https://api.jup.ag/tokens/v1/token/${address}`)
          let tokenInfo = null
          
          if (jupiterResponse.ok) {
            tokenInfo = await jupiterResponse.json()
          }
          
          // Get real-time price from batch data
          let priceUsd = 0
          if (priceData[address] && priceData[address].price) {
            priceUsd = parseFloat(priceData[address].price)
          }

          tokenAssets.push({
            address: address,
            name: tokenInfo?.name || symbol,
            symbol: tokenInfo?.symbol || symbol,
            decimals: tokenInfo?.decimals || 6,
            balance: '0',
            uiAmount: 0,
            logoURI: tokenInfo?.logoURI || '',
            priceUsd: priceUsd,
            valueUsd: 0
          })
        } catch (tokenError) {
          console.warn(`Error processing missing priority token ${address}:`, tokenError)
        }
      }
    }

    // Sort tokens to show priority tokens first
    tokenAssets.sort((a, b) => {
      const aPriority = priorityTokens[a.address] ? 1 : 0
      const bPriority = priorityTokens[b.address] ? 1 : 0
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority // Priority tokens first
      }
      
      // Among priority tokens, SOL first, then BCT, then SSE
      if (aPriority && bPriority) {
        if (a.symbol === 'SOL') return -1
        if (b.symbol === 'SOL') return 1
        if (a.symbol === 'BCT') return -1
        if (b.symbol === 'BCT') return 1
        if (a.symbol === 'SSE') return -1
        if (b.symbol === 'SSE') return 1
      }
      
      // Sort by value for non-priority tokens
      return b.valueUsd - a.valueUsd
    })

    return NextResponse.json({
      success: true,
      tokens: tokenAssets,
      nfts: nftAssets,
      totalTokens: tokenAssets.length,
      totalNfts: nftAssets.length
    })

  } catch (error) {
    console.error('Error fetching portfolio:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 