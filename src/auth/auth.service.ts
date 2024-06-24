import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FirebaseService } from '../firebase/firebase.service';
import { PrismaService } from 'nestjs-prisma';
import { JwtPayload, LoginResponse, FirebaseUser } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly firebaseService: FirebaseService,
    private readonly prisma: PrismaService,
  ) {}

  async validateFirebaseToken(idToken: string): Promise<FirebaseUser> {
    try {
      const decodedToken = await this.firebaseService.verifyToken(idToken);
      const user = await this.prisma.user.findUnique({
        where: { email: decodedToken.email },
        select: { id: true, email: true },
      });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return {
        uid: user.id,
        email: user.email,
        email_verified: true,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async login(user: FirebaseUser): Promise<LoginResponse> {
    const payload: JwtPayload = { username: user.email, sub: user.uid };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
