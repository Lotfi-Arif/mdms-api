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

// TODO: add a giveFeedback function to the supervisor
@Injectable()
export class SupervisorsService {
  constructor(private prisma: PrismaService) {}

  async createSupervisor(
    data: Prisma.SupervisorCreateInput,
  ): Promise<Supervisor> {
    return this.prisma.supervisor.create({ data });
  }

  async getAllSupervisors(): Promise<Supervisor[]> {
    const supervisors = this.prisma.supervisor.findMany({
      include: {
        lecturer: {
          select: {
            user: {
              select: {
                email: true,
                name: true,
              },
            },
            supervisor: {
              select: {
                students: true,
                lecturerId: true,
              },
            },
          },
        },
      },
    });

    return supervisors;
  }

  async getSupervisorById(id: string): Promise<Supervisor | null> {
    return this.prisma.supervisor.findUnique({
      where: { id },
      include: {
        lecturer: {
          select: {
            user: {
              select: {
                email: true,
                name: true,
              },
            },
            supervisor: {
              select: {
                students: true,
                lecturerId: true,
              },
            },
          },
        },
      },
    });
  }

  async updateSupervisor(
    id: string,
    data: Prisma.SupervisorUpdateInput,
  ): Promise<Supervisor> {
    return this.prisma.supervisor.update({
      where: { id },
      data,
      include: {
        lecturer: {
          select: {
            user: {
              select: {
                email: true,
                name: true,
              },
            },
            supervisor: {
              select: {
                students: true,
                lecturerId: true,
              },
            },
          },
        },
      },
    });
  }

  async deleteSupervisor(id: string): Promise<Supervisor> {
    const deletedSupervisor = await this.prisma.supervisor.delete({
      where: { id },
    });

    return deletedSupervisor;
  }

  // Display all assigned students to current supervisor
  async getAssignedStudents(supervisorId: string): Promise<User[]> {
    const students = await this.prisma.student.findMany({
      where: { supervisorId },
    });
    return this.prisma.user.findMany({
      where: { id: { in: students.map((student) => student.userId) } },
      include: {
        student: true,
        lecturer: true,
      },
    });
  }

  // Displays the list of students's progress that are supervised by the current supervisor (This is for the progress bar in the dashboard)
  async getStudentProgressBar(
    supervisorId: string,
    studentId: string,
  ): Promise<
    {
      studentId: string;
      progress: number;
      studentName: string;
      matricNumber: string;
    }[]
  > {
    const students = await this.prisma.student.findMany({
      where: {
        supervisorId,
        id: studentId,
      },
      include: {
        user: true,
      },
    });

    return Promise.all(
      students.map(async (student) => {
        const submissions = await this.prisma.submission.findMany({
          where: { studentId: student.id },
        });
        const totalPhases = 4; // Proposal, Submission 1, Submission 2, Final Submission
        const completedPhases = submissions.length;
        if (completedPhases > totalPhases) {
          throw new Error(
            'Student has completed more than 4 submissions, Which should not be possible',
          );
        }
        return {
          studentId: student.id,
          progress: (completedPhases / totalPhases) * 100,
          studentName: student.user.name,
          matricNumber: student.matricNumber,
        };
      }),
    );
  }

  // When on the assgined students page, the user will select a student and view all the submissions made by the student
  async getStudentSubmissions(studentId: string): Promise<Submission[]> {
    const supervisor = await this.prisma.supervisor.findFirst({
      where: { students: { some: { id: studentId } } },
    });

    if (!supervisor) {
      throw new Error('Student not assigned to supervisor');
    }

    return this.prisma.submission.findMany({
      where: { studentId },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  // Get a list of lecturers that are registered on the system (Examiners and Supervisors)
  async getLecturerList(): Promise<Lecturer[]> {
    return this.prisma.lecturer.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // When in the nominate examiner page, the supervisor will nominate an examiner for a viva
  async nominateExaminer(
    examinerId: string,
    details: string,
  ): Promise<Nomination> {
    return this.prisma.nomination.create({
      data: {
        details,
        lecturer: {
          connect: { id: examinerId },
        },
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
