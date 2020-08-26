/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { NestApplicationOptions } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import Config, { AppConfig } from './config';
import { SentryInterceptor } from './sentry/sentry.interceptor';

async function bootstrap() {
  const nestConfig: NestApplicationOptions = {};
  if (Config.getProperties().env !== 'development') {
    nestConfig.logger = false;
  }
  const app = await NestFactory.create(AppModule, nestConfig);
  const config: ConfigService<AppConfig> = app.get(ConfigService);
  const proxyConfig = config.get('proxy') as AppConfig['proxy'];

  // Add sentry as error reporter
  app.useGlobalInterceptors(new SentryInterceptor());

  // Starts listening for shutdown hooks
  app.enableShutdownHooks();

  await app.listen(proxyConfig.port);
}
bootstrap();
