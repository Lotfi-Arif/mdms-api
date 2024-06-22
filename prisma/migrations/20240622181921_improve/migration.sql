/*
  Warnings:

  - A unique constraint covering the columns `[lecturerId]` on the table `Examiner` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[lecturerId]` on the table `Supervisor` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Nomination" ADD COLUMN     "vivaId" TEXT;

-- AlterTable
ALTER TABLE "Viva" ADD COLUMN     "nominationId" TEXT;

-- CreateTable
CREATE TABLE "_nominations" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_nominations_AB_unique" ON "_nominations"("A", "B");

-- CreateIndex
CREATE INDEX "_nominations_B_index" ON "_nominations"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Examiner_lecturerId_key" ON "Examiner"("lecturerId");

-- CreateIndex
CREATE UNIQUE INDEX "Supervisor_lecturerId_key" ON "Supervisor"("lecturerId");

-- AddForeignKey
ALTER TABLE "Nomination" ADD CONSTRAINT "Nomination_vivaId_fkey" FOREIGN KEY ("vivaId") REFERENCES "Viva"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_nominations" ADD CONSTRAINT "_nominations_A_fkey" FOREIGN KEY ("A") REFERENCES "Nomination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_nominations" ADD CONSTRAINT "_nominations_B_fkey" FOREIGN KEY ("B") REFERENCES "Viva"("id") ON DELETE CASCADE ON UPDATE CASCADE;
