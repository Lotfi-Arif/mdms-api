import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
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
  private readonly logger = new Logger(StudentsService.name);

  constructor(private prisma: PrismaService) {}

  async createStudent(data: Prisma.StudentCreateInput): Promise<Student> {
    this.logger.debug(
      `Creating new student with data: ${JSON.stringify(data)}`,
    );
    const student = await this.prisma.student.create({ data });
    this.logger.debug(`Created new student with ID: ${student.id}`);

    return student;
  }

  async getAllStudents(): Promise<Student[]> {
    this.logger.debug('Fetching all students');
    const students = await this.prisma.student.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        supervisor: {
          include: {
            lecturer: {
              select: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    this.logger.debug(`Fetched ${students.length} students`);

    return students;
  }

  async getStudentById(id: string): Promise<Student | null> {
    this.logger.debug(`Fetching student with ID: ${id}`);
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        supervisor: {
          include: {
            lecturer: {
              select: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    this.logger.debug(`Fetched student: ${JSON.stringify(student)}`);

    return student;
  }

  async updateStudent(
    id: string,
    data: Prisma.StudentUpdateInput,
  ): Promise<Student> {
    this.logger.debug(`Updating student with ID: ${id}`);
    const updated = await this.prisma.student.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        supervisor: {
          include: {
            lecturer: {
              select: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    this.logger.debug(`Updated student: ${JSON.stringify(updated)}`);

    return updated;
  }

  async deleteStudent(id: string): Promise<Student> {
    return this.prisma.student.delete({ where: { id } });
  }

  // Displays the progress of a student in terms of the number of submissions made, show the full student data along with the number of submissions made divided by 4
  async getStudentProgress(studentId: string): Promise<{
    student: Student;
    progress: number;
  }> {
    this.logger.debug(`Fetching student progress with ID: ${studentId}`);
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        supervisor: {
          include: {
            lecturer: {
              select: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
    this.logger.debug(`Fetched student: ${JSON.stringify(student)}`);

    if (!student) {
      this.logger.error(`Student with ID ${studentId} not found`);
      throw new BadRequestException('Student not found.');
    }

    this.logger.debug(`Fetching submissions for student with ID: ${studentId}`);
    const submissions = await this.prisma.submission.findMany({
      where: { studentId },
    });
    this.logger.debug(
      `Fetched ${submissions.length} submissions for student with ID: ${studentId}`,
    );

    const totalPhases = 4;
    const completedPhases = submissions.length;
    if (submissions.length > totalPhases) {
      this.logger.error(
        `Student with ID ${studentId} has more than 4 submissions`,
      );
      throw new BadRequestException(
        'A student cannot create more than 4 submissions.',
      );
    }

    this.logger.debug(`Calculating progress for student with ID: ${studentId}`);

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
    this.logger.debug(
      `Creating new submission for student with ID: ${studentId}`,
    );
    const submissions = await this.prisma.submission.findMany({
      where: { studentId },
    });
    this.logger.debug(
      `Fetched ${submissions.length} submissions for student with ID: ${studentId}`,
    );

    if (submissions.length >= 4) {
      this.logger.error(
        `Student with ID ${studentId} has more than 4 submissions`,
      );
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

    this.logger.debug(
      `Created new submission with ID: ${submission.id} for student with ID: ${studentId}`,
    );

    return {
      message: 'Submission created successfully.',
      submission,
    };
  }

  // Method to delete a submission for a student
  async deleteStudentSubmission(
    submissionId: string,
  ): Promise<{ message: string }> {
    this.logger.debug(`Deleting submission with ID: ${submissionId}`);
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      this.logger.error(`Submission with ID ${submissionId} not found`);
      throw new BadRequestException('Submission not found.');
    }

    this.logger.debug(`Deleting submission with ID: ${submissionId}`);
    await this.prisma.submission.delete({
      where: { id: submissionId },
    });
    this.logger.debug(`Deleted submission with ID: ${submissionId}`);

    return { message: `Submission with ID ${submissionId} has been deleted.` };
  }

  // Displays all the lecturers that are registered on the system
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

  // Displays all the projects that students have submitted
  async getProjectArchive(): Promise<Project[]> {
    this.logger.debug('Fetching all projects');
    const projects = await this.prisma.project.findMany({
      include: {
        student: {
          select: {
            matricNumber: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
    this.logger.debug(`Fetched ${projects.length} projects`);

    return projects;
  }

  // Displays the project details of a specific student
  async getVivaDetails(studentId: string): Promise<Viva | null> {
    this.logger.debug(
      `Fetching viva details for student with ID: ${studentId}`,
    );
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
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    this.logger.debug(`Fetched viva details for student with ID: ${studentId}`);

    if (!viva) {
      this.logger.error(
        `Viva details not found for student with ID ${studentId}`,
      );
      return null;
    }

    return viva;
  }
}
