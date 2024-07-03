import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { PrismaModule } from 'nestjs-prisma';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';

@Module({
  imports: [PrismaModule],
  controllers: [StudentsController],
  providers: [StudentsService, CaslAbilityFactory],
})
export class StudentsModule {}
