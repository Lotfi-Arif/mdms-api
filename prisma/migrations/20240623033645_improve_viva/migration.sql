/*
  Warnings:

  - You are about to drop the column `vivaId` on the `Nomination` table. All the data in the column will be lost.
  - You are about to drop the column `nominationId` on the `Viva` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Nomination" DROP CONSTRAINT "Nomination_vivaId_fkey";

-- AlterTable
ALTER TABLE "Nomination" DROP COLUMN "vivaId";

-- AlterTable
ALTER TABLE "Viva" DROP COLUMN "nominationId";
