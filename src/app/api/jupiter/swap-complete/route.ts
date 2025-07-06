import { NextRequest, NextResponse } from 'next/server'
import { updateTradingVolumeAndCheckOG } from '@/services/og-earning'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { 
      privyDid, 
      walletAddress,
      tradeVolumeUSD,
      transactionSignature,
      inputToken,
      outputToken,
      inputAmount,
      outputAmount
    } = await req.json()

    if (!privyDid && !walletAddress) {
      return NextResponse.json(
        { error: 'Either privyDid or walletAddress is required' },
        { status: 400 }
      )
    }

    if (!tradeVolumeUSD || tradeVolumeUSD <= 0) {
      return NextResponse.json(
        { error: 'Valid tradeVolumeUSD is required' },
        { status: 400 }
      )
    }

    // Find user by privyDid or walletAddress
    let user = null
    if (privyDid) {
      user = await prisma.user.findUnique({
        where: { privyDid }
      })
    } else if (walletAddress) {
      user = await prisma.user.findFirst({
        where: { solanaWalletAddress: walletAddress }
      })
    }

    if (!user) {
      // If user not found, just log the trade but don't update volume
      console.log(`📊 Trade completed by unregistered user: ${walletAddress} - Volume: $${tradeVolumeUSD}`)
      return NextResponse.json({ 
        success: true, 
        message: 'Trade logged, user not registered',
        volumeUpdated: false 
      })
    }

    // Update trading volume and check for OG eligibility
    const result = await updateTradingVolumeAndCheckOG(user.privyDid, tradeVolumeUSD)

    console.log(`📊 Trade completed by ${user.username}:`)
    console.log(`   Volume: $${tradeVolumeUSD.toLocaleString()}`)
    console.log(`   New Total: $${result.newTotalVolume.toLocaleString()}`)
    if (result.ogGranted) {
      console.log(`   🎉 OG STATUS GRANTED! Reason: ${result.ogReason}`)
    }

    // Optional: Log trade details for analytics
    if (transactionSignature) {
      console.log(`   Transaction: ${transactionSignature}`)
      console.log(`   Trade: ${inputAmount} ${inputToken} → ${outputAmount} ${outputToken}`)
    }

    return NextResponse.json({
      success: true,
      volumeUpdated: true,
      newTotalVolume: result.newTotalVolume,
      ogGranted: result.ogGranted,
      ogReason: result.ogReason,
      user: {
        username: user.username,
        privyDid: user.privyDid
      }
    })

  } catch (error: any) {
    console.error('Error tracking swap completion:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to track swap' },
      { status: 500 }
    )
  }
} 