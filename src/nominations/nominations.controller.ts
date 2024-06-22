import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { NominationsService } from './nominations.service';
import { Prisma, Nomination } from '@prisma/client';

@Controller('nominations')
export class NominationsController {
  constructor(private readonly nominationsService: NominationsService) {}

  @Post()
  create(
    @Body() nominationData: Prisma.NominationCreateInput,
  ): Promise<Nomination> {
    return this.nominationsService.createNomination(nominationData);
  }

  @Get()
  findAll(): Promise<Nomination[]> {
    return this.nominationsService.findAllNominations();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Nomination> {
    return this.nominationsService.findOneNomination(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() nominationData: Prisma.NominationUpdateInput,
  ): Promise<Nomination> {
    return this.nominationsService.updateNomination(id, nominationData);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Nomination> {
    return this.nominationsService.deleteNomination(id);
  }
}
