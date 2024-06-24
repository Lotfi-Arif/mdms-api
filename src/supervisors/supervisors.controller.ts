import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
} from '@nestjs/common';
import { SupervisorsService } from './supervisors.service';
import {
  Supervisor,
  Submission,
  Viva,
  Prisma,
  Project,
  Lecturer,
  User,
} from '@prisma/client';

@Controller('supervisors')
export class SupervisorsController {
  private readonly logger = new Logger(SupervisorsController.name);
  constructor(private readonly supervisorsService: SupervisorsService) {}

  @Post(':lecturerId')
  async create(@Param('lecturerId') lecturerId: string): Promise<Supervisor> {
    this.logger.log(`Creating supervisor for lecturer with ID: ${lecturerId}`);
    const supervisor =
      await this.supervisorsService.makeLecturerSupervisor(lecturerId);
    this.logger.log(`Created supervisor: ${JSON.stringify(supervisor)}`);

    return supervisor;
  }

  @Get()
  async findAll(): Promise<Supervisor[]> {
    this.logger.log('Fetching all supervisors');
    const supervisors = await this.supervisorsService.getAllSupervisors();
    this.logger.log(`Fetched ${supervisors.length} supervisors`);

    return supervisors;
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Supervisor | null> {
    this.logger.log(`Fetching supervisor with ID: ${id}`);
    const supervisor = await this.supervisorsService.getSupervisorById(id);
    this.logger.log(`Fetched supervisor: ${JSON.stringify(supervisor)}`);

    return supervisor;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: Prisma.SupervisorUpdateInput,
  ): Promise<Supervisor> {
    this.logger.log(`Updating supervisor with ID: ${id}`);
    const updatedSupervisor = await this.supervisorsService.updateSupervisor(
      id,
      updateData,
    );
    this.logger.log(`Updated supervisor: ${JSON.stringify(updatedSupervisor)}`);

    return updatedSupervisor;
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{
    message: string;
    supervisor: Supervisor;
  }> {
    this.logger.log(`Deleting supervisor with ID: ${id}`);
    const supervisor = await this.supervisorsService.deleteSupervisor(id);
    this.logger.log(`Deleted supervisor: ${JSON.stringify(supervisor)}`);

    return supervisor;
  }

  @Get(':supervisorId/students')
  async getAssignedStudents(
    @Param('supervisorId') supervisorId: string,
  ): Promise<User[]> {
    this.logger.log(
      `Fetching students assigned to supervisor with ID: ${supervisorId}`,
    );
    const students =
      await this.supervisorsService.getAssignedStudents(supervisorId);
    this.logger.log(`Fetched ${students.length} students`);

    return students;
  }

  @Get(':supervisorId/student-progress/:id')
  async getStudentProgress(
    @Param('id') studentId: string,
    @Param('supervisorId') supervisorId: string,
  ): Promise<{ studentId: string; progress: number }[]> {
    this.logger.log(
      `Fetching progress for student with ID: ${studentId} assigned to supervisor with ID: ${supervisorId}`,
    );
    const progress = await this.supervisorsService.getStudentProgressBar(
      studentId,
      supervisorId,
    );
    this.logger.log(`Fetched progress: ${JSON.stringify(progress)}`);

    return progress;
  }

  @Get('submissions/:studentId')
  async getStudentSubmissions(@Param('studentId') studentId: string): Promise<
    | Submission[]
    | {
        errorType: string;
        message: string;
      }
  > {
    this.logger.log(`Fetching submissions for student with ID: ${studentId}`);
    const submissions = await this.supervisorsService.getSubmissions(studentId);
    this.logger.log(`Fetched ${submissions.length} submissions`);

    return submissions;
  }

  @Get(':id/submissions')
  async getSubmissions(@Param('id') studentId: string): Promise<Submission[]> {
    this.logger.log(`Fetching submissions for student with ID: ${studentId}`);
    const submissions = await this.supervisorsService.getSubmissions(studentId);
    this.logger.log(`Fetched ${submissions.length} submissions`);

    return submissions;
  }

  @Post(':id/nominate')
  async nominateExaminer(
    @Param('id') examinerId: string,
    @Body() nominationData: { details: string },
  ): Promise<{
    examinerId: string;
    message: string;
  }> {
    this.logger.log(`Nominating examiner with ID: ${examinerId}`);
    const nomination = await this.supervisorsService.nominateExaminer(
      examinerId,
      nominationData.details,
    );
    this.logger.log(`Nominated examiner: ${JSON.stringify(nomination)}`);

    return nomination;
  }

  @Get('lecturers')
  async getLecturerList(): Promise<Lecturer[]> {
    this.logger.log('Fetching all lecturers');
    const lecturers = await this.supervisorsService.getLecturerList();
    this.logger.log(`Fetched ${lecturers.length} lecturers`);

    return lecturers;
  }

  @Get(':supervisorId/projects/archive')
  async getProjectArchive(
    @Param('supervisorId') supervisorId: string,
  ): Promise<Project[]> {
    this.logger.log(
      `Fetching project archive for supervisor with ID: ${supervisorId}`,
    );
    const projects =
      await this.supervisorsService.getProjectArchive(supervisorId);
    this.logger.log(`Fetched ${projects.length} projects`);

    return projects;
  }

  @Get(':id/vivas')
  async getVivaDetails(@Param('id') supervisorId: string): Promise<Viva[]> {
    this.logger.log(`Fetching vivas for supervisor with ID: ${supervisorId}`);
    const vivas = await this.supervisorsService.getAssignedVivas(supervisorId);
    this.logger.log(`Fetched ${vivas.length} vivas`);

    return vivas;
  }
}
