import { Injectable } from '@nestjs/common';
import { Prisma, Nomination } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NominationsService {
  constructor(private prisma: PrismaService) {}

  async createNomination(
    data: Prisma.NominationCreateInput,
  ): Promise<Nomination> {
    return this.prisma.nomination.create({ data });
  }

  async findAllNominations(): Promise<Nomination[]> {
    return this.prisma.nomination.findMany();
  }

  async findOneNomination(id: string): Promise<Nomination | null> {
    return this.prisma.nomination.findUnique({
      where: { id },
    });
  }

  async updateNomination(
    id: string,
    data: Prisma.NominationUpdateInput,
  ): Promise<Nomination> {
    return this.prisma.nomination.update({
      where: { id },
      data,
    });
  }

  async deleteNomination(id: string): Promise<Nomination> {
    return this.prisma.nomination.delete({
      where: { id },
    });
  }
}
