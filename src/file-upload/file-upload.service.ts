import { Injectable } from '@nestjs/common';
import { File } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class FileUploadService {
  constructor(private readonly prisma: PrismaService) {}

  async saveFileData(
    filename: string,
    mimetype: string,
    path: string,
  ): Promise<File> {
    return this.prisma.file.create({
      data: {
        filename,
        mimetype,
        path,
      },
    });
  }

  async getFile(id: string): Promise<File> {
    return this.prisma.file.findUnique({ where: { id } });
  }
}
