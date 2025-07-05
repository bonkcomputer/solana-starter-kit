import { PrismaClient } from '@/generated/prisma'
import { DEFAULT_ACHIEVEMENTS } from '../models/points.models'

const prisma = new PrismaClient()

async function initializeAchievements() {
  console.log('Initializing default achievements...')
  
  try {
    // Clear existing achievements
    await prisma.achievement.deleteMany()
    console.log('Cleared existing achievements')
    
    // Create default achievements
    const createdAchievements = await prisma.achievement.createMany({
      data: DEFAULT_ACHIEVEMENTS,
    })
    
    console.log(`Created ${createdAchievements.count} default achievements`)
    
    // Verify achievements were created
    const achievements = await prisma.achievement.findMany()
    console.log('Available achievements:')
    achievements.forEach(achievement => {
      console.log(`- ${achievement.name} (${achievement.category})`)
    })
    
  } catch (error) {
    console.error('Error initializing achievements:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script if called directly
if (require.main === module) {
  initializeAchievements()
}

export { initializeAchievements } 