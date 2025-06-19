import { RPCResponse, TokenResponse } from "@/models/token.models"

const getHeliusRpcUrl = (): string => {
  const rpcUrl = process.env.RPC_URL
  const apiKey = process.env.HELIUS_API_KEY
  console.log('getHeliusRpcUrl in das-api: RPC_URL set?', !!rpcUrl)
  console.log('getHeliusRpcUrl in das-api: HELIUS_API_KEY set?', !!apiKey)

  if (!rpcUrl) {
    throw new Error('RPC_URL environment variable is not set.')
  }

  if (!apiKey || rpcUrl.includes('api-key')) {
    return rpcUrl
  }

  const url = new URL(rpcUrl)
  url.searchParams.append('api-key', apiKey)
  return url.toString()
}

interface SearchAssetsResponse {
  jsonrpc: string
  id: string
  error?: {
    message: string
    code: number
  }
  result?: {
    total: number
    limit: number
    page: number
    items: TokenResponse['result'][]
  }
}

export async function fetchTokenInfo(
  id: string
): Promise<TokenResponse | null> {
  try {
    const rpcUrl = getHeliusRpcUrl()
    console.log('Constructed RPC URL in das-api/fetchTokenInfo:', rpcUrl)
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'my-id',
        method: 'getAsset',
        params: {
          id: id,
        },
      }),
    })

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`)
      return null
    }

    const data: RPCResponse = await response.json()

    // Check for RPC error response
    if (data.error) {
      console.error(`RPC error: ${data.error.message}`)
      return null
    }

    // Validate that we have a result
    if (!data.result) {
      console.log('No token data found')
      return null
    }

    return {
      jsonrpc: data.jsonrpc,
      id: data.id,
      result: data.result,
    }
  } catch (error) {
    console.error(
      'Error fetching token info:',
      error instanceof Error ? error.message : 'Unknown error'
    )
    return null
  }
}

const whiteListedHolders = ['3AFBKkJs7TPGq8wLR3BFSZPZDkV9eg3PfyPMz1NecwiZ']

export async function checkSolanaBusinessFrogHolder({
  walletAddress,
}: {
  walletAddress: string
}): Promise<boolean> {
  try {
    const rpcUrl = getHeliusRpcUrl()
    console.log(
      'Constructed RPC URL in das-api/checkSolanaBusinessFrogHolder:',
      rpcUrl,
    )

    if (whiteListedHolders.includes(walletAddress)) {
      return true
    }

    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'searchAssets',
        params: {
          ownerAddress: walletAddress,
          grouping: [
            'collection',
            'J7rxtKmEpNJEtrfkagiTF1gsmLyVus6BQZFY4ouBkeMG',
          ],
          page: 1,
          limit: 1000,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: SearchAssetsResponse = await response.json()
    if (data.error) {
      throw new Error(`RPC error: ${data.error.message}`)
    }

    const hasBusinessFrog = (data.result?.total ?? 0) >= 1
    return hasBusinessFrog
  } catch (error) {
    console.error(
      'Error checking Business Frog holder status:',
      error instanceof Error ? error.message : 'Unknown error'
    )
    return false
  }
}
