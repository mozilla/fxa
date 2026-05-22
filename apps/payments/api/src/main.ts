/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  // Required so providers implementing OnApplicationShutdown (e.g.
  // MeteringIngestBufferManager) get a chance to drain in-flight work on SIGTERM /
  // SIGINT during a rolling deploy. Without this, Nest never invokes the
  // lifecycle hook and queued events are dropped silently.
  app.enableShutdownHooks();
  const port = process.env.PORT || 3037;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}`
  );
}

bootstrap();
