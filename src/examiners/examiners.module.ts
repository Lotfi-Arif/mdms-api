import { Module } from '@nestjs/common';
import { ExaminersService } from './examiners.service';
import { ExaminersController } from './examiners.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ExaminersController],
  providers: [ExaminersService, PrismaService],
})
export class ExaminersModule {}
