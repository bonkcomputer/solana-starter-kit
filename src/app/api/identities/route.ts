import { getTapestryIdentity } from '@/lib/tapestry'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const walletAddress = searchParams.get('walletAddress')

  if (!walletAddress) {
    return NextResponse.json(
      { error: 'Wallet address is required' },
      { status: 400 },
    )
  }

  if (!process.env.TAPESTRY_API_KEY) {
    console.error('TAPESTRY_API_KEY is not configured')
    return NextResponse.json(
      { error: 'API configuration error' },
      { status: 500 },
    )
  }

  try {
    const response = await getTapestryIdentity({ walletAddress })
    console.log('Identities API response:', response)
    
    // Filter out identities without usernames to prevent 'Unknown' profiles
    if (response?.identities && Array.isArray(response.identities)) {
      const filteredIdentities = response.identities.filter((identity: any) => 
        identity.profiles?.[0]?.username
      )
      
      return NextResponse.json({
        ...response,
        identities: filteredIdentities
      })
    }
    
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error fetching profiles:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profiles' },
      { status: 500 },
    )
  }
}
