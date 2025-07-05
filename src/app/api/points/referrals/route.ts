import { NextRequest, NextResponse } from 'next/server'
import { getReferralStats, checkReferralCode, processReferral } from '@/services/points'

// GET - Get referral stats for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const action = searchParams.get('action')

    if (action === 'check') {
      // Check if a referral code is valid
      const referralCode = searchParams.get('code')
      
      if (!referralCode) {
        return NextResponse.json(
          { error: 'Referral code is required' },
          { status: 400 }
        )
      }

      const result = await checkReferralCode(referralCode)
      return NextResponse.json(result)
    }

    // Get user referral stats
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const referralStats = await getReferralStats(userId)

    if (!referralStats) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(referralStats)
  } catch (error) {
    console.error('Error fetching referral data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch referral data' },
      { status: 500 }
    )
  }
}

// POST - Process a referral signup
export async function POST(request: NextRequest) {
  try {
    const { referralCode, newUserId } = await request.json()

    if (!referralCode || !newUserId) {
      return NextResponse.json(
        { error: 'referralCode and newUserId are required' },
        { status: 400 }
      )
    }

    const success = await processReferral(referralCode, newUserId)

    if (!success) {
      return NextResponse.json(
        { error: 'Invalid referral code or referral processing failed' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing referral:', error)
    return NextResponse.json(
      { error: 'Failed to process referral' },
      { status: 500 }
    )
  }
} 