import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { File, Submission } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import * as nodemailer from 'nodemailer';

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);
  private transporter = nodemailer.createTransport({
    // Configure your email service here
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'arifariana1510@gmail.com',
      pass: 'ArifSuffianMuhamadZaili',
    },
  });

  constructor(private readonly prisma: PrismaService) {}

  async saveFileAndCreateSubmission(
    file: Express.Multer.File,
    title: string,
    submissionType: string,
    studentEmail: string,
  ): Promise<{ message: string; submission: Submission }> {
    return this.prisma.$transaction(async (prisma) => {
      const student = await prisma.student.findFirst({
        where: {
          user: {
            email: studentEmail,
          },
        },
      });

      if (!student) {
        throw new BadRequestException('Student not found.');
      }

      const submissions = await prisma.submission.findMany({
        where: {
          studentId: student.id,
        },
      });

      if (submissions.length >= 4) {
        throw new BadRequestException(
          'A student cannot create more than 4 submissions.',
        );
      }

      const savedFile = await prisma.file.create({
        data: {
          filename: file.filename,
          mimetype: file.mimetype,
          path: file.path,
        },
      });

      const submission = await prisma.submission.create({
        data: {
          title,
          content: submissionType,
          student: {
            connect: { id: student.id },
          },
          file: {
            connect: { id: savedFile.id },
          },
        },
        include: {
          file: true,
        },
      });

      return {
        message: 'Submission created successfully.',
        submission,
      };
    });
  }

  async getFile(id: string): Promise<File> {
    return this.prisma.file.findUnique({ where: { id } });
  }

  async getSubmissionsByStudentId(studentId: string): Promise<Submission[]> {
    return this.prisma.submission.findMany({
      where: { studentId },
      include: { file: true },
    });
  }

  async sendUploadNotification(fileName: string): Promise<void> {
    const mailOptions = {
      from: 'arifariana1510@gmail.com',
      to: 'arifsuffian@graduate.utm.my', // have to declare admin's email
      subject: 'New File Upload Notification',
      text: `A new file has been uploaded: ${fileName}`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.debug('Email notification sent');
    } catch (error) {
      this.logger.error('Error sending email notification', error);
    }
  }
}
