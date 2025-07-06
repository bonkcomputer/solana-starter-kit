# Database Management & Data Protection

This document outlines the database management tools and procedures to prevent data loss and ensure safe migrations.

## 🛡️ Data Protection Features

### Automatic Backups
- **Daily backups**: Automated via GitHub Actions at 2 AM UTC
- **Pre-migration backups**: Automatic backup before any migration
- **Manual backups**: Available via npm scripts

### Safe Migration Process
- **Data integrity checks**: Verifies user count before/after migrations
- **Destructive operation detection**: Warns about potentially dangerous migrations
- **Automatic rollback suggestions**: Provides guidance if data loss is detected

## 📋 Available Scripts

### Backup Scripts
```bash
# Create a full database backup
pnpm run db:backup

# Create a pre-migration backup (runs automatically with migrations)
pnpm run db:pre-migration-backup
```

### Migration Scripts
```bash
# Safe migration (with automatic backup)
pnpm run db:migrate

# Production deployment migration (with backup)
pnpm run db:migrate-deploy

# Advanced safe migration with integrity checks
node scripts/safe-migration.js
```

### Data Restoration
```bash
# Restore users from CSV export
pnpm run db:restore-users
```

## 🔄 User Data Restoration

### From Privy.io Export
If you have a CSV export from Privy.io, place it in the `users/` directory and run:
```bash
pnpm run db:restore-users
```

The script will:
- Parse the CSV file (supports both comma and tab-separated formats)
- Extract user data (ID, creation date, wallet addresses, email)
- Generate unique usernames
- Create referral codes
- Skip existing users to prevent duplicates

### Supported CSV Columns
- `ID`: Privy user ID (required)
- `Created at`: User creation timestamp
- `External Solana accounts`: Solana wallet address
- `Embedded Solana accounts`: Embedded wallet address
- `Email account`: User email address

## 📁 Backup File Structure

Backups are stored in the `backups/` directory with timestamps:
```
backups/
├── users-backup-2025-07-05T21-00-00-000Z.json
├── comments-backup-2025-07-05T21-00-00-000Z.json
├── points-backup-2025-07-05T21-00-00-000Z.json
├── achievements-backup-2025-07-05T21-00-00-000Z.json
└── backup-summary-2025-07-05T21-00-00-000Z.json
```

## 🚨 Emergency Procedures

### If Data Loss Occurs
1. **Stop all operations** immediately
2. **Check backup files** in the `backups/` directory
3. **Review the latest backup summary** for data counts
4. **Restore from backup** using the restoration scripts
5. **Investigate the cause** by reviewing migration logs

### Migration Rollback
1. **Identify the problematic migration** in `prisma/migrations/`
2. **Use Prisma's migration rollback**:
   ```bash
   prisma migrate resolve --rolled-back [migration-name]
   ```
3. **Restore data from backup** if needed
4. **Fix the migration** before re-applying

## 🔧 Configuration

### Environment Variables
Ensure these are set in your `.env` file:
```env
DATABASE_URL="your-database-connection-string"
```

### GitHub Actions Secrets
For automated backups, set these secrets in your GitHub repository:
- `DATABASE_URL`: Production database connection string

## 📊 Monitoring

### Data Integrity Checks
The system automatically monitors:
- User count before/after migrations
- Successful backup creation
- Migration completion status

### Alerts
The system will alert you if:
- User count decreases after migration
- Backup creation fails
- Destructive operations are detected

## 🎯 Best Practices

1. **Always backup before migrations** (automated)
2. **Test migrations on staging first**
3. **Review migration files** for destructive operations
4. **Monitor user counts** after migrations
5. **Keep multiple backup copies**
6. **Document any manual data changes**

## 🔗 Related Files

- `scripts/backup-database.js`: Main backup script
- `scripts/restore-users.js`: User restoration from CSV
- `scripts/safe-migration.js`: Safe migration with checks
- `scripts/pre-migration-backup.js`: Pre-migration backup
- `.github/workflows/database-backup.yml`: Automated backup workflow

## 📞 Support

If you encounter issues:
1. Check the backup files in `backups/`
2. Review the migration logs
3. Consult this documentation
4. Contact the development team with backup summaries and error logs
