/*
  Warnings:

  - Added the required column `projectType` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subjectArea` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "projectType" TEXT NOT NULL,
ADD COLUMN     "subjectArea" TEXT NOT NULL;
