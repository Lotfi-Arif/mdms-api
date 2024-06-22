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
import { Supervisor, Prisma } from '@prisma/client';

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
}
