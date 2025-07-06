import { NextRequest, NextResponse } from 'next/server'
import { getOGProgress } from '@/services/og-earning'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const privyDid = searchParams.get('privyDid')

  if (!privyDid) {
    return NextResponse.json(
      { error: 'privyDid is required' },
      { status: 400 }
    )
  }

  try {
    const progress = await getOGProgress(privyDid)
    
    if (!progress) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(progress)

  } catch (error: any) {
    console.error('Error getting OG progress:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get OG progress' },
      { status: 500 }
    )
  }
} 