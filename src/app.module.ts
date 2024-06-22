import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma/prisma.service';
import { StudentsModule } from './students/students.module';
import { SupervisorsModule } from './supervisors/supervisors.module';
import { ExaminersModule } from './examiners/examiners.module';

@Module({
  imports: [UsersModule, StudentsModule, SupervisorsModule, ExaminersModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
