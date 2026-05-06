// PURPOSE: Application entry point — boots the server with global config.
// Everything here applies to the ENTIRE application.

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 5000;

  // All routes prefixed with /api → /api/auth/login, /api/papers, etc.
  app.setGlobalPrefix('api');

  // ValidationPipe ACTIVATES all class-validator decorators on DTOs.
  // Without this line, @IsEmail(), @IsNotEmpty() etc. do absolutely nothing.
  // whitelist: true           → strips fields not defined in the DTO (security)
  // forbidNonWhitelisted: true → throws error if unknown fields are sent
  // transform: true            → auto-converts types (e.g. "5" → 5 for numbers)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Allow our Next.js frontend to call this API (browsers block cross-origin by default)
  app.enableCors({
    origin: ['http://localhost:3000', configService.get<string>('frontendUrl')],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Serve uploaded files as static assets
  // Files at /uploads/filename.pdf are accessible via /api/upload/files/filename.pdf
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  await app.listen(port);
  console.log(`🚀 API running at http://localhost:${port}/api`);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
