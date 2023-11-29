/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { NextFunction, Request, Response } from 'express';
import { CustomsModule } from 'fxa-shared/nestjs/customs/customs.module';
import { CustomsService } from 'fxa-shared/nestjs/customs/customs.service';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';
import {
  createContext,
  SentryPlugin,
} from 'fxa-shared/nestjs/sentry/sentry.plugin';
import queryComplexity, {
  getComplexity,
  simpleEstimator,
} from 'graphql-query-complexity';
import path, { join } from 'path';

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
import { LegalResolver } from './legal.resolver';
import { SubscriptionResolver } from './subscription.resolver';
import { ClientInfoResolver } from './clientInfo.resolver';
import { SessionResolver } from './session.resolver';
import { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';
import { GraphQLSchemaHost } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { Plugin } from '@nestjs/apollo';

const config = Config.getProperties();

// PROBLEM: Nest can't resolve dependencies of the ComplexityPlugin (?). Please make sure that the argument GraphQLSchemaHost at index [0] is available in the GqlModule context.
// Taken from: https://docs.nestjs.com/graphql/complexity
@Plugin()
export class ComplexityPlugin implements ApolloServerPlugin {
  constructor(private gqlSchemaHost: GraphQLSchemaHost) {}

  async requestDidStart(): Promise<any> {
    const maxComplexity = 1000;
    const { schema } = this.gqlSchemaHost;
    console.log('schema', schema);

    return {
      async didResolveOperation({
        request,
        document,
      }: {
        request: any;
        document: any;
      }) {
        const complexity = getComplexity({
          schema,
          operationName: request.operationName,
          query: document,
          variables: request.variables,
          estimators: [simpleEstimator({ defaultComplexity: 1 })],
        });
        if (complexity > maxComplexity) {
          throw new GraphQLError(
            `Query is too complex: ${complexity}. Maximum allowed complexity: ${maxComplexity}`
          );
        }
        console.log('complexity', complexity);
      },
    };
  }
}

/**
 * GraphQL Config Factory for setting up the NestJS GqlModule
 *
 * @param configService
 * @param log
 */
export const GraphQLConfigFactory = async (
  configService: ConfigService<AppConfig>,
  log: MozLoggerService
) => ({
  allowBatchedHttpRequests: true,
  path: '/graphql',
  useGlobalPrefix: true,
  playground: configService.get<string>('env') !== 'production',
  autoSchemaFile: join(path.dirname(__dirname), './schema.gql'),
  context: ({ req, connection }: any) => createContext({ req, connection }),
  // Disabling cors here allows the cors middleware from NestJS to be applied
  cors: false,
  uploads: false,

  // PROBLEM: req.body.variables is overwritten by variable defaults
  // validationRules: [
  //   queryComplexity({
  //     estimators: [simpleEstimator({ defaultComplexity: 1 })],
  //     maximumComplexity: 100,
  //     variables: {
  //       input: 'ignoreme',
  //       file: 'ignoreme',
  //     },
  //     onComplete: (complexity: number) => {
  //       log.debug('complexity', { complexity });
  //     },
  //   }),
  // ],

  // PROBLEM: Type mismatch
  // plugins: [
  //   {
  //     requestDidStart: () => ({
  //       didResolveOperation({ request }: { request: any }) {
  //         queryComplexity({
  //           estimators: [simpleEstimator({ defaultComplexity: 1 })],
  //           maximumComplexity: 100,
  //           variables: request.variables,
  //           onComplete: (complexity: number) => {
  //             log.debug('complexity', { complexity });
  //           },
  //         });
  //       },
  //     }),
  //   },
  // ],
});

@Module({
  imports: [BackendModule, CustomsModule],
  providers: [
    AccountResolver,
    CustomsService,
    SessionResolver,
    LegalResolver,
    ClientInfoResolver,
    SubscriptionResolver,
    SentryPlugin,
    ComplexityPlugin,
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
    // Validation needing the request object

    // PROBLEM: Seeeems to work, but log in `onComplete` is never hit...
    // .apply((req: Request, res: Response, next: NextFunction) => {
    //   queryComplexity({
    //     estimators: [simpleEstimator({ defaultComplexity: 1 })],
    //     maximumComplexity: 1000,
    //     variables: req.body.variables,
    //     onComplete: (complexity: number) => {
    //       console.log('complexity *****', { complexity });
    //       // log.debug('complexity', { complexity });
    //     },
    //   });

    //   next();
    // })
    // .forRoutes('graphql');
  }
}
