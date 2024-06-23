import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SupervisorsService } from './supervisors.service';
import {
  Supervisor,
  Submission,
  Viva,
  Nomination,
  Prisma,
  Project,
  Lecturer,
} from '@prisma/client';

@Controller('supervisors')
export class SupervisorsController {
  constructor(private readonly supervisorsService: SupervisorsService) {}

  @Post()
  create(
    @Body() supervisorData: Prisma.SupervisorCreateInput,
  ): Promise<Supervisor> {
    return this.supervisorsService.createSupervisor(supervisorData);
  }

  @Get()
  findAll(): Promise<Supervisor[]> {
    return this.supervisorsService.getAllSupervisors();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Supervisor | null> {
    return this.supervisorsService.getSupervisorById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateData: Prisma.SupervisorUpdateInput,
  ): Promise<Supervisor> {
    return this.supervisorsService.updateSupervisor(id, updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Supervisor> {
    return this.supervisorsService.deleteSupervisor(id);
  }

  @Get(':id/student-progress')
  getStudentProgress(
    @Param('id') supervisorId: string,
  ): Promise<{ studentId: string; progress: number }[]> {
    return this.supervisorsService.getStudentProgressBar(supervisorId);
  }

  @Get(':id/submissions')
  getSubmissions(@Param('id') supervisorId: string): Promise<Submission[]> {
    return this.supervisorsService.getSubmissions(supervisorId);
  }

  @Post(':id/nominate')
  nominateExaminer(
    @Param('id') examinerId: string,
    @Body() nominationData: { details: string },
  ): Promise<Nomination> {
    return this.supervisorsService.nominateExaminer(
      examinerId,
      nominationData.details,
    );
  }

  @Get('lecturers')
  getLecturerList(): Promise<Lecturer[]> {
    return this.supervisorsService.getLecturerList();
  }

  @Get(':supervisorId/projects/archive')
  getProjectArchive(
    @Param('supervisorId') supervisorId: string,
  ): Promise<Project[]> {
    return this.supervisorsService.getProjectArchive(supervisorId);
  }

  @Get(':id/vivas')
  getVivaDetails(@Param('id') supervisorId: string): Promise<Viva[]> {
    return this.supervisorsService.getAssignedVivas(supervisorId);
  }
}
