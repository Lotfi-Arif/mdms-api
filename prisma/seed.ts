import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Cleanup existing data
  await prisma.nomination.deleteMany();
  await prisma.project.deleteMany();
  await prisma.viva.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.student.deleteMany();
  await prisma.supervisor.deleteMany();
  await prisma.examiner.deleteMany();
  await prisma.user.deleteMany();
  await prisma.lecturer.deleteMany();

  // Create users
  const user1 = await prisma.user.create({
    data: {
      email: 'student@example.com',
      name: 'Student User',
      password: 'password123',
      student: {
        create: {},
      },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'supervisor@example.com',
      name: 'Supervisor User',
      password: 'password123',
      lecturer: {
        create: {
          examiner: {
            create: {},
          },
        },
      },
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'examiner@example.com',
      name: 'Examiner User',
      password: 'password123',
      lecturer: {
        create: {
          supervisor: {
            create: {},
          },
        },
      },
    },
  });

  // Create submission
  await prisma.submission.create({
    data: {
      title: 'First Submission',
      content: 'This is the content of the first submission.',
      student: {
        connect: {
          userId: user1.id,
        },
      },
    },
  });

  // Create viva
  const viva1 = await prisma.viva.create({
    data: {
      topic: 'First Viva',
      student: {
        connect: {
          userId: user1.id,
        },
      },
      examiners: {
        connect: {
          lecturerId: user3.id,
        },
      },
    },
  });

  // Create project
  await prisma.project.create({
    data: {
      title: 'First Project',
      student: {
        connect: {
          userId: user1.id,
        },
      },
      viva: {
        connect: {
          id: viva1.id,
        },
      },
    },
  });

  // Create nomination
  await prisma.nomination.create({
    data: {
      details: 'First Nomination',
      supervisor: {
        connect: {
          lecturerId: user2.id,
        },
      },
      examiner: {
        connect: {
          lecturerId: user3.id,
        },
      },
    },
  });

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
