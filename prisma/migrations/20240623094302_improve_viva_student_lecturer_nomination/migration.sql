/*
  Warnings:

  - A unique constraint covering the columns `[staffNumber]` on the table `Lecturer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[matricNumber]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `staffNumber` to the `Lecturer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `matricNumber` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Lecturer" ADD COLUMN     "staffNumber" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Nomination" ADD COLUMN     "rejected" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "matricNumber" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;

-- AlterTable
ALTER TABLE "Viva" ADD COLUMN     "passed" BOOLEAN;

-- CreateIndex
CREATE UNIQUE INDEX "Lecturer_staffNumber_key" ON "Lecturer"("staffNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Student_matricNumber_key" ON "Student"("matricNumber");
