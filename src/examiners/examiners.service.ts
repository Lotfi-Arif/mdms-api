import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Examiner, Prisma, Nomination, Viva, Lecturer } from '@prisma/client';

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

  // Display all nomination requests for the current examiner
  async getNominationRequests(examinerId: string): Promise<Nomination[]> {
    return this.prisma.nomination.findMany({
      where: { examinerId },
      include: { examiner: {} },
    });
  }

  // this will need to get the nomination id and update the nomination to accepted
  async acceptNomination(nominationId: string): Promise<Nomination> {
    return this.prisma.nomination.update({
      where: { id: nominationId },
      data: {
        accepted: true,
      },
    });
  }

  // Rejects a nomination request
  async rejectNomination(nominationId: string): Promise<Nomination> {
    return this.prisma.nomination.update({
      where: { id: nominationId },
      data: { accepted: false },
    });
  }

  // gives the student evaluation on thier viva presentation
  async evaluateStudent(vivaId: string, evaluation: string): Promise<Viva> {
    return this.prisma.viva.update({
      where: { id: vivaId },
      // TODO - Add evaluation to the viva model in the Prisma schema
      data: { evaluation },
    });
  }

  // Displays all the lecturers that are registered on the system
  async getLecturerList(): Promise<Lecturer[]> {
    return this.prisma.lecturer.findMany();
  }

  // Display all students projects that have been added to the system
  async getProjectArchive(): Promise<any[]> {
    return this.prisma.project.findMany({
      select: {
        title: true,
        student: { select: { user: { select: { name: true } } } },
      },
    });
  }

  // Display the viva details for the current examiner
  async getVivaDetails(examinerId: string): Promise<Viva[]> {
    return this.prisma.viva.findMany({
      where: { examiners: { some: { id: examinerId } } },
    });
  }
}
