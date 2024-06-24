import { PrismaClientExceptionFilter } from './prisma-client-exception.filter';
import { ArgumentsHost } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

describe('PrismaClientExceptionFilter', () => {
  let filter: PrismaClientExceptionFilter;

  beforeEach(() => {
    filter = new PrismaClientExceptionFilter();
  });

  it('should return conflict status for P2002 error code', () => {
    const exception = {
      code: 'P2002',
      message: 'Unique constraint failed on the fields: (`email`)',
      meta: { target: ['email'] },
    } as unknown as Prisma.PrismaClientKnownRequestError;

    const host: ArgumentsHost = {
      switchToHttp: jest.fn().mockReturnThis(),
      getResponse: jest.fn().mockReturnThis(),
    } as unknown as ArgumentsHost;

    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    jest.spyOn(host, 'switchToHttp').mockReturnValue({
      getResponse: () => response,
    } as any);

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 409,
      message: 'Unique constraint failed on the field(s): email',
    });
  });

  it('should return not found status for P2025 error code', () => {
    const exception = {
      code: 'P2025',
      message: 'Record not found',
    } as Prisma.PrismaClientKnownRequestError;

    const host: ArgumentsHost = {
      switchToHttp: jest.fn().mockReturnThis(),
      getResponse: jest.fn().mockReturnThis(),
    } as unknown as ArgumentsHost;

    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    jest.spyOn(host, 'switchToHttp').mockReturnValue({
      getResponse: () => response,
    } as any);

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 404,
      message:
        'An operation failed because it depends on one or more records that were required but not found.',
    });
  });

  it('should return internal server error for unknown error code', () => {
    const exception = {
      code: 'UNKNOWN',
      message: 'Unknown error',
    } as Prisma.PrismaClientKnownRequestError;

    const host: ArgumentsHost = {
      switchToHttp: jest.fn().mockReturnThis(),
      getResponse: jest.fn().mockReturnThis(),
    } as unknown as ArgumentsHost;

    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    jest.spyOn(host, 'switchToHttp').mockReturnValue({
      getResponse: () => response,
    } as any);

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Internal server error.',
    });
  });
});
