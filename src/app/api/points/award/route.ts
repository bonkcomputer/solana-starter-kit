import { NextRequest, NextResponse } from 'next/server'
import { awardPoints } from '@/services/points'
import { PointActionType } from '@/models/points.models'

export async function POST(request: NextRequest) {
  try {
    const { userId, actionType, metadata } = await request.json()

    if (!userId || !actionType) {
      return NextResponse.json(
        { error: 'userId and actionType are required' },
        { status: 400 }
      )
    }

    // Validate actionType
    if (!Object.values(PointActionType).includes(actionType)) {
      return NextResponse.json(
        { error: 'Invalid actionType' },
        { status: 400 }
      )
    }

    const result = await awardPoints(userId, actionType, metadata)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error awarding points:', error)
    return NextResponse.json(
      { error: 'Failed to award points' },
      { status: 500 }
    )
  }
} 