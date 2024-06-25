import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { FirebaseUser, LoginResponse, RegisterUserDto } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body('idToken') idToken: string): Promise<LoginResponse> {
    const user = await this.authService.validateFirebaseToken(idToken);
    return this.authService.login(user);
  }

  @Post('register')
  async register(
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<LoginResponse> {
    return this.authService.register(registerUserDto);
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('protected')
  getProtectedData(@Request() req): FirebaseUser {
    return req.user;
  }
}
