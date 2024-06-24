import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Student,
  Prisma,
  Project,
  Viva,
  Lecturer,
  Submission,
} from '@prisma/client';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async createStudent(data: Prisma.StudentCreateInput): Promise<Student> {
    return this.prisma.student.create({ data });
  }

  async getAllStudents(): Promise<Student[]> {
    return this.prisma.student.findMany();
  }

  async getStudentById(id: string): Promise<Student | null> {
    return this.prisma.student.findUnique({ where: { id } });
  }

  async updateStudent(
    id: string,
    data: Prisma.StudentUpdateInput,
  ): Promise<Student> {
    return this.prisma.student.update({
      where: { id },
      data,
    });
  }

  async deleteStudent(id: string): Promise<Student> {
    return this.prisma.student.delete({ where: { id } });
  }

  // Displays the progress of a student in terms of the number of submissions made
  async getStudentProgress(studentId: string): Promise<number> {
    const submissions = await this.prisma.submission.findMany({
      where: { studentId },
    });
    const totalPhases = 4; // Proposal, Submission 1, Submission 2, Final Submission
    const completedPhases = submissions.length;
    return (completedPhases / totalPhases) * 100;
  }

  // Method to add a new submission for a student
  async addStudentSubmission(
    studentId: string,
    title: string,
    content: string,
  ): Promise<Submission> {
    const submissions = await this.prisma.submission.findMany({
      where: { studentId },
    });

    if (submissions.length >= 4) {
      throw new BadRequestException(
        'A student cannot create more than 4 submissions.',
      );
    }

    return this.prisma.submission.create({
      data: {
        title,
        content,
        student: {
          connect: { id: studentId },
        },
      },
    });
  }

  // Method to delete a submission for a student
  async deleteStudentSubmission(submissionId: string): Promise<Submission> {
    return this.prisma.submission.delete({ where: { id: submissionId } });
  }

  // Displays all the lecturers that are registered on the system
  async getLecturerList(): Promise<Lecturer[]> {
    const lecturers = await this.prisma.lecturer.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    return lecturers;
  }

  // Displays all the projects that students have submitted
  async getProjectArchive(): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      include: {
        student: {
          select: {
            matricNumber: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return projects;
  }

  // Displays the project details of a specific student
  async getVivaDetails(studentId: string): Promise<Viva | null> {
    const viva = await this.prisma.viva.findFirst({
      where: { studentId },
      include: {
        project: {
          select: {
            title: true,
          },
        },
        examiners: {
          select: {
            lecturer: {
              select: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!viva) {
      return null;
    }

    return viva;
  }
}
