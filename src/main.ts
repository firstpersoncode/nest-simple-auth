import 'dotenv/config';
import 'reflect-metadata';

import { join } from 'path';
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { useContainer } from 'class-validator';
import * as cookieParser from 'cookie-parser';

import { SessionGuard } from './utils/guards/session.guard';
import { OwnerGuard } from './utils/guards/owner.guard';
import { RoleGuard } from './utils/guards/role.guard';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      validationError: { target: false },
    }),
  );

  app.use(cookieParser());

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'template'));
  app.setViewEngine('pug');

  const reflector = app.get(Reflector);
  void reflector;

  app.useGlobalGuards(new SessionGuard(reflector));
  app.useGlobalGuards(new OwnerGuard(reflector));
  app.useGlobalGuards(new RoleGuard(reflector));

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.listen(process.env.PORT || 5000);
}

bootstrap();
