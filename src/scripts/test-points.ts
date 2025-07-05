import { PrismaClient } from '@/generated/prisma'
import { awardPoints, getUserPoints } from '../services/points'
import { PointActionType } from '../models/points.models'

const prisma = new PrismaClient()

async function testPointsSystem() {
  console.log('Testing Points System...\n')
  
  try {
    // Test wallet address (using a dummy address for testing)
    const testWallet = 'TestWallet123456789'
    
    // Test 1: Award points for profile creation
    console.log('1. Testing profile creation points...')
    const profileResult = await awardPoints(testWallet, PointActionType.PROFILE_CREATION)
    console.log(`Profile creation result:`, profileResult)
    
    // Test 2: Award points for daily login
    console.log('\n2. Testing daily login points...')
    const loginResult = await awardPoints(testWallet, PointActionType.DAILY_LOGIN)
    console.log(`Daily login result:`, loginResult)
    
    // Test 3: Award points for comment
    console.log('\n3. Testing comment points...')
    const commentResult = await awardPoints(testWallet, PointActionType.COMMENT_CREATED)
    console.log(`Comment result:`, commentResult)
    
    // Test 4: Award points for trade
    console.log('\n4. Testing trade points...')
    const tradeResult = await awardPoints(testWallet, PointActionType.TRADE_COMPLETED)
    console.log(`Trade result:`, tradeResult)
    
    // Test 5: Get user points info
    console.log('\n5. Getting user points info...')
    const userInfo = await getUserPoints(testWallet)
    console.log(`User points info:`, userInfo)
    
    // Test 6: Get recent transactions
    console.log('\n6. Getting recent transactions...')
    const transactions = await prisma.pointTransaction.findMany({
      where: { userId: testWallet },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })
    console.log(`Recent transactions:`, transactions)
    
    console.log('\n✅ Points system test completed successfully!')
    
  } catch (error) {
    console.error('❌ Error testing points system:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script if called directly
if (require.main === module) {
  testPointsSystem()
}

export { testPointsSystem } 