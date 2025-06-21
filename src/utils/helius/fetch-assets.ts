// Utility function to fetch assets (NFTs & tokens) using Helius DAS API
export async function fetchAssets(walletAddress: string) {
  // Get API key from environment variable
  // Use the same pattern as trades API - try both environment variables
const heliusApiKey = process.env.HELIUS_API_KEY || process.env.NEXT_PUBLIC_HELIUS_API_KEY

if (!heliusApiKey) {
  console.error('Helius API key not found - neither HELIUS_API_KEY nor NEXT_PUBLIC_HELIUS_API_KEY is set')
  return { items: [] }
}

  const url = `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'my-id',
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

    const data = await response.json()
    
    // Handle different response formats
    if (data.result && Array.isArray(data.result)) {
      return { items: data.result }
    } else if (data.result && data.result.items && Array.isArray(data.result.items)) {
      return { items: data.result.items }
    } else if (Array.isArray(data)) {
      return { items: data }
    } else {
      console.warn('Unexpected Helius API response format:', data)
      return { items: [] }
    }
  } catch (error) {
    console.error('Error fetching assets:', error)
    return { items: [] }
  }
}
