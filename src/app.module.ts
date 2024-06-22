import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma/prisma.service';
import { StudentsModule } from './students/students.module';
import { SupervisorsModule } from './supervisors/supervisors.module';

@Module({
  imports: [UsersModule, StudentsModule, SupervisorsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
