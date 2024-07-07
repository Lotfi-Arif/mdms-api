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

    // Create submissions (only for students)
    const submissions = await Promise.all(
      students.map((student) =>
        prisma.submission.create({
          data: {
            title: `Submission by ${student.firstName} ${student.lastName}`,
            content: `Content of submission by ${student.firstName} ${student.lastName}`,
            student: { connect: { userId: student.id } },
          },
        }),
      ),
    );

    console.log(
      'Submissions created:',
      submissions.map((s) => s.title),
    );

    // Create nominations (only for lecturers)
    const lecturerRecords = await prisma.lecturer.findMany();
    const nominations = await Promise.all(
      lecturerRecords.map((lecturer) =>
        prisma.nomination.create({
          data: {
            details: `Nomination for ${lecturer.staffNumber}`,
            lecturer: { connect: { id: lecturer.id } },
          },
        }),
      ),
    );

    console.log('Nominations created:', nominations.length);

    // Accept some nominations randomly
    await Promise.all(
      nominations.map((nomination) =>
        Math.random() > 0.5
          ? prisma.nomination.update({
              where: { id: nomination.id },
              data: { accepted: true },
            })
          : Promise.resolve(),
      ),
    );

    console.log('Some nominations randomly accepted');

    // Create vivas (only for students)
    const vivas = await Promise.all(
      students.map((student) =>
        prisma.viva.create({
          data: {
            topic: `Viva for ${student.firstName} ${student.lastName}`,
            student: { connect: { userId: student.id } },
            vivaDate: new Date(
              Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000,
            ), // Random date within next 30 days
          },
        }),
      ),
    );

    console.log('Vivas created:', vivas.length);

    // Assign examiners to vivas
    const examiners = await prisma.examiner.findMany();
    await Promise.all(
      vivas.map((viva) =>
        prisma.viva.update({
          where: { id: viva.id },
          data: {
            examiners: {
              connect: examiners.slice(0, 2).map((e) => ({ id: e.id })), // Assign first two examiners to each viva
            },
          },
        }),
      ),
    );

    console.log('Examiners assigned to vivas');

    // Create projects (only for students)
    await Promise.all(
      students.map((student, index) =>
        prisma.project.create({
          data: {
            projectType: index % 2 === 0 ? 'Development' : 'Research',
            subjectArea: index % 2 === 0 ? 'SECR' : 'SECJ',
            title: `Project by ${student.firstName} ${student.lastName}`,
            student: { connect: { userId: student.id } },
            viva: { connect: { id: vivas[index].id } },
          },
        }),
      ),
    );

    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
