import { Module } from '@nestjs/common';
import { VivasService } from './vivas.service';
import { VivasController } from './vivas.controller';
import { PrismaModule } from 'nestjs-prisma';

@Module({
  imports: [PrismaModule],
  controllers: [VivasController],
  providers: [VivasService],
})
export class VivasModule {}
