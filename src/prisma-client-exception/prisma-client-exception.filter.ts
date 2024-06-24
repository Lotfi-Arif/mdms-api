import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = exception.message;

    switch (exception.code) {
      case 'P2000':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'The provided value for the column is too long.';
        break;
      case 'P2001':
        statusCode = HttpStatus.NOT_FOUND;
        message = 'The record searched for does not exist.';
        break;
      case 'P2002':
        statusCode = HttpStatus.CONFLICT;
        message = `Unique constraint failed on the field(s): ${exception.meta?.target}`;
        break;
      case 'P2003':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Foreign key constraint failed.';
        break;
      case 'P2004':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'A constraint failed on the database.';
        break;
      case 'P2005':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'The value stored in the database for the field is invalid.';
        break;
      case 'P2006':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'The provided value for the field is not valid.';
        break;
      case 'P2007':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Data validation error.';
        break;
      case 'P2008':
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Failed to parse the query.';
        break;
      case 'P2009':
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Failed to validate the query.';
        break;
      case 'P2010':
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Raw query failed.';
        break;
      case 'P2011':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Null constraint violation.';
        break;
      case 'P2012':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Missing a required value.';
        break;
      case 'P2013':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Missing the required argument.';
        break;
      case 'P2014':
        statusCode = HttpStatus.BAD_REQUEST;
        message =
          'The change you are trying to make would violate the required relation between the models.';
        break;
      case 'P2015':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'A related record could not be found.';
        break;
      case 'P2016':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Query interpretation error.';
        break;
      case 'P2017':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Records for relation not found.';
        break;
      case 'P2018':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'The required connected records were not found.';
        break;
      case 'P2019':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Input error.';
        break;
      case 'P2020':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Value out of range.';
        break;
      case 'P2021':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Table does not exist.';
        break;
      case 'P2022':
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Column does not exist.';
        break;
      case 'P2023':
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Inconsistent column data.';
        break;
      case 'P2024':
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Transaction API error.';
        break;
      case 'P2025':
        statusCode = HttpStatus.NOT_FOUND;
        message =
          'An operation failed because it depends on one or more records that were required but not found.';
        break;
      default:
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Internal server error.';
        break;
    }

    response.status(statusCode).json({
      statusCode,
      message,
    });
  }
}
