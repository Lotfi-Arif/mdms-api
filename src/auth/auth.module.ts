import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { FirebaseModule } from '../firebase/firebase.module';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60m' },
      }),
      inject: [ConfigService],
    }),
    FirebaseModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, FirebaseAuthGuard, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
