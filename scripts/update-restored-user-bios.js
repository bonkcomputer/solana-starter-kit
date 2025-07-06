const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function updateRestoredUserBios() {
  try {
    console.log('🔄 Updating bio messages for restored users...');
    
    // Find users with auto-generated usernames (starting with "user_")
    const restoredUsers = await prisma.user.findMany({
      where: {
        OR: [
          { username: { startsWith: 'user_' } },
          { bio: { contains: 'Restored user' } }
        ]
      },
      select: {
        privyDid: true,
        username: true,
        bio: true
      }
    });
    
    console.log(`📊 Found ${restoredUsers.length} restored users to update`);
    
    let updated = 0;
    
    for (const user of restoredUsers) {
      try {
        // Check if bio contains email
        const hasEmail = user.bio && user.bio.includes('@');
        
        const newBio = hasEmail 
          ? `Welcome back! Your account was restored. You can change your username anytime by clicking the edit button next to it.`
          : 'Welcome back! Your account was restored. You can change your username anytime by clicking the edit button next to it.';
        
        await prisma.user.update({
          where: { privyDid: user.privyDid },
          data: { bio: newBio }
        });
        
        console.log(`✅ Updated bio for user: ${user.username}`);
        updated++;
        
      } catch (error) {
        console.error(`❌ Error updating user ${user.username}:`, error.message);
      }
    }
    
    console.log('\n📈 Update Summary:');
    console.log(`✅ Updated: ${updated} users`);
    console.log(`📊 Total processed: ${restoredUsers.length} users`);
    
  } catch (error) {
    console.error('💥 Fatal error during bio update:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateRestoredUserBios()
  .then(() => {
    console.log('🎉 Bio update completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Bio update failed:', error);
    process.exit(1);
  });
