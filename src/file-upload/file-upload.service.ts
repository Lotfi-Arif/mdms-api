import { Injectable } from '@nestjs/common';
import { File, Submission } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class FileUploadService {
  constructor(private readonly prisma: PrismaService) {}

  async saveFileDataAndCreateSubmission(
    filename: string,
    mimetype: string,
    path: string,
    title: string,
    studentId: string,
    submissionType: string,
  ): Promise<{ file: File; submission: Submission }> {
    return this.prisma.$transaction(async (prisma) => {
      const file = await prisma.file.create({
        data: {
          filename,
          mimetype,
          path,
        },
      });

      const submission = await prisma.submission.create({
        data: {
          title,
          content: submissionType, // Using content field to store submission type
          student: { connect: { id: studentId } },
          file: { connect: { id: file.id } },
        },
      });

      return { file, submission };
    });
  }

  async getFile(id: string): Promise<File> {
    return this.prisma.file.findUnique({ where: { id } });
  }

  async getSubmissionsByStudentId(studentId: string): Promise<Submission[]> {
    return this.prisma.submission.findMany({
      where: { studentId },
      include: { file: true },
    });
  }
}
