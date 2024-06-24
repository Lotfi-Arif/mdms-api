import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { SupervisorsModule } from './supervisors/supervisors.module';
import { ExaminersModule } from './examiners/examiners.module';
import { ProjectsModule } from './projects/projects.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { NominationsModule } from './nominations/nominations.module';
import { VivasModule } from './vivas/vivas.module';
import { PrismaModule } from 'nestjs-prisma';

@Module({
  imports: [
    UsersModule,
    StudentsModule,
    SupervisorsModule,
    ExaminersModule,
    ProjectsModule,
    SubmissionsModule,
    NominationsModule,
    VivasModule,
    PrismaModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
