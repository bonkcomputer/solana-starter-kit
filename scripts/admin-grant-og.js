const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function grantOGStatus() {
  // Get command line arguments
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('Usage: node scripts/admin-grant-og.js <username> [reason]');
    console.log('Example: node scripts/admin-grant-og.js johndoe "Special contribution"');
    process.exit(1);
  }

  const username = args[0];
  const reason = args[1] || 'Manual admin grant';

  try {
    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      console.log(`❌ User "${username}" not found`);
      process.exit(1);
    }

    if (user.isOG) {
      console.log(`⚠️  User "${username}" is already OG with reason: ${user.ogReason}`);
      process.exit(0);
    }

    // Grant OG status
    await prisma.user.update({
      where: { username },
      data: {
        isOG: true,
        ogReason: reason
      }
    });

    console.log(`🎉 Successfully granted OG status to "${username}"`);
    console.log(`📝 Reason: ${reason}`);
    console.log(`👤 Privy DID: ${user.privyDid}`);

  } catch (error) {
    console.error('❌ Error granting OG status:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
grantOGStatus(); 