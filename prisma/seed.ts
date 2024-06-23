import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Cleanup existing data
    await prisma.nomination.deleteMany();
    await prisma.project.deleteMany();
    await prisma.viva.deleteMany();
    await prisma.submission.deleteMany();
    await prisma.student.deleteMany();
    await prisma.supervisor.deleteMany();
    await prisma.examiner.deleteMany();
    await prisma.lecturer.deleteMany();
    await prisma.user.deleteMany();

    console.log('Existing data cleaned up.');

    // Create users
    const student1 = await prisma.user.create({
      data: {
        email: 'student1@example.com',
        name: 'Student One',
        password: 'password123',
        student: {
          create: {},
        },
      },
    });

    const student2 = await prisma.user.create({
      data: {
        email: 'student2@example.com',
        name: 'Student Two',
        password: 'password123',
        student: {
          create: {},
        },
      },
    });

    await prisma.user.create({
      data: {
        email: 'supervisor1@example.com',
        name: 'Supervisor One',
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

    await prisma.user.create({
      data: {
        email: 'supervisor2@example.com',
        name: 'Supervisor Two',
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

    const examiner1 = await prisma.user.create({
      data: {
        email: 'examiner1@example.com',
        name: 'Examiner One',
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

    const examiner2 = await prisma.user.create({
      data: {
        email: 'examiner2@example.com',
        name: 'Examiner Two',
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

    console.log('Users created.');

    // Create submissions
    const submission1 = await prisma.submission.create({
      data: {
        title: 'First Submission',
        content: 'Content of first submission',
        student: {
          connect: {
            userId: student1.id,
          },
        },
      },
    });

    const submission2 = await prisma.submission.create({
      data: {
        title: 'Second Submission',
        content: 'Content of second submission',
        student: {
          connect: {
            userId: student2.id,
          },
        },
      },
    });

    console.log('Submissions created:', submission1, submission2);

    // Ensure the examiners' lecturer records exist
    const examinerLecturer1 = await prisma.lecturer.findUnique({
      where: { userId: examiner1.id },
    });

    const examinerLecturer2 = await prisma.lecturer.findUnique({
      where: { userId: examiner2.id },
    });

    if (!examinerLecturer1 || !examinerLecturer2) {
      throw new Error('Examiner lecturer record not found.');
    }

    console.log(
      'Examiner Lecturer IDs:',
      examinerLecturer1.id,
      examinerLecturer2.id,
    );

    // Create nominations
    const nomination1 = await prisma.nomination.create({
      data: {
        details: 'Nomination for Examiner One',
        lecturer: {
          connect: {
            id: examinerLecturer1.id,
          },
        },
      },
    });

    const nomination2 = await prisma.nomination.create({
      data: {
        details: 'Nomination for Examiner Two',
        lecturer: {
          connect: {
            id: examinerLecturer2.id,
          },
        },
      },
    });

    console.log('Nominations created:', nomination1, nomination2);

    // Accept nominations
    const updatedNomination1 = await prisma.nomination.update({
      where: { id: nomination1.id },
      data: { accepted: true },
      include: {
        lecturer: {
          include: { examiner: true },
        },
      },
    });

    const updatedNomination2 = await prisma.nomination.update({
      where: { id: nomination2.id },
      data: { accepted: true },
      include: {
        lecturer: {
          include: { examiner: true },
        },
      },
    });

    console.log(
      'Nominations accepted:',
      updatedNomination1,
      updatedNomination2,
    );

    // Check if lecturers are not already examiners, then create examiner entries
    if (!updatedNomination1.lecturer.examiner) {
      const newExaminer1 = await prisma.examiner.create({
        data: { lecturer: { connect: { id: examinerLecturer1.id } } },
      });
      console.log('Lecturer One made an examiner:', newExaminer1);
    }

    if (!updatedNomination2.lecturer.examiner) {
      const newExaminer2 = await prisma.examiner.create({
        data: { lecturer: { connect: { id: examinerLecturer2.id } } },
      });
      console.log('Lecturer Two made an examiner:', newExaminer2);
    }

    // Create vivas
    const viva1 = await prisma.viva.create({
      data: {
        topic: 'First Viva',
        student: { connect: { userId: student1.id } },
        vivaDate: new Date(),
      },
    });

    const viva2 = await prisma.viva.create({
      data: {
        topic: 'Second Viva',
        student: { connect: { userId: student2.id } },
        vivaDate: new Date(),
      },
    });

    console.log('Vivas created:', viva1, viva2);

    // Debugging IDs
    console.log('Viva1 ID:', viva1.id);
    console.log('Viva2 ID:', viva2.id);

    // Connect examiners to vivas
    await prisma.viva.update({
      where: { id: viva1.id },
      data: {
        examiners: {
          connect: [
            { lecturerId: examinerLecturer1.id },
            { lecturerId: examinerLecturer2.id },
          ],
        },
      },
    });

    await prisma.viva.update({
      where: { id: viva2.id },
      data: {
        examiners: {
          connect: [
            { lecturerId: examinerLecturer1.id },
            { lecturerId: examinerLecturer2.id },
          ],
        },
      },
    });

    console.log('Examiners connected to vivas.');

    // Create projects
    const project1 = await prisma.project.create({
      data: {
        title: 'First Project',
        student: { connect: { userId: student1.id } },
        viva: { connect: { id: viva1.id } },
      },
    });

    const project2 = await prisma.project.create({
      data: {
        title: 'Second Project',
        student: { connect: { userId: student2.id } },
        viva: { connect: { id: viva2.id } },
      },
    });

    console.log('Projects created:', project1, project2);

    console.log('Seeding completed.');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
