import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { PrismaModule } from 'nestjs-prisma';
import { CaslAbilityFactory } from 'src/casl/casl-ability.factory';

@Module({
  imports: [PrismaModule],
  providers: [FileUploadService, CaslAbilityFactory],
  controllers: [FileUploadController],
})
export class FileUploadModule {}
