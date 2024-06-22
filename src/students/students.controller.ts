import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { Student, Prisma } from '@prisma/client';

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
    @Body() updateData: Prisma.StudentUpdateInput,
  ): Promise<Student> {
    return this.studentsService.updateStudent(id, updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Student> {
    return this.studentsService.deleteStudent(id);
  }
}
