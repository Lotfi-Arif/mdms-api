// auth.service.ts
import { Prisma, User } from '@prisma/client';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from './password.service';
import { Token } from './models/token.model';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
  ) {}

  async createUser(payload: {
    email: string;
    password: string;
    name: string;
    role: string;
    universityId: string;
  }): Promise<Token> {
    this.logger.debug(`Creating user with email: ${payload.email}`);
    const hashedPassword = await this.passwordService.hashPassword(
      payload.password,
    );

    try {
      this.logger.debug(`Creating user with email: ${payload.email}`);
      const user = await this.prisma.user.create({
        data: {
          firstName: payload.name,
          email: payload.email,
          password: hashedPassword,
          [payload.role]: {
            create: {
              [payload.role === 'student' ? 'matricNumber' : 'staffNumber']:
                payload.universityId,
            },
          },
        },
      });

      this.logger.debug(`User created with ID: ${user.id}`);

      const tokens = await this.generateTokens(user.id);

      this.logger.debug(`Generated tokens for user with ID: ${user.id}`);

      // Store refresh token in the database
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });

      this.logger.debug(`Stored refresh token for user with ID: ${user.id}`);

      return tokens;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException(`Email ${payload.email} already used.`);
      }
      throw new Error(e);
    }
  }

  async login(email: string, password: string): Promise<Token> {
    this.logger.debug(`Logging in user with email: ${email}`);

    const user = await this.prisma.user.findUnique({ where: { email } });

    this.logger.debug(`Found user with ID: ${user?.id}`);

    if (!user) {
      this.logger.debug(`No user found for email: ${email}`);
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    const passwordValid = await this.passwordService.validatePassword(
      password,
      user.password,
    );

    this.logger.debug(`Password valid: ${passwordValid}`);

    if (!passwordValid) {
      this.logger.debug(`Invalid password`);
      throw new BadRequestException('Invalid password');
    }

    const tokens = await this.generateTokens(user.id);

    this.logger.debug(`Generated tokens for user with ID: ${user.id}`);

    // Store refresh token in the database
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    this.logger.debug(`Stored refresh token for user with ID: ${user.id}`);

    return tokens;
  }

  async refreshToken(refreshToken: string): Promise<Token> {
    try {
      this.logger.debug(`Refreshing token`);
      const { userId } = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      this.logger.debug(`User ID from refresh token: ${userId}`);

      const user = await this.prisma.user.findUnique({ where: { id: userId } });

      this.logger.debug(`Found user with ID: ${user?.id}`);

      if (!user || user.refreshToken !== refreshToken) {
        this.logger.debug(`Invalid refresh token`);
        throw new UnauthorizedException();
      }

      const tokens = await this.generateTokens(user.id);

      this.logger.debug(`Generated tokens for user with ID: ${user.id}`);

      // Store new refresh token in the database
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });

      this.logger.debug(`Stored refresh token for user with ID: ${user.id}`);

      return tokens;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  async validateUser(userId: string): Promise<User> {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  async getUserFromToken(token: string): Promise<User> {
    const id = this.jwtService.decode(token)['userId'];
    return this.prisma.user.findUnique({ where: { id } });
  }

  private async generateTokens(userId: string): Promise<Token> {
    const payload = { userId };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async fetchUser(userId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: true,
        lecturer: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
  }

  async logout(userId: string): Promise<void> {
    this.logger.debug(`Logging out user with ID: ${userId}`);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }
}
