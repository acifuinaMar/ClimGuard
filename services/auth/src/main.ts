import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { loadConfig } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['log', 'warn', 'error'] });
  app.enableShutdownHooks(); // SIGTERM -> cierra conexiones (K8s-ready)
  await app.listen(loadConfig().port, '0.0.0.0');
  new Logger('Auth').log('Auth service listo');
}
bootstrap();
