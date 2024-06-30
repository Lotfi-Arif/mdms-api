import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import {
  Supervisor,
  Prisma,
  Submission,
  User,
  Project,
  Viva,
  Lecturer,
} from '@prisma/client';

// TODO: add a giveFeedback function to the supervisor
@Injectable()
export class SupervisorsService {
  private readonly logger = new Logger(SupervisorsService.name);
  constructor(private prisma: PrismaService) {}

  async makeLecturerSupervisor(lecturerId: string): Promise<Supervisor> {
    this.logger.debug(`Making lecturer with ID: ${lecturerId} a supervisor`);
    const lecturer = await this.prisma.lecturer.findUnique({
      where: { id: lecturerId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
    this.logger.debug(`Fetched lecturer: ${JSON.stringify(lecturer)}`);

    if (!lecturer) {
      this.logger.error(`Lecturer with ID: ${lecturerId} not found`);
      throw new NotFoundException('Lecturer not found');
    }

    this.logger.debug(`Creating supervisor for lecturer: ${lecturerId}`);
    const supervisor = await this.prisma.supervisor.findFirst({
      where: { lecturerId },
      include: {
        lecturer: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });
    this.logger.debug(`Fetched supervisor: ${JSON.stringify(supervisor)}`);

    if (supervisor) {
      this.logger.error(
        `Supervisor already exists for lecturer: ${lecturerId}`,
      );
      return supervisor;
    }

    return this.prisma.supervisor.create({
      data: {
        lecturer: {
          connect: { id: lecturerId },
        },
      },
      include: {
        lecturer: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async getAllSupervisors(): Promise<Supervisor[]> {
    this.logger.debug('Fetching all supervisors');
    const supervisors = await this.prisma.supervisor.findMany({
      include: {
        lecturer: {
          select: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
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
    this.logger.debug(`Fetched ${supervisors.length} supervisors`);

    return supervisors;
  }

  async getSupervisorById(id: string): Promise<Supervisor | null> {
    this.logger.debug(`Fetching supervisor with ID: ${id}`);
    const supervisor = await this.prisma.supervisor.findUnique({
      where: { id },
      include: {
        lecturer: {
          select: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
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
    this.logger.debug(`Fetched supervisor: ${JSON.stringify(supervisor)}`);

    return supervisor;
  }

  async updateSupervisor(
    id: string,
    data: Prisma.SupervisorUpdateInput,
  ): Promise<Supervisor> {
    this.logger.debug(`Updating supervisor with ID: ${id}`);
    const updatedSupervisor = await this.prisma.supervisor.update({
      where: { id },
      data,
      include: {
        lecturer: {
          select: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
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
    this.logger.debug(
      `Updated supervisor: ${JSON.stringify(updatedSupervisor)}`,
    );

    return updatedSupervisor;
  }

  async deleteSupervisor(id: string): Promise<{
    message: string;
    supervisor: Supervisor;
  }> {
    this.logger.debug(`Deleting supervisor with ID: ${id}`);
    const deletedSupervisor = await this.prisma.supervisor.delete({
      where: { id },
      include: {
        lecturer: {
          select: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
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
    this.logger.debug(
      `Deleted supervisor: ${JSON.stringify(deletedSupervisor)}`,
    );

    return {
      message: 'Supervisor deleted',
      supervisor: deletedSupervisor,
    };
  }

  // Display all assigned students to current supervisor
  async getAssignedStudents(supervisorId: string): Promise<User[]> {
    this.logger.debug(
      `Fetching students assigned to supervisor: ${supervisorId}`,
    );
    const students = await this.prisma.student.findMany({
      where: { supervisorId },
    });
    this.logger.debug(`Fetched ${students.length} students`);

    const assginedStudents = await this.prisma.user.findMany({
      where: { id: { in: students.map((student) => student.userId) } },
      include: {
        student: true,
        lecturer: true,
      },
    });
    this.logger.debug(`Fetched ${assginedStudents.length} students`);

    return assginedStudents;
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
    this.logger.debug(
      `Fetching progress for student with ID: ${studentId} supervised by supervisor: ${supervisorId}`,
    );
    const students = await this.prisma.student.findMany({
      where: {
        supervisorId,
        id: studentId,
      },
      include: {
        user: true,
      },
    });
    this.logger.debug(`Fetched ${students.length} students`);

    if (students.length === 0) {
      this.logger.error(
        `Student with ID: ${studentId} not assigned to supervisor: ${supervisorId}`,
      );
      throw new ForbiddenException('Student not assigned to supervisor');
    }

    const results = await Promise.all(
      students.map(async (student) => {
        const submissions = await this.prisma.submission.findMany({
          where: { studentId: student.id },
        });

        const progress = submissions.length > 0 ? 100 : 0;

        return {
          studentId: student.id,
          progress,
          studentName: `${student.user.firstName} ${student.user.lastName}`,
          matricNumber: student.matricNumber,
        };
      }),
    );
    this.logger.debug(`Fetched progress: ${JSON.stringify(results)}`);

    return results;
  }

  // When on the assgined students page, the user will select a student and view all the submissions made by the student
  async getStudentSubmissions(studentId: string): Promise<Submission[]> {
    this.logger.debug(`Fetching submissions for student with ID: ${studentId}`);
    const supervisor = await this.prisma.supervisor.findFirst({
      where: { students: { some: { id: studentId } } },
    });
    this.logger.debug(`Fetched supervisor: ${JSON.stringify(supervisor)}`);

    if (!supervisor) {
      this.logger.error(
        `Student with ID: ${studentId} not assigned to supervisor`,
      );
      throw new ForbiddenException('Student not assigned to supervisor');
    }

    const submission = await this.prisma.submission.findMany({
      where: { studentId },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });
    this.logger.debug(`Fetched ${submission.length} submissions`);

    return submission;
  }

  // Get a list of lecturers that are registered on the system (Examiners and Supervisors)
  async getLecturerList(): Promise<Lecturer[]> {
    this.logger.debug('Fetching all lecturers');
    const lecturers = await this.prisma.lecturer.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
    this.logger.debug(`Fetched ${lecturers.length} lecturers`);

    return lecturers;
  }

  // When in the nominate examiner page, the supervisor will nominate an examiner for a viva
  async nominateExaminer(
    examinerId: string,
    details: string,
  ): Promise<{
    examinerId: string;
    message: string;
  }> {
    this.logger.debug(
      `Nominating examiner with ID: ${examinerId} for viva with details: ${details}`,
    );
    const nominatedExaminer = await this.prisma.nomination.create({
      data: {
        details,
        lecturer: {
          connect: { id: examinerId },
        },
      },
    });

    this.logger.debug(
      `Nominated examiner: ${JSON.stringify(nominatedExaminer)}`,
    );

    return {
      examinerId: nominatedExaminer.lecturerId,
      message: `Examiner nominated for viva with details: ${details}`,
    };
  }

  // Get all the submissions made by all students supervised by the current supervisor
  async getSubmissions(supervisorId: string): Promise<Submission[]> {
    this.logger.debug(
      `Fetching submissions for students supervised by supervisor: ${supervisorId}`,
    );
    const students = await this.prisma.student.findMany({
      where: { supervisorId },
    });
    this.logger.debug(`Fetched ${students.length} students`);

    const submission = await this.prisma.submission.findMany({
      where: { studentId: { in: students.map((student) => student.id) } },
    });
    this.logger.debug(`Fetched ${submission.length} submissions`);

    return submission;
  }

  // Display all the projects that students have submitted, that are supervised by the current supervisor
  async getProjectArchive(supervisorId: string): Promise<Project[]> {
    this.logger.debug(
      `Fetching project archive for students supervised by supervisor: ${supervisorId}`,
    );
    const students = await this.prisma.student.findMany({
      where: { supervisorId },
    });

    const project = await this.prisma.project.findMany({
      where: { studentId: { in: students.map((student) => student.id) } },
    });

    this.logger.debug(`Fetched ${project.length} projects`);

    return project;
  }

  // if current supervisor is a viva examiner, get all vivas assigned to the supervisor
  async getAssignedVivas(supervisorId: string): Promise<Viva[]> {
    this.logger.debug(`Fetching vivas assigned to supervisor: ${supervisorId}`);
    const viva = await this.prisma.viva.findMany({
      where: { examiners: { some: { id: supervisorId } } },
    });

    this.logger.debug(`Fetched ${viva.length} vivas`);

    return viva;
  }
}
