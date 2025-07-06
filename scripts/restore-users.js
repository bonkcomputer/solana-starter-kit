const { PrismaClient } = require('../src/generated/prisma');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const prisma = new PrismaClient();

async function restoreUsers() {
  try {
    console.log('🔄 Starting user data restoration...');
    
    // Read the CSV file
    const csvPath = path.join(__dirname, '..', 'users', 'communitycenterusers7520258pm.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    // Parse CSV (tab-separated)
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      delimiter: '\t' // Tab-separated values
    });
    
    console.log(`📊 Found ${records.length} users to restore`);
    
    let restored = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const record of records) {
      try {
        // Debug: log the record structure for the first record
        if (restored === 0 && skipped === 0 && errors === 0) {
          console.log('🔍 Sample record structure:', Object.keys(record));
          console.log('🔍 Sample record data:', record);
        }
        
        // Extract data from CSV record
        const privyDid = record.ID;
        if (!privyDid) {
          console.log('⚠️  Skipping record with missing ID:', record);
          continue;
        }
        
        const createdAt = new Date(record['Created at']);
        const solanaWalletAddress = record['External Solana accounts'] || null;
        const embeddedWalletAddress = record['Embedded Solana accounts'] || null;
        const email = record['Email account'] || null;
        
        // Generate a username from email or wallet address
        let username = null;
        if (email) {
          username = email.split('@')[0];
        } else if (solanaWalletAddress) {
          username = `user_${solanaWalletAddress.slice(0, 8)}`;
        } else {
          username = `user_${privyDid.slice(-8)}`;
        }
        
        // Ensure username is unique by checking if it exists
        let finalUsername = username;
        let counter = 1;
        while (await prisma.user.findUnique({ where: { username: finalUsername } })) {
          finalUsername = `${username}_${counter}`;
          counter++;
        }
        
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { privyDid }
        });
        
        if (existingUser) {
          console.log(`⚠️  User ${privyDid} already exists, skipping...`);
          skipped++;
          continue;
        }
        
        // Create user with all available data
        await prisma.user.create({
          data: {
            privyDid,
            createdAt,
            username: finalUsername,
            solanaWalletAddress,
            embeddedWalletAddress,
            // Set default values for new fields
            currentStreak: 0,
            longestStreak: 0,
            totalPoints: 0,
            referralCode: `ref_${privyDid.slice(-8)}`, // Generate unique referral code
            // Add bio based on available data
            bio: email ? `Welcome back! Your account was restored from ${email}. You can change your username anytime by clicking the edit button next to it.` : 'Welcome back! Your account was restored. You can change your username anytime by clicking the edit button next to it.',
          }
        });
        
        console.log(`✅ Restored user: ${finalUsername} (${privyDid})`);
        restored++;
        
      } catch (error) {
        console.error(`❌ Error restoring user ${record.ID}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n📈 Restoration Summary:');
    console.log(`✅ Restored: ${restored} users`);
    console.log(`⚠️  Skipped: ${skipped} users`);
    console.log(`❌ Errors: ${errors} users`);
    console.log(`📊 Total processed: ${records.length} users`);
    
  } catch (error) {
    console.error('💥 Fatal error during restoration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the restoration
restoreUsers()
  .then(() => {
    console.log('🎉 User restoration completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Restoration failed:', error);
    process.exit(1);
  });
