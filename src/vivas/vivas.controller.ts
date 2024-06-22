import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { VivasService } from './vivas.service';
import { Prisma, Viva } from '@prisma/client';

@Controller('vivas')
export class VivasController {
  constructor(private readonly vivasService: VivasService) {}

  @Post()
  create(@Body() vivaData: Prisma.VivaCreateInput): Promise<Viva> {
    return this.vivasService.createViva(vivaData);
  }

  @Get()
  findAll(): Promise<Viva[]> {
    return this.vivasService.findAllVivas();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Viva> {
    return this.vivasService.findOneViva(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() vivaData: Prisma.VivaUpdateInput,
  ): Promise<Viva> {
    return this.vivasService.updateViva(id, vivaData);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<Viva> {
    return this.vivasService.deleteViva(id);
  }
}
