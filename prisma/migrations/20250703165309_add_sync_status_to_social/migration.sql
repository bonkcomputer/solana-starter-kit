-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "syncStatus" TEXT NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Follow" ADD COLUMN     "syncStatus" TEXT NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Like" ADD COLUMN     "syncStatus" TEXT NOT NULL DEFAULT 'PENDING';
