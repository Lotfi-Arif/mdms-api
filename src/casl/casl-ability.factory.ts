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
  Nomination,
  File,
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
      Nomination: Nomination;
      File: File;
      Project: Project;
      Viva: Viva & { project: Project };
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
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createPrismaAbility,
    );

    if (user.student) {
      can('read', 'Student', { id: user.student.id });
      can('create', 'Submission', { studentId: user.student.id });
      can('read', 'Submission', { studentId: user.student.id });
      can('delete', 'Submission', { studentId: user.student.id });
      can('read', 'Lecturer');
      can('read', 'Project');
      can('read', 'Viva', { studentId: user.student.id });
      can('read', 'Supervisor');
      can('read', 'Examiner');
      can('create', 'File');
      can('read', 'File');
      can('update', 'File');
      can('delete', 'File');

      cannot('create', 'Project');
      cannot('update', 'Project');
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
        can('read', 'Supervisor', { id: user.lecturer.supervisor.id });

        can('create', 'Nomination');
      }

      if (user.lecturer.examiner) {
        can('read', 'Examiner', { id: user.lecturer.examiner.id });
        can('read', 'Supervisor');
        can('read', 'Nomination');
        can('update', 'Nomination');
        can('read', 'File');

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
