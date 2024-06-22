import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Project, Prisma } from '@prisma/client';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() projectData: Prisma.ProjectCreateInput): Promise<Project> {
    return this.projectsService.createProject(projectData);
  }

  @Get()
  findAll(): Promise<Project[]> {
    return this.projectsService.findAllProjects();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Project> {
    return this.projectsService.findOneProject(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() projectData: Prisma.ProjectUpdateInput,
  ): Promise<Project> {
    return this.projectsService.updateProject(id, projectData);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Project> {
    return this.projectsService.deleteProject(id);
  }
}
