import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from 'nestjs-prisma';
import { Supervisor, Lecturer, User } from '@prisma/client';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let lecturer: Lecturer;
  let supervisor: Supervisor;
  let user: User;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    // Create unique test data for each test case
    user = await prisma.user.create({
      data: {
        email: `lecturer${Date.now()}@example.com`,
        name: 'Lecturer',
        password: 'password123',
      },
    });

    lecturer = await prisma.lecturer.create({
      data: {
        userId: user.id,
        staffNumber: `STF${Date.now()}`,
      },
    });

    supervisor = await prisma.supervisor.create({
      data: {
        lecturer: {
          connect: { id: lecturer.id },
        },
      },
      include: {
        lecturer: {
          include: { user: true },
        },
      },
    });
  });

  afterEach(async () => {
    // Clean up test data after each test case
    await prisma.nomination.deleteMany({
      where: {
        lecturerId: lecturer.id,
      },
    });

    await prisma.viva.deleteMany({
      where: {
        examiners: {
          some: {
            lecturerId: lecturer.id,
          },
        },
      },
    });

    await prisma.submission.deleteMany({
      where: {
        student: {
          supervisorId: supervisor.id,
        },
      },
    });

    await prisma.project.deleteMany({
      where: {
        student: {
          supervisorId: supervisor.id,
        },
      },
    });

    await prisma.student.deleteMany({
      where: {
        supervisorId: supervisor.id,
      },
    });

    // Check if supervisor exists before attempting to delete
    const existingSupervisor = await prisma.supervisor.findUnique({
      where: { id: supervisor.id },
    });

    if (existingSupervisor) {
      await prisma.supervisor.delete({
        where: { id: supervisor.id },
      });
    }

    await prisma.lecturer.delete({
      where: { id: lecturer.id },
    });

    await prisma.user.delete({
      where: { id: user.id },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect({
      greeting: 'Hello World!',
      message: 'Welcome to the MDMS API!',
    });
  });

  describe('SupervisorsController (e2e)', () => {
    it('/supervisors (POST) should create a supervisor', async () => {
      const newUser = await prisma.user.create({
        data: {
          email: `new_lecturer${Date.now()}@example.com`,
          name: 'New Lecturer',
          password: 'password123',
        },
      });

      const newLecturer = await prisma.lecturer.create({
        data: {
          userId: newUser.id,
          staffNumber: `STF${Date.now()}`,
        },
      });

      const response = await request(app.getHttpServer())
        .post(`/supervisors/${newLecturer.id}`)
        .expect(201);

      expect(response.body).toMatchObject({
        lecturerId: newLecturer.id,
        lecturer: {
          id: newLecturer.id,
          user: {
            email: newUser.email,
            name: newUser.name,
          },
        },
      });
    });

    it('/supervisors (GET) should return all supervisors', async () => {
      const response = await request(app.getHttpServer())
        .get('/supervisors')
        .expect(200);

      expect(response.body.length).toBeGreaterThan(0);
    });

    it('/supervisors/:id (GET) should return a supervisor by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/supervisors/${supervisor.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: supervisor.id,
        lecturerId: supervisor.lecturerId,
      });
    });

    it('/supervisors/:id (PATCH) should update a supervisor', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/supervisors/${supervisor.id}`)
        .send({ lecturerId: supervisor.lecturerId })
        .expect(200);

      expect(response.body).toMatchObject({
        id: supervisor.id,
        lecturerId: supervisor.lecturerId,
      });
    });

    it('/supervisors/:id (DELETE) should delete a supervisor', async () => {
      await request(app.getHttpServer())
        .delete(`/supervisors/${supervisor.id}`)
        .expect(200);

      const deletedSupervisor = await prisma.supervisor.findUnique({
        where: { id: supervisor.id },
      });

      expect(deletedSupervisor).toBeNull();
    });

    it('/supervisors/:supervisorId/students (GET) should return assigned students', async () => {
      const response = await request(app.getHttpServer())
        .get(`/supervisors/${supervisor.id}/students`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
    });
  });
});
