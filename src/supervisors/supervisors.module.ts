import { Module } from '@nestjs/common';
import { SupervisorsService } from './supervisors.service';
import { SupervisorsController } from './supervisors.controller';
import { PrismaModule } from 'nestjs-prisma';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';

@Module({
  imports: [PrismaModule],
  controllers: [SupervisorsController],
  providers: [SupervisorsService, CaslAbilityFactory],
})
export class SupervisorsModule {}
