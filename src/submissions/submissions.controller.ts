import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { Submission, Prisma } from '@prisma/client';

@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  create(
    @Body() submissionData: Prisma.SubmissionCreateInput,
  ): Promise<Submission> {
    return this.submissionsService.createSubmission(submissionData);
  }

  @Get()
  findAll(): Promise<Submission[]> {
    return this.submissionsService.findAllSubmissions();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Submission> {
    return this.submissionsService.findOneSubmission(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() submissionData: Prisma.SubmissionUpdateInput,
  ): Promise<Submission> {
    return this.submissionsService.updateSubmission(id, submissionData);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Submission> {
    return this.submissionsService.deleteSubmission(id);
  }
}
