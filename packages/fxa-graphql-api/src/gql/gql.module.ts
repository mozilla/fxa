/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlModuleOptions } from '@nestjs/graphql';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';
import queryComplexity, { simpleEstimator } from 'graphql-query-complexity';
import { graphqlUploadExpress } from 'graphql-upload';
import path, { join } from 'path';

import { BackendModule } from '../backend/backend.module';
import Config, { AppConfig } from '../config';
import { AccountResolver } from './account.resolver';
import { SessionResolver } from './session.resolver';

const config = Config.getProperties();

/**
 * GraphQL Config Factory for setting up the NestJS GqlModule
 *
 * @param configService
 * @param log
 */
export const GraphQLConfigFactory = async (
  configService: ConfigService<AppConfig>,
  log: MozLoggerService
): Promise<GqlModuleOptions> => ({
  path: '/graphql',
  useGlobalPrefix: true,
  debug: configService.get<string>('env') !== 'production',
  playground: configService.get<string>('env') !== 'production',
  autoSchemaFile: join(path.dirname(__dirname), './schema.gql'),
  context: ({ req }) => ({ req }),
  uploads: false,
  validationRules: [
    queryComplexity({
      estimators: [simpleEstimator({ defaultComplexity: 1 })],
      maximumComplexity: 100,
      variables: {
        input: 'ignoreme',
      },
      onComplete: (complexity: number) => {
        log.debug('complexity', { complexity });
      },
    }),
  ],
});

@Module({
  imports: [BackendModule],
  providers: [AccountResolver, SessionResolver],
})
export class GqlModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(graphqlUploadExpress({ maxFileSize: config.image.maxSize }))
      .forRoutes('graphql');
  }
}
