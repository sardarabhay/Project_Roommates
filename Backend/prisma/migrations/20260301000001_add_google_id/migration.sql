-- AlterTable: Add googleId to User for Google OAuth
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "googleId" TEXT;

-- CreateIndex: Unique constraint on googleId (only if not already exists)
CREATE UNIQUE INDEX IF NOT EXISTS "User_googleId_key" ON "User"("googleId");
