import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Patch,
  Delete,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { ExaminersService } from './examiners.service';
import {
  Examiner,
  Nomination,
  Viva,
  Lecturer,
  Project,
  Prisma,
} from '@prisma/client';
import { PoliciesGuard } from 'src/casl/policies.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CheckPolicies } from 'src/casl/check-policies.decorator';
import { AppAbility } from 'src/casl/casl-ability.factory';

@Controller('examiners')
@UseGuards(JwtAuthGuard, PoliciesGuard)
export class ExaminersController {
  private readonly logger = new Logger(ExaminersController.name);

  constructor(private readonly examinersService: ExaminersService) {}

  @Get()
  @CheckPolicies((ability: AppAbility) => ability.can('read', 'Examiner'))
  async findAllExaminers(): Promise<Examiner[]> {
    this.logger.log('Fetching all examiners');
    const examiners = await this.examinersService.findAllExaminers();
    this.logger.log(`Fetched ${examiners.length} examiners`);

    return examiners;
  }

  @Get(':id')
  @CheckPolicies((ability: AppAbility) => ability.can('read', 'Examiner'))
  async findOneExaminer(@Param('id') id: string): Promise<Examiner | null> {
    this.logger.log(`Fetching examiner with id: ${id}`);
    const examiner = await this.examinersService.findOneExaminer(id);
    this.logger.log(`Fetched examiner: ${JSON.stringify(examiner)}`);

    return examiner;
  }

  @Patch(':id')
  @CheckPolicies((ability: AppAbility) => ability.can('update', 'Examiner'))
  async updateExaminer(
    @Param('id') id: string,
    @Body() examinerData: Prisma.ExaminerUpdateInput,
  ): Promise<Examiner> {
    this.logger.log(`Updating examiner with id: ${id}`);
    const update = await this.examinersService.updateExaminer(id, examinerData);
    this.logger.log(`Updated examiner: ${JSON.stringify(update)}`);

    return update;
  }

  @Delete(':id')
  @CheckPolicies((ability: AppAbility) => ability.can('delete', 'Examiner'))
  async removeExaminer(@Param('id') id: string): Promise<{
    message: string;
    examiner: Examiner;
  }> {
    this.logger.log(`Deleting examiner with id: ${id}`);
    const deleted = await this.examinersService.deleteExaminer(id);
    this.logger.log(`Deleted examiner: ${JSON.stringify(deleted)}`);

    return deleted;
  }

  @Post(':id/accept-nomination')
  @CheckPolicies((ability: AppAbility) => ability.can('update', 'Nomination'))
  async acceptNomination(
    @Param('id') nominationId: string,
    @Body() vivaData: Prisma.VivaCreateInput,
  ): Promise<Nomination> {
    this.logger.log(`Accepting nomination with id: ${nominationId}`);
    const acceptNomination = await this.examinersService.acceptNomination(
      nominationId,
      vivaData,
    );
    this.logger.log(`Accepted nomination: ${JSON.stringify(acceptNomination)}`);

    return acceptNomination;
  }

  @Post(':id/reject-nomination')
  @CheckPolicies((ability: AppAbility) => ability.can('update', 'Nomination'))
  async rejectNomination(
    @Param('id') nominationId: string,
  ): Promise<Nomination> {
    this.logger.log(`Rejecting nomination with id: ${nominationId}`);
    const rejected = await this.examinersService.rejectNomination(nominationId);
    this.logger.log(`Rejected nomination: ${JSON.stringify(rejected)}`);

    return rejected;
  }

  @Get(':id/nominations')
  @CheckPolicies((ability: AppAbility) => ability.can('read', 'Nomination'))
  async getNominationRequests(
    @Param('id') examinerId: string,
  ): Promise<Nomination[]> {
    this.logger.log(`Fetching nomination requests for examiner: ${examinerId}`);
    const requests =
      await this.examinersService.getNominationRequests(examinerId);
    this.logger.log(`Fetched ${requests.length} nomination requests`);

    return requests;
  }

  @Post(':id/evaluate')
  @CheckPolicies(
    (ability: AppAbility) =>
      ability.can('update', 'Viva') && ability.can('update', 'Examiner'),
  )
  async evaluateStudent(
    @Param('id') vivaId: string,
    @Body('evaluation') evaluation: string,
    @Body('hasPassed') hasPassed: boolean,
  ): Promise<Viva> {
    this.logger.log(`Evaluating student with viva id: ${vivaId}`);
    const evaluateStudent = await this.examinersService.evaluateStudent(
      vivaId,
      evaluation,
      hasPassed,
    );
    this.logger.log(`Student evaluated: ${JSON.stringify(evaluateStudent)}`);

    return evaluateStudent;
  }

  @Get('lecturers')
  async getLecturerList(): Promise<Lecturer[]> {
    this.logger.log('Fetching all lecturers');
    const lecturers = await this.examinersService.getLecturerList();
    this.logger.log(`Fetched ${lecturers.length} lecturers`);

    return lecturers;
  }

  @Get('projects')
  async getProjectArchive(): Promise<Project[]> {
    this.logger.log('Fetching all projects');
    const projects = await this.examinersService.getProjectArchive();
    this.logger.log(`Fetched ${projects.length} projects`);

    return projects;
  }

  @Get(':id/vivas')
  async getVivaDetails(@Param('id') examinerId: string): Promise<Viva[]> {
    this.logger.log(`Fetching vivas for examiner: ${examinerId}`);
    const vivas = await this.examinersService.getVivaDetails(examinerId);
    this.logger.log(`Fetched ${vivas.length} vivas`);

    return vivas;
  }
}
