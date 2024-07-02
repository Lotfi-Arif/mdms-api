import { PrismaClient, User, Student, Lecturer } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

type UserWithRole = User & {
  student: Student | null;
  lecturer: Lecturer | null;
};

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

async function main() {
  try {
    // Cleanup existing data
    await prisma.nomination.deleteMany();
    await prisma.project.deleteMany();
    await prisma.viva.deleteMany();
    await prisma.submission.deleteMany();
    await prisma.examiner.deleteMany();
    await prisma.supervisor.deleteMany();
    await prisma.student.deleteMany();
    await prisma.lecturer.deleteMany();
    await prisma.user.deleteMany();

    console.log('Existing data cleaned up.');

    const hashedPassword = await hashPassword('password');

    // Create students
    const students = await Promise.all([
      prisma.user.create({
        data: {
          email: 'student1@example.com',
          firstName: 'Student',
          lastName: 'One',
          password: hashedPassword,
          student: { create: { matricNumber: 'A18CS4043' } },
        },
        include: { student: true },
      }),
      prisma.user.create({
        data: {
          email: 'student2@example.com',
          firstName: 'Student',
          lastName: 'Two',
          password: hashedPassword,
          student: { create: { matricNumber: 'A19CS4044' } },
        },
        include: { student: true },
      }),
    ]);

    // Create lecturers (including supervisors and examiners)
    const lecturers = await Promise.all([
      prisma.user.create({
        data: {
          email: 'lecturer1@example.com',
          firstName: 'Lecturer',
          lastName: 'One',
          password: hashedPassword,
          lecturer: { create: { staffNumber: 'STAFF001' } },
        },
        include: { lecturer: true },
      }),
      prisma.user.create({
        data: {
          email: 'supervisor1@example.com',
          firstName: 'Supervisor',
          lastName: 'One',
          password: hashedPassword,
          lecturer: {
            create: {
              staffNumber: 'STAFF002',
              supervisor: { create: {} },
            },
          },
        },
        include: { lecturer: { include: { supervisor: true } } },
      }),
      prisma.user.create({
        data: {
          email: 'examiner1@example.com',
          firstName: 'Examiner',
          lastName: 'One',
          password: hashedPassword,
          lecturer: {
            create: {
              staffNumber: 'STAFF003',
              examiner: { create: {} },
            },
          },
        },
        include: { lecturer: { include: { examiner: true } } },
      }),
      prisma.user.create({
        data: {
          email: 'superexaminer@example.com',
          firstName: 'Super',
          lastName: 'Examiner',
          password: hashedPassword,
          lecturer: {
            create: {
              staffNumber: 'STAFF004',
              supervisor: { create: {} },
              examiner: { create: {} },
            },
          },
        },
        include: {
          lecturer: { include: { supervisor: true, examiner: true } },
        },
      }),
    ]);

    const users: UserWithRole[] = [
      ...students.map((s) => ({ ...s, lecturer: null })),
      ...lecturers.map((l) => ({ ...l, student: null })),
    ];

    console.log(
      'Users created:',
      users.map((u) => u.email),
    );

    // The rest of your script remains unchanged
    // ... (submissions, nominations, vivas, projects creation)

    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
