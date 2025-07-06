const { backupDatabase } = require('./backup-database');

async function preMigrationBackup() {
  console.log('🚨 PRE-MIGRATION BACKUP STARTING...');
  console.log('This backup will run before any database migration to prevent data loss.');
  
  try {
    await backupDatabase();
    console.log('✅ Pre-migration backup completed successfully!');
    console.log('🔒 Your data is now safely backed up before the migration.');
  } catch (error) {
    console.error('❌ Pre-migration backup failed!');
    console.error('🛑 MIGRATION SHOULD NOT PROCEED WITHOUT BACKUP!');
    throw error;
  }
}

// Run the pre-migration backup
preMigrationBackup()
  .then(() => {
    console.log('🎉 Ready for migration!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Pre-migration backup failed:', error);
    process.exit(1);
  });
