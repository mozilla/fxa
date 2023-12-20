/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Important! Must be imported first! This makes sure that sentry and tracing can
// hook into node BEFORE any frameworks are initialized/imported.
import './monitoring';

import { NestApplicationOptions } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SentryInterceptor } from 'fxa-shared/nestjs/sentry/sentry.interceptor';
import { initTracing } from 'fxa-shared/tracing/node-tracing';
import mozLog from 'mozlog';
import helmet from 'helmet';

import { AppModule } from './app.module';
import Config, { AppConfig } from './config';
import { allowlistGqlQueries } from 'fxa-shared/nestjs/gql/gql-allowlist';

const appConfig = Config.getProperties() as AppConfig;

async function bootstrap() {
  // Initialize tracing first
  initTracing(
    appConfig.tracing,
    mozLog(Config.getProperties().log)(Config.getProperties().log.app)
  );

  const nestConfig: NestApplicationOptions = {};
  if (appConfig.env !== 'development') {
    nestConfig.logger = false;
  }
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    nestConfig
  );

  // This applies GQL query allowlisting
  app.use(allowlistGqlQueries(appConfig.gql));

  if (appConfig.hstsEnabled) {
    const maxAge = appConfig.hstsMaxAge;
    app.use(helmet.hsts({ includeSubDomains: true, maxAge }));
  }

  // We run behind a proxy when deployed, include the express middleware
  // to extract the X-Forwarded-For header.
  if (appConfig.env !== 'development') {
    app.set('trust proxy', true);
  }

  // Add sentry as error reporter
  app.useGlobalInterceptors(new SentryInterceptor());

  // Starts listening for shutdown hooks
  app.enableShutdownHooks();

  await app.listen(appConfig.port);
}
bootstrap();
