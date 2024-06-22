-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "supervisorId" TEXT;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "Supervisor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
