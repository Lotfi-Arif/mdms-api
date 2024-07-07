-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "finalReportCompleted" BOOLEAN,
ADD COLUMN     "finalReportDate" TIMESTAMP(3),
ADD COLUMN     "presentationCompleted" BOOLEAN,
ADD COLUMN     "presentationDate" TIMESTAMP(3),
ADD COLUMN     "progress1Completed" BOOLEAN,
ADD COLUMN     "progress1Date" TIMESTAMP(3),
ADD COLUMN     "progress2Completed" BOOLEAN,
ADD COLUMN     "progress2Date" TIMESTAMP(3);
