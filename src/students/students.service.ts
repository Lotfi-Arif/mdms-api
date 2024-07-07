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

  async getStudentByEmail(email: string): Promise<Student | null> {
    this.logger.debug(`Fetching student with email: ${email}`);
    const student = await this.prisma.student.findFirst({
      where: { user: { email: email } },
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
    email: string,
    data: Prisma.StudentUpdateInput,
  ): Promise<Student> {
    this.logger.debug(`Updating student with ID: ${email}`);

    // First, fetch the student using the email
    const student = await this.prisma.student.findFirst({
      where: {
        user: {
          email,
        },
      },
      select: {
        id: true,
      },
    });

    if (!student) {
      throw new Error(`Student with email ${email} not found`);
    }

    const updated = await this.prisma.student.update({
      where: { id: student.id },
      data,
    });

    this.logger.debug(`Updated student: ${JSON.stringify(updated)}`);

    return updated;
  }

  async deleteStudent(id: string): Promise<Student> {
    return this.prisma.student.delete({ where: { id } });
  }

  // Displays the progress of a student in terms of the number of submissions made, show the full student data along with the number of submissions made divided by 4
  async getStudentProgress(email: string) {
    this.logger.debug(`Fetching student progress with ID: ${email}`);
    const student = await this.prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        student: {
          select: {
            id: true,
            matricNumber: true,
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
        },
      },
    });
    this.logger.debug(`Fetched student: ${JSON.stringify(student)}`);

    if (!student) {
      this.logger.error(`Student with ID ${email} not found`);
      throw new BadRequestException('Student not found.');
    }

    this.logger.debug(`Fetching submissions for student with ID: ${email}`);
    const submissions = await this.prisma.submission.findMany({
      where: {
        student: {
          user: {
            email,
          },
        },
      },
    });
    this.logger.debug(
      `Fetched ${submissions.length} submissions for student with ID: ${email}`,
    );

    const totalPhases = 4;
    const completedPhases = submissions.length;
    if (submissions.length > totalPhases) {
      this.logger.error(`Student with ID ${email} has more than 4 submissions`);
      throw new BadRequestException(
        'A student cannot create more than 4 submissions.',
      );
    }

    this.logger.debug(`Calculating progress for student with ID: ${email}`);

    return {
      student: student.student,
      progress: (completedPhases / totalPhases) * 100,
    };
  }

  // Method to add a new submission for a student
  async addStudentSubmission(
    email: string,
    title: string,
    submissionType: string,
    fileId: string,
  ): Promise<{
    message: string;
    submission: Submission;
  }> {
    this.logger.debug(
      `Creating new submission for student with email: ${email}`,
    );

    const student = await this.prisma.student.findFirst({
      where: {
        user: {
          email,
        },
      },
    });

    if (!student) {
      throw new BadRequestException('Student not found.');
    }

    const submissions = await this.prisma.submission.findMany({
      where: {
        studentId: student.id,
      },
    });

    this.logger.debug(
      `Fetched ${submissions.length} submissions for student with email: ${email}`,
    );

    if (submissions.length >= 4) {
      this.logger.error(
        `Student with email ${email} has more than 4 submissions`,
      );
      throw new BadRequestException(
        'A student cannot create more than 4 submissions.',
      );
    }

    const submission = await this.prisma.submission.create({
      data: {
        title,
        content: submissionType,
        student: {
          connect: { id: student.id },
        },
        file: {
          connect: { id: fileId },
        },
      },
      include: {
        file: true,
      },
    });

    this.logger.debug(
      `Created new submission with ID: ${submission.id} for student with email: ${email}`,
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
  async getVivaDetails(email: string): Promise<Viva | null> {
    this.logger.debug(`Fetching viva details for student with ID: ${email}`);
    const viva = await this.prisma.viva.findFirst({
      where: { student: { user: { email } } },
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
    this.logger.debug(`Fetched viva details for student with ID: ${email}`);

    if (!viva) {
      this.logger.error(`Viva details not found for student with ID ${email}`);
      return null;
    }

    return viva;
  }
}
