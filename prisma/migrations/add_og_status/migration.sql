-- Add OG status fields and trading volume to User table
ALTER TABLE "User" ADD COLUMN "totalTradingVolume" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "isOG" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "ogReason" TEXT; 