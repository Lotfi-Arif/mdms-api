import { Module } from '@nestjs/common';
import { VivasService } from './vivas.service';
import { VivasController } from './vivas.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [VivasController],
  providers: [VivasService, PrismaService],
})
export class VivasModule {}
