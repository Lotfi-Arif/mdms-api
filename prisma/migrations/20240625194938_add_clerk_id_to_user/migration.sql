/*
  Warnings:

  - You are about to drop the column `customClaims` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `disabled` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `displayName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `multiFactor` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordSalt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `photoURL` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `tokensValidAfterTime` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `uid` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "customClaims",
DROP COLUMN "disabled",
DROP COLUMN "displayName",
DROP COLUMN "emailVerified",
DROP COLUMN "multiFactor",
DROP COLUMN "passwordHash",
DROP COLUMN "passwordSalt",
DROP COLUMN "phoneNumber",
DROP COLUMN "photoURL",
DROP COLUMN "tenantId",
DROP COLUMN "tokensValidAfterTime",
DROP COLUMN "uid",
ADD COLUMN     "clerkId" TEXT;
