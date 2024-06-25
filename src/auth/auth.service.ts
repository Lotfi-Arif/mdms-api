// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  Logger,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'nestjs-prisma';
import * as bcrypt from 'bcrypt';
import * as admin from 'firebase-admin';
import {
  JwtPayload,
  LoginResponse,
  RegisterUserDto,
  FirebaseUser,
} from './auth.types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async validateFirebaseToken(idToken: string): Promise<FirebaseUser> {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      return {
        email_verified: decodedToken.email_verified,
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
      };
    } catch (error) {
      this.logger.error('Error validating Firebase token', error);
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }

  async register(registerUserDto: RegisterUserDto): Promise<LoginResponse> {
    const { email, password, name } = registerUserDto;

    // First, hash the password for local storage
    const hashedPassword = await bcrypt.hash(password, 10);

    // Then, prepare the user data for local storage (temporarily hold it)
    const userData = {
      email,
      password: hashedPassword,
      name,
      uid: null, // Placeholder for Firebase UID, to be updated
    };

    // Check if the email already exists in Firebase
    try {
      const existingUser = await admin.auth().getUserByEmail(email);
      if (existingUser) {
        throw new ConflictException(
          'The email address is already in use by another account.',
        );
      }
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        this.logger.error('Failed to check user existence in Firebase', error);
        throw new InternalServerErrorException(
          'Failed to check user existence.',
        );
      }
    }

    // Now attempt to store user in the local database before creating in Firebase
    let user;
    try {
      user = await this.prisma.user.create({
        data: {
          ...userData,
          [registerUserDto.role]: {
            create: {
              ...(registerUserDto.role === 'lecturer'
                ? { staffNumber: registerUserDto.universityId }
                : { matricNumber: registerUserDto.universityId }),
            },
          },
        },
      });
    } catch (dbError) {
      this.logger.error('Failed to create user in the local database', dbError);
      throw new InternalServerErrorException('Failed to create user locally.');
    }

    // If local db creation was successful, proceed to create user in Firebase
    try {
      const firebaseUser = await admin.auth().createUser({
        email,
        password,
      });
      // Update the local database with Firebase UID
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { uid: firebaseUser.uid },
      });
    } catch (firebaseError) {
      // If Firebase user creation fails, optionally clean up the local database
      await this.prisma.user.delete({ where: { id: user.id } });
      this.logger.error('Failed to create user in Firebase', firebaseError);
      throw new InternalServerErrorException(
        'Failed to create user in Firebase.',
      );
    }

    // Generate JWT token
    const payload: JwtPayload = { username: user.email, sub: user.uid };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async login(idToken: string): Promise<LoginResponse> {
    try {
      // Verify the ID token directly with Firebase Admin SDK
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;

      // Optionally, retrieve additional user details from your local database
      const user = await this.prisma.user.findUnique({
        where: {
          uid,
          id: uid,
        },
        select: { email: true, uid: true }, // Customize based on stored user data
      });

      if (!user) {
        throw new UnauthorizedException('User not found in local database');
      }

      // Generate JWT token for session management in your application
      const payload: JwtPayload = { username: user.email, sub: user.uid };
      return {
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      // Handle errors from Firebase or local database issues
      if (
        error.code === 'auth/id-token-expired' ||
        error.code === 'auth/id-token-revoked'
      ) {
        throw new UnauthorizedException('Session expired');
      } else {
        console.error('Authentication error:', error);
        throw new UnauthorizedException('Authentication failed');
      }
    }
  }
}
