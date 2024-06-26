import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('user/:id')
  async getUserById(@Param('id') id: string) {
    return this.authService.getUserById(id);
  }

  @Get('users')
  async getUserList() {
    return this.authService.getUserList();
  }

  @Post('user')
  async createUser(
    @Body()
    userDetails: {
      clerkId: string;
      email: string;
      name: string;
      universityId: string;
      role: string;
    },
  ) {
    return this.authService.createUser(userDetails);
  }

  @Delete('user/:id')
  async deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(id);
  }
}
