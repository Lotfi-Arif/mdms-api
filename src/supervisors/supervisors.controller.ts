import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  UseGuards,
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
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PoliciesGuard } from 'src/casl/policies.guard';
import { CheckPolicies } from 'src/casl/check-policies.decorator';
import { AppAbility } from 'src/casl/casl-ability.factory';

@Controller('supervisors')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class SupervisorsController {
  private readonly logger = new Logger(SupervisorsController.name);
  constructor(private readonly supervisorsService: SupervisorsService) {}

  @Post(':lecturerId')
  @CheckPolicies((ability: AppAbility) => ability.can('create', 'Supervisor'))
  async create(@Param('lecturerId') lecturerId: string): Promise<Supervisor> {
    this.logger.log(`Creating supervisor for lecturer with ID: ${lecturerId}`);
    const supervisor =
      await this.supervisorsService.makeLecturerSupervisor(lecturerId);
    this.logger.log(`Created supervisor: ${JSON.stringify(supervisor)}`);

    return supervisor;
  }

  @Get()
  @CheckPolicies((ability: AppAbility) => ability.can('read', 'Supervisor'))
  async findAll(): Promise<Supervisor[]> {
    this.logger.log('Fetching all supervisors');
    const supervisors = await this.supervisorsService.getAllSupervisors();
    this.logger.log(`Fetched ${supervisors.length} supervisors`);

    return supervisors;
  }

  @Get(':id')
  @CheckPolicies((ability: AppAbility) => ability.can('read', 'Supervisor'))
  async findOne(@Param('id') id: string): Promise<Supervisor | null> {
    this.logger.log(`Fetching supervisor with ID: ${id}`);
    const supervisor = await this.supervisorsService.getSupervisorById(id);
    this.logger.log(`Fetched supervisor: ${JSON.stringify(supervisor)}`);

    return supervisor;
  }

  @Patch(':id')
  @CheckPolicies((ability: AppAbility) => ability.can('update', 'Supervisor'))
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
  @CheckPolicies((ability: AppAbility) => ability.can('delete', 'Supervisor'))
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
  @CheckPolicies((ability: AppAbility) => ability.can('read', 'Student'))
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
  @CheckPolicies(
    (ability: AppAbility) =>
      ability.can('read', 'Student') && ability.can('read', 'Submission'),
  )
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
  @CheckPolicies(
    (ability: AppAbility) =>
      ability.can('read', 'Submission') && ability.can('read', 'Student'),
  )
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
  @CheckPolicies(
    (ability: AppAbility) =>
      ability.can('read', 'Submission') && ability.can('read', 'Student'),
  )
  async getSubmissions(@Param('id') studentId: string): Promise<Submission[]> {
    this.logger.log(`Fetching submissions for student with ID: ${studentId}`);
    const submissions = await this.supervisorsService.getSubmissions(studentId);
    this.logger.log(`Fetched ${submissions.length} submissions`);

    return submissions;
  }

  @Post(':id/nominate')
  @CheckPolicies((ability: AppAbility) => ability.can('create', 'Nomination'))
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
  @CheckPolicies((ability: AppAbility) => ability.can('read', 'Lecturer'))
  async getLecturerList(): Promise<Lecturer[]> {
    this.logger.log('Fetching all lecturers');
    const lecturers = await this.supervisorsService.getLecturerList();
    this.logger.log(`Fetched ${lecturers.length} lecturers`);

    return lecturers;
  }

  @Get(':supervisorId/projects/archive')
  @CheckPolicies(
    (ability: AppAbility) =>
      ability.can('update', 'Viva') &&
      ability.can('read', 'Submission') &&
      ability.can('create', 'Project'),
  )
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
  @CheckPolicies((ability: AppAbility) => ability.can('read', 'Viva'))
  async getVivaDetails(@Param('id') supervisorId: string): Promise<Viva[]> {
    this.logger.log(`Fetching vivas for supervisor with ID: ${supervisorId}`);
    const vivas = await this.supervisorsService.getAssignedVivas(supervisorId);
    this.logger.log(`Fetched ${vivas.length} vivas`);

    return vivas;
  }
}
