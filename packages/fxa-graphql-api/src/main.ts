/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Important! Must be imported first! This makes sure that sentry and tracing can
// hook into node BEFORE any frameworks are initialized/imported.
import './monitoring';

import bodyParser from 'body-parser';
import { Request, Response } from 'express';
import { allowlistGqlQueries } from 'fxa-shared/nestjs/gql/gql-allowlist';
import { SentryInterceptor } from '@fxa/shared/sentry';
import helmet from 'helmet';

import { NestApplicationOptions } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';
import Config from './config';

const appConfig = Config.getProperties();

async function bootstrap() {
  const nestConfig: NestApplicationOptions = {};
  if (Config.getProperties().env !== 'development') {
    nestConfig.logger = false;
  }
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    nestConfig
  );

  // Configure allowlisting of gql queries
  app.use(bodyParser.json());
  app.use(allowlistGqlQueries(appConfig.gql));

  if (appConfig.hstsEnabled) {
    const maxAge = appConfig.hstsMaxAge;
    app.use(helmet.hsts({ includeSubDomains: true, maxAge }));
  }

  // Only apply security restrictions when in prod-like environment
  // since this interferes with Graphql playground
  if (appConfig.env !== 'development') {
    app.use(
      helmet.frameguard({
        action: 'deny',
      })
    );

    app.use((_req: Request, res: Response, next: any) => {
      res.setHeader('X-XSS-Protection', '1; mode=block');
      next();
    });

    app.use(helmet.noSniff());
    const NONE = "'none'";
    app.use(
      helmet.contentSecurityPolicy({
        directives: {
          baseUri: [NONE],
          defaultSrc: [NONE],
          frameSrc: [NONE],
          objectSrc: [NONE],
        },
      })
    );

    // We run behind a proxy when deployed, include the express middleware
    // to extract the X-Forwarded-For header.
    app.set('trust proxy', true);
  }

  app.enableCors({
    origin: appConfig.env === 'development' ? '*' : appConfig.corsOrigin,
    methods: ['OPTIONS', 'POST'],
  });

  // Add sentry as error reporter
  app.useGlobalInterceptors(new SentryInterceptor());

  // Starts listening for shutdown hooks
  app.enableShutdownHooks();

  await app.listen(appConfig.port);
}
bootstrap();
