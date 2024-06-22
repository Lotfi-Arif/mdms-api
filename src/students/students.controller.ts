import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import {
  Student,
  Submission,
  Project,
  Viva,
  Prisma,
  Lecturer,
} from '@prisma/client';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  create(@Body() studentData: Prisma.StudentCreateInput): Promise<Student> {
    return this.studentsService.createStudent(studentData);
  }

  @Get()
  findAll(): Promise<Student[]> {
    return this.studentsService.getAllStudents();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Student | null> {
    return this.studentsService.getStudentById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() studentData: Prisma.StudentUpdateInput,
  ): Promise<Student> {
    return this.studentsService.updateStudent(id, studentData);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Student> {
    return this.studentsService.deleteStudent(id);
  }

  @Get(':id/progress')
  getStudentProgress(@Param('id') studentId: string): Promise<number> {
    return this.studentsService.getStudentProgress(studentId);
  }

  @Post(':id/submissions')
  createSubmission(
    @Param('id') studentId: string,
    @Body() submissionData: { title: string; content: string },
  ): Promise<Submission> {
    return this.studentsService.createSubmission(
      studentId,
      submissionData.title,
      submissionData.content,
    );
  }

  @Get('lecturers')
  getLecturerList(): Promise<Lecturer[]> {
    return this.studentsService.getLecturerList();
  }

  @Get('projects/archive')
  getProjectArchive(): Promise<Project[]> {
    return this.studentsService.getProjectArchive();
  }

  @Get(':id/viva')
  getVivaDetails(@Param('id') studentId: string): Promise<Viva | null> {
    return this.studentsService.getVivaDetails(studentId);
  }
}
