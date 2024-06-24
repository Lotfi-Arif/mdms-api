import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
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
  private readonly logger = new Logger(ExaminersService.name);

  constructor(private prisma: PrismaService) {}

  async createExaminer(data: Prisma.ExaminerCreateInput): Promise<Examiner> {
    this.logger.debug(
      `Creating new examiner with data: ${JSON.stringify(data)}`,
    );
    const newExaminer = await this.prisma.examiner.create({ data });
    this.logger.debug(`Created new examiner with id: ${newExaminer.id}`);

    return newExaminer;
  }

  async findAllExaminers(): Promise<Examiner[]> {
    this.logger.debug('Fetching all examiners');
    const examiners = await this.prisma.examiner.findMany({
      include: {
        lecturer: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
    });
    this.logger.debug(`Fetched ${examiners.length} examiners`);

    return examiners;
  }

  async findOneExaminer(id: string): Promise<Examiner | null> {
    this.logger.debug(`Fetching examiner with id: ${id}`);
    const examiner = await this.prisma.examiner.findUnique({
      where: { id },
      include: {
        lecturer: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
    });
    this.logger.debug(`Fetched examiner: ${JSON.stringify(examiner)}`);

    return examiner;
  }

  async updateExaminer(
    id: string,
    data: Prisma.ExaminerUpdateInput,
  ): Promise<Examiner> {
    this.logger.debug(`Updating examiner with id: ${id}`);
    const updated = await this.prisma.examiner.update({
      where: { id },
      data,
      include: {
        lecturer: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
    });
    this.logger.debug(`Updated examiner: ${JSON.stringify(updated)}`);

    return updated;
  }

  async deleteExaminer(id: string): Promise<{
    message: string;
    examiner: Examiner;
  }> {
    this.logger.debug(`Deleting examiner with id: ${id}`);
    const deleted = await this.prisma.examiner.delete({
      where: { id },
      include: {
        lecturer: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
    });
    this.logger.debug(`Deleted examiner: ${JSON.stringify(deleted)}`);

    return {
      message: 'Examiner deleted successfully',
      examiner: deleted,
    };
  }

  // Display all nomination requests for the current examiner
  async getNominationRequests(examinerId: string): Promise<Nomination[]> {
    this.logger.debug(
      `Fetching nomination requests for examiner: ${examinerId}`,
    );
    const nominations = await this.prisma.nomination.findMany({
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
    this.logger.debug(`Fetched ${nominations.length} nomination requests`);

    return nominations;
  }

  // Accepts a nomination request, the lecturer will become an examiner if the nomination is accepted
  async acceptNomination(
    nominationId: string,
    vivaData: Prisma.VivaCreateInput,
  ): Promise<Nomination> {
    this.logger.debug(`Accepting nomination request: ${nominationId}`);
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
      this.logger.debug(
        `Making lecturer an examiner: ${nomination.lecturer.id}`,
      );
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

      this.logger.debug(`Lecturer is now an examiner`);
    }

    this.logger.debug(
      `Creating new viva for student: ${vivaData.student.connect.id}`,
    );
    // Create a new viva for the student if needed
    await this.prisma.viva.create({
      data: vivaData,
    });

    this.logger.debug(`Nomination accepted: ${JSON.stringify(nomination)}`);

    return nomination;
  }

  // Rejects a nomination request
  async rejectNomination(nominationId: string): Promise<Nomination> {
    this.logger.debug(`Rejecting nomination request: ${nominationId}`);
    const nomination = await this.prisma.nomination.update({
      where: { id: nominationId },
      data: { accepted: false },
    });
    this.logger.debug(`Nomination rejected: ${JSON.stringify(nomination)}`);

    return nomination;
  }

  // Gives the student evaluation on their viva presentation
  async evaluateStudent(
    vivaId: string,
    evaluation: string,
    hasPassed: boolean,
  ): Promise<Viva> {
    this.logger.debug(`Evaluating student for viva: ${vivaId}`);
    const evaluated = await this.prisma.viva.update({
      where: { id: vivaId },
      data: { evaluation, passed: hasPassed },
    });
    this.logger.debug(`Student evaluated: ${JSON.stringify(evaluated)}`);

    // Get the latest submission from the student
    this.logger.debug(
      `Fetching latest submission for student: ${evaluated.studentId}`,
    );
    const latestSubmission = await this.prisma.submission.findFirst({
      where: { studentId: evaluated.studentId },
      orderBy: { createdAt: 'desc' },
    });
    this.logger.debug(
      `Fetched latest submission: ${JSON.stringify(latestSubmission)}`,
    );

    // if the student has passed the viva, add their submission into the project archive
    if (hasPassed) {
      this.logger.debug(`Adding student project to archive`);
      await this.prisma.project.create({
        data: {
          student: {
            connect: { id: evaluated.studentId },
          },
          title: latestSubmission.title,
          projectType: 'OTHER',
          subjectArea: 'latestSubmission.subjectArea',
          viva: {
            connect: { id: evaluated.id },
          },
        },
      });
      this.logger.debug(`Student project added to archive`);
    }

    this.logger.debug(`Student evaluation completed`);

    return evaluated;
  }

  // Displays all the lecturers that are registered on the system, specify if they are already examiners or not
  async getLecturerList(): Promise<Lecturer[]> {
    this.logger.debug(`Fetching all lecturers`);
    const lecturers = await this.prisma.lecturer.findMany({
      include: {
        user: { select: { name: true, email: true } },
        examiner: true,
        supervisor: true,
      },
    });
    this.logger.debug(`Fetched ${lecturers.length} lecturers`);

    return lecturers;
  }

  // Display all students projects that have been added to the system
  async getProjectArchive(): Promise<Project[]> {
    this.logger.debug(`Fetching project archive`);
    const archives = await this.prisma.project.findMany({
      include: {
        student: { include: { user: { select: { name: true } } } },
      },
    });
    this.logger.debug(`Fetched ${archives.length} projects`);

    return archives;
  }

  // Display the viva details for the current examiner
  async getVivaDetails(examinerId: string): Promise<Viva[]> {
    this.logger.debug(`Fetching viva details for examiner: ${examinerId}`);
    const detailed = await this.prisma.viva.findMany({
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
    this.logger.debug(`Fetched ${detailed.length} viva details`);

    return detailed;
  }
}
