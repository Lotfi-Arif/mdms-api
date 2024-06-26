import { Injectable, Logger } from '@nestjs/common';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(private prisma: PrismaService) {}

  async getUserById(userId: string) {
    try {
      this.logger.log(`Fetching user with id: ${userId}`);
      const user = await clerkClient.users.getUser(userId);
      return user;
    } catch (error) {
      this.logger.error('Error fetching user from Clerk:', error);
      throw new Error('Error fetching user');
    }
  }

  async getUserList() {
    try {
      this.logger.debug('Fetching users');
      const users = await clerkClient.users.getUserList();
      this.logger.debug(`Fetched ${users.data.length} users`);
      return users;
    } catch (error) {
      this.logger.error('Error fetching users from Clerk:', error);
      throw new Error('Error fetching users');
    }
  }

  async createUser(userDetails: {
    clerkId: string;
    email: string;
    name: string;
    universityId: string;
    role: string;
  }) {
    const { clerkId, email, name, universityId, role } = userDetails;

    // Create user in local database
    const localUser = await this.prisma.user.create({
      data: {
        email,
        name,
        clerkId,
        [role]: {
          create: {
            ...(role === 'lecturer'
              ? { staffNumber: universityId }
              : { matricNumber: universityId }),
          },
        },
      },
    });

    return localUser;
  }

  async deleteUser(userId: string) {
    try {
      await clerkClient.users.deleteUser(userId);
    } catch (error) {
      console.error('Error deleting user in Clerk:', error);
      throw new Error('Error deleting user');
    }
  }
}
