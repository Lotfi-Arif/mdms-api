import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Examiner, Prisma } from '@prisma/client';

@Injectable()
export class ExaminersService {
  constructor(private prisma: PrismaService) {}

  async createExaminer(data: Prisma.ExaminerCreateInput): Promise<Examiner> {
    return this.prisma.examiner.create({ data });
  }

  async findAllExaminers(): Promise<Examiner[]> {
    return this.prisma.examiner.findMany();
  }

  async findOneExaminer(id: string): Promise<Examiner | null> {
    return this.prisma.examiner.findUnique({
      where: { id },
    });
  }

  async updateExaminer(
    id: string,
    data: Prisma.ExaminerUpdateInput,
  ): Promise<Examiner> {
    return this.prisma.examiner.update({
      where: { id },
      data,
    });
  }

  async deleteExaminer(id: string): Promise<Examiner> {
    return this.prisma.examiner.delete({
      where: { id },
    });
  }
}
