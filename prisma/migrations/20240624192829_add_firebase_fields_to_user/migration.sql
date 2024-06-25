-- AlterTable
ALTER TABLE "User" ADD COLUMN     "customClaims" JSONB,
ADD COLUMN     "disabled" BOOLEAN,
ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "emailVerified" BOOLEAN,
ADD COLUMN     "multiFactor" JSONB,
ADD COLUMN     "passwordHash" TEXT,
ADD COLUMN     "passwordSalt" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "photoURL" TEXT,
ADD COLUMN     "tenantId" TEXT,
ADD COLUMN     "tokensValidAfterTime" TIMESTAMP(3),
ADD COLUMN     "uid" TEXT;
