import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  CanActivate,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { clerkClient } from '@clerk/clerk-sdk-node';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies.__session;
    if (!token) {
      this.logger.error('No token found in request');
      throw new UnauthorizedException();
    }

    try {
      await clerkClient.verifyToken(token);
    } catch (error) {
      this.logger.error('Error verifying token:', error);
      throw new UnauthorizedException();
    }
    return true;
  }
}
