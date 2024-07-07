import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Param,
  Get,
  Res,
  Body,
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
          cb(null, file.originalname);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(pdf|zip)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Only .pdf and .zip files are allowed!'), false);
        }
      },
    }),
  )
  async uploadFileAndCreateSubmission(
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
    @Body('submissionType') submissionType: string,
    @Body('studentEmail') studentEmail: string,
  ) {
    return this.fileUploadService.saveFileAndCreateSubmission(
      file,
      title,
      submissionType,
      studentEmail,
    );
  }

  @Post('uploads')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, file.originalname);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(pdf|zip)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Only .pdf and .zip files are allowed!'), false);
        }
      },
    }),
  )
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('title') title: string,
    @Body('submissionType') submissionType: string,
    @Body('studentEmail') studentEmail: string,
  ) {
    const responses = [];
    for (const file of files) {
      const { message, submission } =
        await this.fileUploadService.saveFileAndCreateSubmission(
          file,
          title,
          submissionType,
          studentEmail,
        );
      responses.push({ message, submission });
    }
    return responses;
  }

  @Get(':id')
  async getFile(@Param('id') id: string, @Res() res: Response) {
    const file = await this.fileUploadService.getFile(id);
    res.sendFile(path.join(process.cwd(), file.path));
  }

  @Get('submissions/:studentId')
  async getStudentSubmissions(@Param('studentId') studentId: string) {
    return this.fileUploadService.getSubmissionsByStudentId(studentId);
  }
}
