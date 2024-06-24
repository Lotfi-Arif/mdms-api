import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from 'nestjs-prisma';
import { PRISMA_ERROR_MAP } from './constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(
    new PrismaClientExceptionFilter(httpAdapter, PRISMA_ERROR_MAP),
  );

  await app.listen(3000);
}
bootstrap();
