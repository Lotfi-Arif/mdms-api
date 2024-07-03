import { Module } from '@nestjs/common';
import { ExaminersService } from './examiners.service';
import { ExaminersController } from './examiners.controller';
import { PrismaModule } from 'nestjs-prisma';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';

@Module({
  imports: [PrismaModule],
  controllers: [ExaminersController],
  providers: [ExaminersService, CaslAbilityFactory],
})
export class ExaminersModule {}
