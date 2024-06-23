import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Examiner,
  Prisma,
  Nomination,
  Viva,
  Lecturer,
  Project,
} from '@prisma/client';

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
      where: {
        lecturer: {
          examiner: { id: examinerId },
        },
      },
    });
  }

  // Accepts a nomination request, the lecturer will become an examiner if the nomination is accepted
  async acceptNomination(nominationId: string): Promise<Nomination> {
    // Update the nomination to accepted
    const nomination = await this.prisma.nomination.update({
      where: { id: nominationId },
      data: { accepted: true },
      include: {
        lecturer: {
          include: { examiner: true },
        },
      },
    });

    // Check if the lecturer is not already an examiner
    if (!nomination.lecturer.examiner) {
      // Make the lecturer an examiner
      await this.prisma.examiner.create({
        data: {
          lecturer: {
            connect: {
              id: nomination.lecturer.id,
            },
          },
        },
      });
    }

    // Create a new viva for the student if needed
    // Assuming we have vivaData to be passed in some form
    const vivaData = {
      topic: 'New Viva Topic',
      student: { connect: { id: 'student-id' } },
      vivaDate: new Date(),
      examiners: { connect: { id: nomination.lecturer.id } },
    };

    await this.prisma.viva.create({
      data: vivaData,
    });

    return nomination;
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
      data: { evaluation },
    });
  }

  // Displays all the lecturers that are registered on the system, specify if they are already examiners or not
  async getLecturerList(): Promise<Lecturer[]> {
    return this.prisma.lecturer.findMany({
      include: {
        user: { select: { name: true, email: true } },
        examiner: true,
        supervisor: true,
      },
    });
  }

  // Display all students projects that have been added to the system
  async getProjectArchive(): Promise<Project[]> {
    return this.prisma.project.findMany({
      select: {
        id: true,
        title: true,
        studentId: true,
        vivaId: true,
        createdAt: true,
        updatedAt: true,
        student: { include: { user: { select: { name: true } } } },
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
