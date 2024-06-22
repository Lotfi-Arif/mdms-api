import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Student,
  Prisma,
  Submission,
  Project,
  Viva,
  Lecturer,
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

  // Creates a new submission for a student
  async createSubmission(
    studentId: string,
    title: string,
    content: string,
  ): Promise<Submission> {
    return this.prisma.submission.create({
      data: {
        title,
        content,
        student: { connect: { id: studentId } },
      },
    });
  }

  // Displays all the lecturers that are registered on the system
  async getLecturerList(): Promise<Lecturer[]> {
    return this.prisma.lecturer.findMany();
  }

  // Displays all the projects that students have submitted
  async getProjectArchive(): Promise<Project[]> {
    return this.prisma.project.findMany();
  }

  // Displays the project details of a specific student
  async getVivaDetails(studentId: string): Promise<Viva | null> {
    return this.prisma.viva.findFirst({
      where: { studentId },
    });
  }
}
