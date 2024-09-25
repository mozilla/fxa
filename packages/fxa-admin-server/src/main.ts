/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Important! Must be imported first! This makes sure that sentry and tracing can
// hook into node BEFORE any frameworks are initialized/imported.
const start = Date.now();
let last = start;
const l = (step: string) => {
  const tick = Date.now();
  console.log(`!!! main:`, {
    step,
    delta: tick - last,
    elapsed: tick - start,
  });
  last = tick;
};

import './monitoring';
l('./monitoring');

import { Logger, NestApplicationOptions } from '@nestjs/common';
l('@nestjs/common');

import { NestFactory } from '@nestjs/core';
l('@nestjs/core');

import { NestExpressApplication } from '@nestjs/platform-express';
l('@nestjs/platform-express');

import { SentryInterceptor } from 'fxa-shared/nestjs/sentry/sentry.interceptor';
l('fxa-shared/nestjs/sentry/sentry.interceptor');

import { initTracing } from 'fxa-shared/tracing/node-tracing';
l('fxa-shared/tracing/node-tracing');

import mozLog from 'mozlog';
l('mozlog');

import helmet from 'helmet';
l('helmet');

import { AppModule } from './app.module';
l('./app.module');

import Config, { AppConfig } from './config';
l('./config');

import { allowlistGqlQueries } from 'fxa-shared/nestjs/gql/gql-allowlist';
l('fxa-shared/nestjs/gql/gql-allowlist');

const appConfig = Config.getProperties() as AppConfig;
l('Config.getProperties()');

async function bootstrap() {
  const mozlogger = mozLog(Config.getProperties().log)(
    Config.getProperties().log.app
  );
  l('bootstrap - create mozLog');

  // Initialize tracing first
  initTracing(appConfig.tracing, mozlogger);
  l('bootstrap - initTracing');

  const nestConfig: NestApplicationOptions = {};
  nestConfig.logger = ['log', 'fatal', 'error', 'warn', 'debug', 'verbose'];
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    nestConfig
  );
  l('bootstrap - NestFactory.create');

  // This applies GQL query allowlisting
  app.use(allowlistGqlQueries(appConfig.gql));
  l('bootstrap - use allowlistGqlQueries');

  if (appConfig.hstsEnabled) {
    const maxAge = appConfig.hstsMaxAge;
    app.use(helmet.hsts({ includeSubDomains: true, maxAge }));
    l('bootstrap - use helmet');
  }

  // We run behind a proxy when deployed, include the express middleware
  // to extract the X-Forwarded-For header.
  if (appConfig.env !== 'development') {
    app.set('trust proxy', true);
  }

  // Add sentry as error reporter
  app.useGlobalInterceptors(new SentryInterceptor());
  l('bootstrap - SentryInterceptor');

  // Starts listening for shutdown hooks
  app.enableShutdownHooks();
  l('bootstrap - enableShutdownHooks');

  await app.listen(appConfig.port);
  l('bootstrap - listen');
}
bootstrap();
