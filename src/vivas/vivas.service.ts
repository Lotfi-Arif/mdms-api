import { Injectable } from '@nestjs/common';
import { Prisma, Viva } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VivasService {
  constructor(private prisma: PrismaService) {}

  async createViva(data: Prisma.VivaCreateInput): Promise<Viva> {
    return this.prisma.viva.create({ data });
  }

  async findAllVivas(): Promise<Viva[]> {
    return this.prisma.viva.findMany();
  }

  async findOneViva(id: string): Promise<Viva | null> {
    return this.prisma.viva.findUnique({
      where: { id },
    });
  }

  async updateViva(id: string, data: Prisma.VivaUpdateInput): Promise<Viva> {
    return this.prisma.viva.update({
      where: { id },
      data,
    });
  }

  async deleteViva(id: string): Promise<Viva> {
    return this.prisma.viva.delete({
      where: { id },
    });
  }
}
