const { PrismaClient } = require('../src/generated/prisma');
const { backupDatabase } = require('./backup-database');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);
const prisma = new PrismaClient();

async function safeMigration() {
  try {
    console.log('🛡️  Starting Safe Migration Process...');
    
    // Step 1: Check if database has data
    const userCount = await prisma.user.count();
    console.log(`📊 Current database has ${userCount} users`);
    
    if (userCount > 0) {
      console.log('🔒 Database contains data - creating backup before migration...');
      
      // Step 2: Create backup
      await backupDatabase();
      console.log('✅ Backup completed successfully');
      
      // Step 3: Warn about potential data loss
      console.log('⚠️  WARNING: Migration may cause data loss!');
      console.log('📋 Pre-migration checklist:');
      console.log('   ✅ Backup created');
      console.log('   ⚠️  Review migration files for destructive operations');
      console.log('   ⚠️  Test migration on a copy of production data first');
      
      // Step 4: Check for potentially destructive operations
      const { stdout } = await execAsync('prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma');
      
      const destructivePatterns = [
        'DROP TABLE',
        'DROP COLUMN',
        'ALTER TABLE.*DROP',
        'TRUNCATE',
        'DELETE FROM'
      ];
      
      const hasDestructiveOperations = destructivePatterns.some(pattern => 
        new RegExp(pattern, 'i').test(stdout)
      );
      
      if (hasDestructiveOperations) {
        console.log('🚨 DESTRUCTIVE OPERATIONS DETECTED!');
        console.log('🛑 This migration contains potentially destructive operations.');
        console.log('📋 Please review the migration carefully before proceeding.');
        console.log('💡 Consider using a staging environment first.');
        
        // In production, you might want to require manual confirmation
        process.exit(1);
      }
    }
    
    // Step 5: Run the migration
    console.log('🚀 Running migration...');
    await execAsync('prisma migrate deploy');
    console.log('✅ Migration completed successfully!');
    
    // Step 6: Verify data integrity
    const newUserCount = await prisma.user.count();
    console.log(`📊 Post-migration database has ${newUserCount} users`);
    
    if (userCount > 0 && newUserCount < userCount) {
      console.log('🚨 WARNING: User count decreased after migration!');
      console.log(`   Before: ${userCount} users`);
      console.log(`   After: ${newUserCount} users`);
      console.log('📋 Please check your backup files and consider restoring if needed.');
    }
    
    console.log('🎉 Safe migration completed!');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    console.log('🔄 Your backup files are available for restoration if needed.');
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run safe migration
if (require.main === module) {
  safeMigration()
    .then(() => {
      console.log('✅ Safe migration process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Safe migration process failed:', error);
      process.exit(1);
    });
}

module.exports = { safeMigration };
