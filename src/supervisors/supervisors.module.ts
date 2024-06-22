import { Module } from '@nestjs/common';
import { SupervisorsService } from './supervisors.service';
import { SupervisorsController } from './supervisors.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [SupervisorsController],
  providers: [SupervisorsService, PrismaService],
})
export class SupervisorsModule {}
