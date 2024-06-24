import { Controller, Post, Body, Param, Get, Delete } from '@nestjs/common';
import { StudentsService } from './students.service';
import { Lecturer, Project, Submission, Viva } from '@prisma/client';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get(':id/progress')
  getStudentProgress(@Param('id') studentId: string): Promise<number> {
    return this.studentsService.getStudentProgress(studentId);
  }

  @Post(':id/submissions')
  addStudentSubmission(
    @Param('id') studentId: string,
    @Body('title') title: string,
    @Body('content') content: string,
  ): Promise<Submission> {
    return this.studentsService.addStudentSubmission(studentId, title, content);
  }

  @Delete(':id')
  deleteStudentSubmission(
    @Param('id') submissionId: string,
  ): Promise<Submission> {
    return this.studentsService.deleteStudentSubmission(submissionId);
  }

  @Get('lecturers')
  getLecturerList(): Promise<Lecturer[]> {
    return this.studentsService.getLecturerList();
  }

  @Get('projects')
  getProjectArchive(): Promise<Project[]> {
    return this.studentsService.getProjectArchive();
  }

  @Get(':id/viva-details')
  getVivaDetails(@Param('id') studentId: string): Promise<Viva | null> {
    return this.studentsService.getVivaDetails(studentId);
  }
}
