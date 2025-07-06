// This script ensures Prisma client is generated during build
import { execSync } from 'node:child_process';

try {
  console.log('🔧 Running Prisma generate...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated successfully!');
} catch (error) {
  console.error('❌ Error generating Prisma client:', error.message);
  process.exit(1);
} 