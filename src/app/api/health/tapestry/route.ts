import { prisma } from '@/lib/prisma'
import { getTapestryIdentity } from '@/lib/tapestry'
import { NextResponse } from 'next/server'

export async function GET() {
  const healthCheck = {
    timestamp: new Date().toISOString(),
    services: {
      database: { status: 'unknown', details: null as any },
      tapestry: { status: 'unknown', details: null as any }
    },
    integration: {
      dualMode: true,
      gracefulDegradation: true
    }
  }

  // Check Prisma Database
  try {
    const userCount = await prisma.user.count()
    const followCount = await prisma.follow.count()
    const commentCount = await prisma.comment.count()
    const likeCount = await prisma.like.count()

    healthCheck.services.database = {
      status: 'healthy',
      details: {
        users: userCount,
        follows: followCount,
        comments: commentCount,
        likes: likeCount,
        connected: true
      }
    }
  } catch (dbError: any) {
    healthCheck.services.database = {
      status: 'error',
      details: { error: dbError.message }
    }
  }

  // Check Tapestry API
  try {
    if (!process.env.TAPESTRY_API_KEY) {
      throw new Error('TAPESTRY_API_KEY not configured')
    }

    // Try a simple identity lookup with a test wallet
    const testWallet = 'So11111111111111111111111111111111111111112' // WSOL mint as test
    const tapestryResponse = await getTapestryIdentity({ walletAddress: testWallet })
    
    healthCheck.services.tapestry = {
      status: 'healthy',
      details: {
        apiKeyConfigured: true,
        responseReceived: !!tapestryResponse,
        endpoint: 'identities.identitiesDetail',
        testWallet
      }
    }
  } catch (tapestryError: any) {
    healthCheck.services.tapestry = {
      status: 'error',
      details: {
        error: tapestryError.message,
        apiKeyConfigured: !!process.env.TAPESTRY_API_KEY
      }
    }
  }

  // Determine overall health
  const overallHealth = 
    healthCheck.services.database.status === 'healthy' ? 'healthy' : 
    healthCheck.services.tapestry.status === 'healthy' ? 'degraded' : 'error'

  return NextResponse.json({
    ...healthCheck,
    status: overallHealth,
    message: overallHealth === 'healthy' ? 
      'All systems operational' :
      overallHealth === 'degraded' ?
      'Running in degraded mode - Tapestry unavailable but database operational' :
      'System errors detected'
  })
} 