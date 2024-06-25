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
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    universityId: string;
    role: string;
  }) {
    const { email, password, firstName, universityId, lastName, role } =
      userDetails;

    // Start a transaction
    const transaction = await this.prisma.$transaction(async (prisma) => {
      // Create user in Clerk
      const clerkUser = await clerkClient.users.createUser({
        emailAddress: [email],
        password,
        firstName,
        lastName,
      });

      // Create user in local database
      const localUser = await prisma.user.create({
        data: {
          email,
          password,
          name: `${firstName} ${lastName}`,
          clerkId: clerkUser.id,
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
    });

    try {
      const user = await transaction;
      this.logger.log(`Successfully created user with email: ${email}`);
      return user;
    } catch (error) {
      this.logger.error('Error creating user:', error);
      throw new Error('Error creating user');
    }
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
