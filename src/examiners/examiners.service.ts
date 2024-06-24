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
    return this.prisma.examiner.findMany({
      include: {
        lecturer: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
    });
  }

  async findOneExaminer(id: string): Promise<Examiner | null> {
    return this.prisma.examiner.findUnique({
      where: { id },
      include: {
        lecturer: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
    });
  }

  async updateExaminer(
    id: string,
    data: Prisma.ExaminerUpdateInput,
  ): Promise<Examiner> {
    return this.prisma.examiner.update({
      where: { id },
      data,
      include: {
        lecturer: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
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
      include: {
        lecturer: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });
  }

  // Accepts a nomination request, the lecturer will become an examiner if the nomination is accepted
  async acceptNomination(
    nominationId: string,
    vivaData: Prisma.VivaCreateInput,
  ): Promise<Nomination> {
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

  // Gives the student evaluation on their viva presentation
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
      include: {
        student: { include: { user: { select: { name: true } } } },
      },
    });
  }

  // Display the viva details for the current examiner
  async getVivaDetails(examinerId: string): Promise<Viva[]> {
    return this.prisma.viva.findMany({
      where: { examiners: { some: { id: examinerId } } },
      include: {
        student: {
          include: {
            user: { select: { name: true } },
          },
        },
        project: true,
      },
    });
  }
}
