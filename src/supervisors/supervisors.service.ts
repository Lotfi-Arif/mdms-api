import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Supervisor, Prisma } from '@prisma/client';

@Injectable()
export class SupervisorsService {
  constructor(private prisma: PrismaService) {}

  async createSupervisor(
    data: Prisma.SupervisorCreateInput,
  ): Promise<Supervisor> {
    return this.prisma.supervisor.create({ data });
  }

  async getAllSupervisors(): Promise<Supervisor[]> {
    return this.prisma.supervisor.findMany();
  }

  async getSupervisorById(id: string): Promise<Supervisor | null> {
    return this.prisma.supervisor.findUnique({ where: { id } });
  }

  async updateSupervisor(
    id: string,
    data: Prisma.SupervisorUpdateInput,
  ): Promise<Supervisor> {
    return this.prisma.supervisor.update({
      where: { id },
      data,
    });
  }

  async deleteSupervisor(id: string): Promise<Supervisor> {
    return this.prisma.supervisor.delete({ where: { id } });
  }
}
