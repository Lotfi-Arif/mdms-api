import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma/prisma.service';
import { StudentsModule } from './students/students.module';
import { SupervisorsModule } from './supervisors/supervisors.module';
import { ExaminersModule } from './examiners/examiners.module';
import { ProjectsModule } from './projects/projects.module';
import { SubmissionsModule } from './submissions/submissions.module';

@Module({
  imports: [UsersModule, StudentsModule, SupervisorsModule, ExaminersModule, ProjectsModule, SubmissionsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
