/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { NestApplicationOptions } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SentryInterceptor } from 'fxa-shared/nestjs/sentry/sentry.interceptor';
import helmet from 'helmet';
import { join } from 'path';

import { AppModule } from './app.module';
import Config, { AppConfig } from './config';

async function bootstrap() {
  const nestConfig: NestApplicationOptions = {};
  if (Config.getProperties().env !== 'development') {
    nestConfig.logger = false;
  }
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    nestConfig
  );
  const config: ConfigService<AppConfig> = app.get(ConfigService);

  // Setup application security
  const cspConfig = config.get('csp') as AppConfig['csp'];
  const frameAncestors = cspConfig.frameAncestors;
  app.use(
    helmet.contentSecurityPolicy({
      directives: { frameAncestors, defaultSrc: 'self' },
    })
  );
  app.use(helmet.xssFilter());
  if (config.get<boolean>('hstsEnabled')) {
    const maxAge = config.get<number>('hstsMaxAge');
    app.use(helmet.hsts({ includeSubDomains: true, maxAge }));
  }

  // We run behind a proxy when deployed, include the express middleware
  // to extract the X-Forwarded-For header.
  if (Config.getProperties().env !== 'development') {
    app.set('trust proxy', true);
  }

  // Add sentry as error reporter
  app.useGlobalInterceptors(new SentryInterceptor());

  // Starts listening for shutdown hooks
  app.enableShutdownHooks();

  // Setup handlebars template rendering
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  const listenConfig = config.get('listen') as AppConfig['listen'];
  await app.listen(listenConfig.port, listenConfig.host);
}
bootstrap();
