import { User } from '@prisma/client';
import { Token } from './token.model';

export class Auth extends Token {
  user: User;

  constructor(accessToken: string, refreshToken: string, user: User) {
    super(accessToken, refreshToken);
    this.user = user;
  }
}
