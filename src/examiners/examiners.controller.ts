import { Controller, Post, Get, Param, Body, Patch } from '@nestjs/common';
import { ExaminersService } from './examiners.service';
import {
  Examiner,
  Nomination,
  Viva,
  Lecturer,
  Project,
  Prisma,
} from '@prisma/client';

@Controller('examiners')
export class ExaminersController {
  constructor(private readonly examinersService: ExaminersService) {}

  @Get()
  findAllExaminers(): Promise<Examiner[]> {
    return this.examinersService.findAllExaminers();
  }

  @Get(':id')
  findOneExaminer(@Param('id') id: string): Promise<Examiner | null> {
    return this.examinersService.findOneExaminer(id);
  }

  @Patch(':id')
  updateExaminer(
    @Param('id') id: string,
    @Body() examinerData: Prisma.ExaminerUpdateInput,
  ): Promise<Examiner> {
    return this.examinersService.updateExaminer(id, examinerData);
  }

  @Post(':id/accept-nomination')
  acceptNomination(
    @Param('id') nominationId: string,
    @Body() vivaData: Prisma.VivaCreateInput,
  ): Promise<Nomination> {
    return this.examinersService.acceptNomination(nominationId, vivaData);
  }

  @Post(':id/reject-nomination')
  rejectNomination(@Param('id') nominationId: string): Promise<Nomination> {
    return this.examinersService.rejectNomination(nominationId);
  }

  @Get(':id/nominations')
  getNominationRequests(
    @Param('id') examinerId: string,
  ): Promise<Nomination[]> {
    return this.examinersService.getNominationRequests(examinerId);
  }

  @Post(':id/evaluate')
  evaluateStudent(
    @Param('id') vivaId: string,
    @Body('evaluation') evaluation: string,
  ): Promise<Viva> {
    return this.examinersService.evaluateStudent(vivaId, evaluation);
  }

  @Get('lecturers')
  getLecturerList(): Promise<Lecturer[]> {
    return this.examinersService.getLecturerList();
  }

  @Get('projects')
  getProjectArchive(): Promise<Project[]> {
    return this.examinersService.getProjectArchive();
  }

  @Get(':id/vivas')
  getVivaDetails(@Param('id') examinerId: string): Promise<Viva[]> {
    return this.examinersService.getVivaDetails(examinerId);
  }
}
