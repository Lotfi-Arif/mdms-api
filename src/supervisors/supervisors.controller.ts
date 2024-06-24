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
  User,
} from '@prisma/client';

@Controller('supervisors')
export class SupervisorsController {
  constructor(private readonly supervisorsService: SupervisorsService) {}

  @Post(':lecturerId')
  create(@Param('lecturerId') lecturerId: string): Promise<Supervisor> {
    return this.supervisorsService.makeLecturerSupervisor(lecturerId);
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

  @Get(':supervisorId')
  getAssignedStudents(
    @Param('supervisorId') supervisorId: string,
  ): Promise<User[]> {
    return this.supervisorsService.getAssignedStudents(supervisorId);
  }

  @Get(':supervisorId/student-progress/:id')
  getStudentProgress(
    @Param('id') studentId: string,
    @Param('supervisorId') supervisorId: string,
  ): Promise<{ studentId: string; progress: number }[]> {
    return this.supervisorsService.getStudentProgressBar(
      supervisorId,
      studentId,
    );
  }

  @Get('submissions/:studentId')
  getStudentSubmissions(@Param('studentId') studentId: string): Promise<
    | Submission[]
    | {
        errorType: string;
        message: string;
      }
  > {
    return this.supervisorsService.getStudentSubmissions(studentId);
  }

  @Get(':id/submissions')
  getSubmissions(@Param('id') studentId: string): Promise<Submission[]> {
    return this.supervisorsService.getSubmissions(studentId);
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
