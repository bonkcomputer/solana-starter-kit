import { RPCResponse, TokenResponse } from '@/models/token.models'
import { NextResponse } from 'next/server'

const getHeliusRpcUrl = (): string => {
  const rpcUrl = process.env.RPC_URL
  if (!rpcUrl) {
    throw new Error('RPC_URL environment variable is not set.')
  }

  const apiKey = process.env.HELIUS_API_KEY
  if (!apiKey || rpcUrl.includes('api-key')) {
    return rpcUrl
  }

  const url = new URL(rpcUrl)
  url.searchParams.append('api-key', apiKey)
  return url.toString()
}

async function fetchTokenInfoServer(id: string): Promise<TokenResponse> {
  const rpcUrl = getHeliusRpcUrl()

  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'my-id',
      method: 'getAsset',
      params: { id },
    }),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data: RPCResponse = await response.json()

  if (data.error) {
    throw new Error(`RPC error: ${data.error.message}`)
  }

  if (!data.result) {
    throw new Error('No token data found')
  }

  return {
    jsonrpc: data.jsonrpc,
    id: data.id,
    result: data.result,
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
  }

  try {
    const tokenInfo = await fetchTokenInfoServer(id)
    return NextResponse.json(tokenInfo, {
      headers: {
        'Cache-Control': 'public, s-maxage=10',
      },
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred'
    console.error('Error fetching token info:', errorMessage)

    // Check for specific error messages to return specific status codes
    if (errorMessage.toLowerCase().includes('not found')) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 })
    }

    return NextResponse.json(
      { error: `Failed to fetch token info: ${errorMessage}` },
      { status: 500 },
    )
  }
}
