/*
  Warnings:

  - You are about to drop the column `examinerId` on the `Nomination` table. All the data in the column will be lost.
  - You are about to drop the column `supervisorId` on the `Nomination` table. All the data in the column will be lost.
  - Added the required column `lecturerId` to the `Nomination` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Nomination" DROP CONSTRAINT "Nomination_examinerId_fkey";

-- DropForeignKey
ALTER TABLE "Nomination" DROP CONSTRAINT "Nomination_supervisorId_fkey";

-- AlterTable
ALTER TABLE "Nomination" DROP COLUMN "examinerId",
DROP COLUMN "supervisorId",
ADD COLUMN     "lecturerId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Nomination" ADD CONSTRAINT "Nomination_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "Lecturer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
