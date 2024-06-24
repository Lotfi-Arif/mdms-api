import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { FirebaseUser, LoginResponse } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body('idToken') idToken: string): Promise<LoginResponse> {
    const user = await this.authService.validateFirebaseToken(idToken);
    return this.authService.login(user);
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('protected')
  getProtectedData(@Request() req): FirebaseUser {
    return req.user;
  }
}
