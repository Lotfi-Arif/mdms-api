import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Param,
  Get,
  Res,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from './file-upload.service';
import { diskStorage } from 'multer';
import { Response } from 'express';
import * as path from 'path';

@Controller('files')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          const filename = `${path.basename(file.originalname, ext)}-${uniqueSuffix}${ext}`;
          cb(null, filename);
        },
      }),
    }),
  )
  async uploadSingleFile(@UploadedFile() file) {
    const savedFile = await this.fileUploadService.saveFileData(
      file.filename,
      file.mimetype,
      file.path,
    );
    return { id: savedFile.id };
  }

  @Post('uploads')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          const filename = `${path.basename(file.originalname, ext)}-${uniqueSuffix}${ext}`;
          cb(null, filename);
        },
      }),
    }),
  )
  async uploadMultipleFiles(@UploadedFiles() files) {
    const responses = [];
    for (const file of files) {
      const savedFile = await this.fileUploadService.saveFileData(
        file.filename,
        file.mimetype,
        file.path,
      );
      responses.push({ id: savedFile.id });
    }
    return responses;
  }

  @Get(':id')
  async getFile(@Param('id') id: string, @Res() res: Response) {
    const file = await this.fileUploadService.getFile(id);
    res.sendFile(path.join(process.cwd(), file.path));
  }
}
