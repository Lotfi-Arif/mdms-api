/*
  Warnings:

  - You are about to drop the column `examinerId` on the `Lecturer` table. All the data in the column will be lost.
  - You are about to drop the column `supervisorId` on the `Lecturer` table. All the data in the column will be lost.
  - Added the required column `lecturerId` to the `Examiner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lecturerId` to the `Supervisor` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Lecturer" DROP CONSTRAINT "Lecturer_examinerId_fkey";

-- DropForeignKey
ALTER TABLE "Lecturer" DROP CONSTRAINT "Lecturer_supervisorId_fkey";

-- AlterTable
ALTER TABLE "Examiner" ADD COLUMN     "lecturerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Lecturer" DROP COLUMN "examinerId",
DROP COLUMN "supervisorId";

-- AlterTable
ALTER TABLE "Supervisor" ADD COLUMN     "lecturerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Viva" ADD COLUMN     "evaluation" TEXT,
ADD COLUMN     "vivaDate" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Supervisor" ADD CONSTRAINT "Supervisor_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "Lecturer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Examiner" ADD CONSTRAINT "Examiner_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "Lecturer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
