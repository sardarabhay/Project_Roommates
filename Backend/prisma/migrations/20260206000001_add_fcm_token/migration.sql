-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "fcmToken" TEXT;

-- AlterTable (if priority column is also missing)
ALTER TABLE "Issue" ADD COLUMN IF NOT EXISTS "priority" TEXT NOT NULL DEFAULT 'medium';
