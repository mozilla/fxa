/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

// Must be the first import so Sentry patches Nest before it boots.
import './monitoring';

import { Logger } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import helmet from 'helmet';
import { ResponseValidationInterceptor } from '@fxa/payments/api-server';
import { AppModule } from './app/app.module';
import { RootConfig } from './config';
import { annotateWebhookRoutes, stripInternalRoutes } from './swagger.utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  app.use(
    helmet({
      hsts: { maxAge: 31536000, includeSubDomains: true },
    })
  );

  const config = app.get(RootConfig);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Payments API')
    .setDescription(
      'API for billing, subscriptions, metering, and webhook handling'
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Webhooks', 'Stripe, CMS, and FXA webhook handlers')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  annotateWebhookRoutes(document);

  // Swagger UI off by default; opt-in for local dev. Shows full unfiltered spec.
  if (config.swaggerUi) {
    SwaggerModule.setup('api-docs', app, document, {
      jsonDocumentUrl: 'swagger.json',
    });
  }

  // SECURITY: /swagger.json is intentionally unauthenticated (Backstage
  // depends on it). Internal routes are stripped; public routes are
  // discoverable anyway.
  const publicDocument = stripInternalRoutes(document);
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/swagger.json', (_req: Request, res: Response) => {
    res.json(publicDocument);
  });

  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ResponseValidationInterceptor(reflector));

  const port = process.env.PORT || 3037;
  app.enableShutdownHooks();
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
