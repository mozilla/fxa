/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SentryGlobalGraphQLFilter } from '@sentry/nestjs/setup';

import { NextFunction, Request, Response } from 'express';
import { CustomsModule } from 'fxa-shared/nestjs/customs/customs.module';
import { CustomsService } from 'fxa-shared/nestjs/customs/customs.service';
import path, { join } from 'path';

import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { LegacyStatsDProvider } from '@fxa/shared/metrics/statsd';
import { MozLoggerService } from '@fxa/shared/mozlog';
import {
  LegacyNotifierServiceProvider,
  LegacyNotifierSnsFactory,
} from '@fxa/shared/notifier';
import {
  HttpException,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { BackendModule } from '../backend/backend.module';
import Config, { AppConfig } from '../config';
import { AccountResolver } from './account.resolver';
import { ClientInfoResolver } from './clientInfo.resolver';
import { LegalResolver } from './legal.resolver';
import { SessionResolver } from './session.resolver';
import { SubscriptionResolver } from './subscription.resolver';
import { APP_FILTER } from '@nestjs/core';

const config = Config.getProperties();

/**
 * GraphQL Config Factory for setting up the NestJS GqlModule
 *
 * @param configService
 * @param log
 */
export const GraphQLConfigFactory = async (
  configService: ConfigService<AppConfig>
) => ({
  allowBatchedHttpRequests: true,
  path: '/graphql',
  useGlobalPrefix: true,
  playground: configService.get<string>('env') !== 'production',
  autoSchemaFile: join(path.dirname(__dirname), './schema.gql'),
  // Disabling cors here allows the cors middleware from NestJS to be applied
  cors: false,
  uploads: false,
});

@Module({
  imports: [BackendModule, CustomsModule],
  providers: [
    AccountResolver,
    ClientInfoResolver,
    CustomsService,
    LegacyNotifierServiceProvider,
    LegacyNotifierSnsFactory,
    LegacyStatsDProvider,
    LegalResolver,
    MozLoggerService,
    SessionResolver,
    SubscriptionResolver,
    {
      provide: LOGGER_PROVIDER,
      useClass: MozLoggerService,
    },
    {
      provide: APP_FILTER,
      useClass: SentryGlobalGraphQLFilter,
    },
  ],
})
export class GqlModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req: Request, res: Response, next: NextFunction) => {
        if (
          config.env !== 'development' &&
          !req.is('application/json') &&
          !req.is('multipart/form-data')
        ) {
          return next(
            new HttpException('Request content type is not supported.', 415)
          );
        }
        next();
      })
      .forRoutes('graphql');
  }
}
