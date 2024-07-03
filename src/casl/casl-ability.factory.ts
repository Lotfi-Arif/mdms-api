import { Injectable } from '@nestjs/common';
import { AbilityBuilder, PureAbility } from '@casl/ability';
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma';
import {
  User,
  Student,
  Lecturer,
  Supervisor,
  Examiner,
  Submission,
  Project,
  Viva,
} from '@prisma/client';

type AppSubjects =
  | Subjects<{
      User: User & {
        student?: Student;
        lecturer?: Lecturer & { supervisor?: Supervisor; examiner?: Examiner };
      };
      Student: Student;
      Lecturer: Lecturer;
      Supervisor: Supervisor;
      Examiner: Examiner;
      Submission: Submission;
      Project: Project;
      Viva: Viva;
    }>
  | 'all';

export type AppAbility = PureAbility<[string, AppSubjects], PrismaQuery>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(
    user: User & {
      student?: Student;
      lecturer?: Lecturer & {
        supervisor?: Supervisor;
        examiner?: Examiner;
      };
    },
  ) {
    const { can, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);

    if (user.student) {
      can('read', 'Student', { id: user.student.id });
      can('create', 'Submission', { studentId: user.student.id });
      can('read', 'Submission', { studentId: user.student.id });
      can('delete', 'Submission', { studentId: user.student.id });
      can('read', 'Lecturer');
      can('read', 'Project');
      can('read', 'Viva', { studentId: user.student.id });
    }

    if (user.lecturer) {
      can('read', 'Student');
      can('read', 'Submission');
      can('read', 'Project');
      can('read', 'Viva');

      if (user.lecturer.supervisor) {
        can('update', 'Submission', {
          student: { supervisor: { id: user.lecturer.supervisor.id } },
        });
      }

      if (user.lecturer.examiner) {
        can('read', 'Examiner', { id: user.lecturer.examiner.id });
        can('read', 'Supervisor');
        can('read', 'Viva', {
          examiners: { some: { id: user.lecturer.examiner.id } },
        });
        can('create', 'Viva', {
          examiners: { some: { id: user.lecturer.examiner.id } },
        });
        can('update', 'Viva', {
          examiners: { some: { id: user.lecturer.examiner.id } },
        });
      }
    }

    return build();
  }
}
