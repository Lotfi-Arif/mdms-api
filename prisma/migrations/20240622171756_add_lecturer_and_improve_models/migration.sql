/*
  Warnings:

  - You are about to drop the column `userId` on the `Examiner` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Supervisor` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Examiner" DROP CONSTRAINT "Examiner_userId_fkey";

-- DropForeignKey
ALTER TABLE "Supervisor" DROP CONSTRAINT "Supervisor_userId_fkey";

-- DropIndex
DROP INDEX "Examiner_userId_key";

-- DropIndex
DROP INDEX "Supervisor_userId_key";

-- AlterTable
ALTER TABLE "Examiner" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "Nomination" ADD COLUMN     "accepted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "feedback" TEXT;

-- AlterTable
ALTER TABLE "Supervisor" DROP COLUMN "userId";

-- CreateTable
CREATE TABLE "Lecturer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "supervisorId" TEXT,
    "examinerId" TEXT,

    CONSTRAINT "Lecturer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lecturer_userId_key" ON "Lecturer"("userId");

-- AddForeignKey
ALTER TABLE "Lecturer" ADD CONSTRAINT "Lecturer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lecturer" ADD CONSTRAINT "Lecturer_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "Supervisor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lecturer" ADD CONSTRAINT "Lecturer_examinerId_fkey" FOREIGN KEY ("examinerId") REFERENCES "Examiner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
