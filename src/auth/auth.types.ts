import { User } from '@prisma/client';

// Interface for the JWT payload
export interface JwtPayload {
  username: string; // Changed from email to username
  sub: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

// Interface for the login response
export interface LoginResponse {
  access_token: string;
}

// Type for the user without the password
export type UserWithoutPassword = Omit<User, 'password'>;
