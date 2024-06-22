import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ExaminersService } from './examiners.service';
import { Examiner, Prisma } from '@prisma/client';

@Controller('examiners')
export class ExaminersController {
  constructor(private readonly examinersService: ExaminersService) {}

  @Post()
  create(@Body() examinerData: Prisma.ExaminerCreateInput): Promise<Examiner> {
    return this.examinersService.createExaminer(examinerData);
  }

  @Get()
  findAll(): Promise<Examiner[]> {
    return this.examinersService.findAllExaminers();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Examiner> {
    return this.examinersService.findOneExaminer(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() examinerData: Prisma.ExaminerUpdateInput,
  ): Promise<Examiner> {
    return this.examinersService.updateExaminer(id, examinerData);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Examiner> {
    return this.examinersService.deleteExaminer(id);
  }
}
