import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { SupervisorsModule } from './supervisors/supervisors.module';
import { ExaminersModule } from './examiners/examiners.module';
import { PrismaModule, loggingMiddleware } from 'nestjs-prisma';
import { providePrismaClientExceptionFilter } from 'nestjs-prisma';
import { PRISMA_ERROR_MAP } from './constants';
import { FirebaseService } from './firebase/firebase.service';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    UsersModule,
    StudentsModule,
    SupervisorsModule,
    ExaminersModule,
    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        middlewares: [loggingMiddleware()],
      },
    }),
    FirebaseModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    providePrismaClientExceptionFilter(PRISMA_ERROR_MAP),
    FirebaseService,
  ],
})
export class AppModule {}
