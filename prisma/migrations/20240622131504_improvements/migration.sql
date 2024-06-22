/*
  Warnings:

  - You are about to drop the column `studentId` on the `Nomination` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studentId]` on the table `Viva` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Nomination" DROP CONSTRAINT "Nomination_studentId_fkey";

-- AlterTable
ALTER TABLE "Nomination" DROP COLUMN "studentId",
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "vivaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_studentId_key" ON "Project"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_vivaId_key" ON "Project"("vivaId");

-- CreateIndex
CREATE UNIQUE INDEX "Viva_studentId_key" ON "Viva"("studentId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_vivaId_fkey" FOREIGN KEY ("vivaId") REFERENCES "Viva"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
