import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Token } from './models/token.model';
import { CreateUserDto, LoginDto, RefreshTokenDto } from './dto';
import { User } from '@prisma/client';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto): Promise<Token> {
    return this.authService.createUser(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<Token> {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<Token> {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  async validateUser(@Param('id') id: string): Promise<User> {
    return this.authService.validateUser(id);
  }
}
