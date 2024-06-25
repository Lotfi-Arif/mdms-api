export interface JwtPayload {
  username: string;
  sub: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface FirebaseUser {
  uid: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
}

export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
}

export interface RegisterUserDto {
  email: string;
  name: string;
  password: string;
  universityId: string;
  role?: 'student' | 'lecturer' | 'supervisor' | 'examiner';
}
