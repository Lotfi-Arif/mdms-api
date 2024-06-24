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

  // Displays the progress of a student in terms of the number of submissions made, show the full student data along with the number of submissions made divided by 4
  async getStudentProgress(studentId: string): Promise<{
    student: Student;
    progress: number;
  }> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        supervisor: {
          include: {
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
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!student) {
      throw new BadRequestException('Student not found.');
    }

    const submissions = await this.prisma.submission.findMany({
      where: { studentId },
    });

    const totalPhases = 4;
    const completedPhases = submissions.length;
    if (submissions.length > totalPhases) {
      throw new BadRequestException(
        'A student cannot create more than 4 submissions.',
      );
    }

    return {
      student,
      progress: (completedPhases / totalPhases) * 100,
    };
  }

  // Method to add a new submission for a student
  async addStudentSubmission(
    studentId: string,
    title: string,
    content: string,
  ): Promise<{
    message: string;
    submission: Submission;
  }> {
    const submissions = await this.prisma.submission.findMany({
      where: { studentId },
    });

    if (submissions.length >= 4) {
      throw new BadRequestException(
        'A student cannot create more than 4 submissions.',
      );
    }

    const submission = await this.prisma.submission.create({
      data: {
        title,
        content,
        student: {
          connect: { id: studentId },
        },
      },
    });

    return {
      message: 'Submission created successfully.',
      submission,
    };
  }

  // Method to delete a submission for a student
  async deleteStudentSubmission(
    submissionId: string,
  ): Promise<{ message: string }> {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new BadRequestException('Submission not found.');
    }

    await this.prisma.submission.delete({
      where: { id: submissionId },
    });

    return { message: `Submission with ID ${submissionId} has been deleted.` };
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
