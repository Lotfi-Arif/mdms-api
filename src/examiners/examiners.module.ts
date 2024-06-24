import { Module } from '@nestjs/common';
import { ExaminersService } from './examiners.service';
import { ExaminersController } from './examiners.controller';
import { PrismaModule } from 'nestjs-prisma';

@Module({
  imports: [PrismaModule],
  controllers: [ExaminersController],
  providers: [ExaminersService],
})
export class ExaminersModule {}
