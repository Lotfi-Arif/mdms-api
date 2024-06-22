import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Supervisor,
  Prisma,
  Submission,
  User,
  Project,
  Viva,
  Nomination,
  Lecturer,
} from '@prisma/client';

@Injectable()
export class SupervisorsService {
  constructor(private prisma: PrismaService) {}

  async createSupervisor(
    data: Prisma.SupervisorCreateInput,
  ): Promise<Supervisor> {
    return this.prisma.supervisor.create({ data });
  }

  async getAllSupervisors(): Promise<Supervisor[]> {
    return this.prisma.supervisor.findMany();
  }

  async getSupervisorById(id: string): Promise<Supervisor | null> {
    return this.prisma.supervisor.findUnique({ where: { id } });
  }

  async updateSupervisor(
    id: string,
    data: Prisma.SupervisorUpdateInput,
  ): Promise<Supervisor> {
    return this.prisma.supervisor.update({
      where: { id },
      data,
    });
  }

  async deleteSupervisor(id: string): Promise<Supervisor> {
    return this.prisma.supervisor.delete({ where: { id } });
  }

  // Display all assigned students to current supervisor
  async getAssignedStudents(supervisorId: string): Promise<User[]> {
    const students = await this.prisma.student.findMany({
      where: { supervisorId },
    });
    return this.prisma.user.findMany({
      where: { id: { in: students.map((student) => student.userId) } },
    });
  }

  // Displays the list of students's progress that are supervised by the current supervisor (This is for the progress bar in the dashboard)
  async getStudentProgressBar(
    supervisorId: string,
  ): Promise<{ studentId: string; progress: number }[]> {
    const students = await this.prisma.student.findMany({
      where: { supervisorId },
    });

    return Promise.all(
      students.map(async (student) => {
        const submissions = await this.prisma.submission.findMany({
          where: { studentId: student.id },
        });
        const totalPhases = 4; // Proposal, Submission 1, Submission 2, Final Submission
        const completedPhases = submissions.length;
        return {
          studentId: student.id,
          progress: (completedPhases / totalPhases) * 100,
        };
      }),
    );
  }

  // When on the assgined students page, the user will select a student and view all the submissions made by the student
  async getStudentSubmissions(studentId: string): Promise<Submission[]> {
    return this.prisma.submission.findMany({
      where: { studentId },
    });
  }

  // Get a list of lecturers that are registered on the system (Examiners and Supervisors)
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

  // When in the nominate examiner page, the supervisor will nominate an examiner for a viva
  async nominateExaminer(
    supervisorId: string,
    examinerId: string,
    details: string,
  ): Promise<Nomination> {
    return this.prisma.nomination.create({
      data: {
        details,
        supervisor: { connect: { id: supervisorId } },
        examiner: { connect: { id: examinerId } },
      },
    });
  }

  // Get all the submissions made by all students supervised by the current supervisor
  async getSubmissions(supervisorId: string): Promise<Submission[]> {
    const students = await this.prisma.student.findMany({
      where: { supervisorId },
    });

    return this.prisma.submission.findMany({
      where: { studentId: { in: students.map((student) => student.id) } },
    });
  }

  // Display all the projects that students have submitted, that are supervised by the current supervisor
  async getProjectArchive(supervisorId: string): Promise<Project[]> {
    const students = await this.prisma.student.findMany({
      where: { supervisorId },
    });

    return this.prisma.project.findMany({
      where: { studentId: { in: students.map((student) => student.id) } },
    });
  }

  // if current supervisor is a viva examiner, get all vivas assigned to the supervisor
  async getAssignedVivas(supervisorId: string): Promise<Viva[]> {
    return this.prisma.viva.findMany({
      where: { examiners: { some: { id: supervisorId } } },
    });
  }
}
