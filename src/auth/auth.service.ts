import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FirebaseService } from '../firebase/firebase.service';
import { PrismaService } from 'nestjs-prisma';
import {
  JwtPayload,
  LoginResponse,
  FirebaseUser,
  RegisterUserDto,
} from './auth.types';
import * as bcrypt from 'bcrypt';
import * as admin from 'firebase-admin';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly firebaseService: FirebaseService,
    private readonly prisma: PrismaService,
  ) {}

  async validateFirebaseToken(idToken: string): Promise<FirebaseUser> {
    try {
      this.logger.debug('Validating Firebase token');
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      this.logger.debug('Decoded Firebase token', decodedToken);
      const user = await this.prisma.user.findUnique({
        where: { email: decodedToken.email },
        select: { id: true, email: true },
      });
      this.logger.debug('User found', user);

      if (!user) {
        this.logger.error('User not found');
        throw new UnauthorizedException('User not found');
      }

      return {
        uid: user.id,
        email: user.email,
        email_verified: true,
      };
    } catch (error) {
      this.logger.error('Invalid token', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  async login(user: FirebaseUser): Promise<LoginResponse> {
    this.logger.debug('Logging in user', user);
    const payload: JwtPayload = { username: user.email, sub: user.uid };
    this.logger.debug('Generated JWT payload', payload);
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerUserDto: RegisterUserDto): Promise<LoginResponse> {
    this.logger.debug('Registering user', registerUserDto);

    // Create user in Firebase
    const firebaseUser = await admin.auth().createUser({
      email: registerUserDto.email,
      password: registerUserDto.password,
      displayName: registerUserDto.name,
    });

    this.logger.debug('Firebase user created', firebaseUser);

    // Hash the password for local storage
    const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);

    // Determine role and create corresponding records
    let user;
    if (registerUserDto.role === 'lecturer') {
      this.logger.debug('Registering lecturer');
      user = await this.prisma.user.create({
        data: {
          email: registerUserDto.email,
          name: registerUserDto.name,
          password: hashedPassword,
          uid: firebaseUser.uid,
          emailVerified: firebaseUser.emailVerified,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          phoneNumber: firebaseUser.phoneNumber,
          disabled: firebaseUser.disabled,
          lecturer: {
            create: {
              staffNumber: registerUserDto.universityId,
            },
          },
        },
      });

      this.logger.debug('Lecturer created', user);
    }
    // Register student if role is not specified or is student
    this.logger.debug('Registering student');
    user = await this.prisma.user.create({
      data: {
        email: registerUserDto.email,
        name: registerUserDto.name,
        password: hashedPassword,
        uid: firebaseUser.uid,
        emailVerified: firebaseUser.emailVerified,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        phoneNumber: firebaseUser.phoneNumber,
        disabled: firebaseUser.disabled,
        student: {
          create: {
            matricNumber: registerUserDto.universityId,
          },
        },
      },
    });

    this.logger.debug('Student created', user);

    const payload: JwtPayload = { username: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
