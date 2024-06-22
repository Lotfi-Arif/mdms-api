import { Injectable } from '@nestjs/common';
import { Prisma, Submission } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubmissionsService {
  constructor(private prisma: PrismaService) {}

  async createSubmission(
    data: Prisma.SubmissionCreateInput,
  ): Promise<Submission> {
    return this.prisma.submission.create({ data });
  }

  async findAllSubmissions(): Promise<Submission[]> {
    return this.prisma.submission.findMany();
  }

  async findOneSubmission(id: string): Promise<Submission | null> {
    return this.prisma.submission.findUnique({
      where: { id },
    });
  }

  async updateSubmission(
    id: string,
    data: Prisma.SubmissionUpdateInput,
  ): Promise<Submission> {
    return this.prisma.submission.update({
      where: { id },
      data,
    });
  }

  async deleteSubmission(id: string): Promise<Submission> {
    return this.prisma.submission.delete({
      where: { id },
    });
  }
}
