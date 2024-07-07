import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Delete,
  Logger,
  NotFoundException,
  // UseGuards,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { Lecturer, Project, Student, Submission, Viva } from '@prisma/client';
// import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
// import { PoliciesGuard } from 'src/casl/policies.guard';
// import { AppAbility } from 'src/casl/casl-ability.factory';
// import { CheckPolicies } from 'src/casl/check-policies.decorator';

@Controller('students')
// @UseGuards(JwtAuthGuard, PoliciesGuard)
export class StudentsController {
  private readonly logger = new Logger(StudentsController.name);
  constructor(private readonly studentsService: StudentsService) {}

  @Get(':id')
  // @CheckPolicies((ability: AppAbility) => ability.can('read', 'Student'))
  async getStudentByEmail(
    @Param('id') studentId: string,
  ): Promise<Student | null> {
    this.logger.debug(`Fetching student with ID: ${studentId}`);
    const student = await this.studentsService.getStudentByEmail(studentId);
    this.logger.debug(`Fetched student: ${JSON.stringify(student)}`);

    if (!student) {
      this.logger.error(`Student with ID: ${studentId} not found`);
      throw new NotFoundException('Student does not exist');
    }

    return student;
  }

  @Get()
  // @CheckPolicies((ability: AppAbility) => ability.can('read', 'Student'))
  async getAllStudents(): Promise<Student[]> {
    this.logger.debug('Fetching all students');
    const students = await this.studentsService.getAllStudents();
    this.logger.debug(`Fetched ${students.length} students`);

    return students;
  }

  @Get(':id/progress')
  // @CheckPolicies((ability: AppAbility) => ability.can('read', 'Student'))
  async getStudentProgress(@Param('id') studentId: string) {
    this.logger.debug(`Fetching progress for student with ID: ${studentId}`);
    const progress = await this.studentsService.getStudentProgress(studentId);
    this.logger.debug(`Fetched progress: ${JSON.stringify(progress)}`);

    return {
      student: progress.student,
      progress: progress.progress,
    };
  }

  @Post(':email/submissions')
  // @CheckPolicies((ability: AppAbility) => ability.can('create', 'Submission'))
  async addStudentSubmission(
    @Param('email') email: string,
    @Body('title') title: string,
    @Body('submissionType') submissionType: string,
    @Body('fileId') fileId: string,
  ): Promise<{
    message: string;
    submission: Submission;
  }> {
    this.logger.debug(
      `Adding submission for student with ID: ${email} with title: ${title}`,
    );
    const submission = await this.studentsService.addStudentSubmission(
      email,
      title,
      submissionType,
      fileId,
    );
    this.logger.debug(`Added submission: ${JSON.stringify(submission)}`);

    return submission;
  }

  @Delete(':id')
  // @CheckPolicies((ability: AppAbility) => ability.can('delete', 'Submission'))
  async deleteStudentSubmission(@Param('id') submissionId: string): Promise<{
    message: string;
  }> {
    this.logger.debug(`Deleting submission with ID: ${submissionId}`);
    const message =
      await this.studentsService.deleteStudentSubmission(submissionId);
    this.logger.debug(`Deleted submission: ${JSON.stringify(message)}`);

    return message;
  }

  @Get('lecturers')
  // @CheckPolicies((ability: AppAbility) => ability.can('read', 'Lecturer'))
  async getLecturerList(): Promise<Lecturer[]> {
    this.logger.debug('Fetching all lecturers');
    const lecturers = await this.studentsService.getLecturerList();
    this.logger.debug(`Fetched ${lecturers.length} lecturers`);

    return lecturers;
  }

  @Get('projects')
  // @CheckPolicies((ability: AppAbility) => ability.can('read', 'Project'))
  async getProjectArchive(): Promise<Project[]> {
    this.logger.debug('Fetching all projects');
    const projects = await this.studentsService.getProjectArchive();
    this.logger.debug(`Fetched ${projects.length} projects`);

    return projects;
  }

  @Get(':id/viva-details')
  // @CheckPolicies((ability: AppAbility) => ability.can('read', 'Viva'))
  async getVivaDetails(@Param('id') studentId: string): Promise<Viva | null> {
    this.logger.debug(
      `Fetching viva details for student with ID: ${studentId}`,
    );
    const viva = await this.studentsService.getVivaDetails(studentId);
    this.logger.debug(`Fetched viva details: ${JSON.stringify(viva)}`);

    return viva;
  }
}
