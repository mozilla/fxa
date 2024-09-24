/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 const start = Date.now();
 let last = start;
 const l = (step: string) => {
   const tick = Date.now();
   console.log(`!!! app.module:`, {
     step,
     delta: tick - last,
     elapsed: tick - start,
   });
   last = tick;
 };

 import { HealthModule } from 'fxa-shared/nestjs/health/health.module';
 l('fxa-shared/nestjs/health/health.module complete');

 import { LoggerModule } from 'fxa-shared/nestjs/logger/logger.module';
 l('fxa-shared/nestjs/logger/logger.module complete');

 import { MetricsFactory } from 'fxa-shared/nestjs/metrics.service';
 l('fxa-shared/nestjs/metrics.service complete');

 import {
   createContext,
   SentryPlugin,
 } from 'fxa-shared/nestjs/sentry/sentry.plugin';
 l('fxa-shared/nestjs/sentry/sentry.plugin complete');

 import { getVersionInfo } from 'fxa-shared/nestjs/version';
 l('fxa-shared/nestjs/version complete');

 import { join } from 'path';
 l('path complete');

 import { MozLoggerService } from '@fxa/shared/mozlog';
 l('@fxa/shared/mozlog complete');

 import { NotifierSnsFactory, NotifierService } from '@fxa/shared/notifier';
 l('@fxa/shared/notifier');

 import { LegacyStatsDProvider } from '@fxa/shared/metrics/statsd';
 l('@fxa/shared/metrics/statsd');

 import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
 l('@nestjs/apollo');

 import {
   Injectable,
   Logger,
   MiddlewareConsumer,
   Module,
   NestMiddleware,
   NestModule,
 } from '@nestjs/common';
 l('@nestjs/common');

 import { ConfigModule, ConfigService } from '@nestjs/config';
 l('@nestjs/config');

 import { APP_GUARD } from '@nestjs/core';
 l('@nestjs/core');

 import { GraphQLModule } from '@nestjs/graphql';
 l('@nestjs/graphql');

 import { UserGroupGuard } from './auth/user-group-header.guard';
 l('./auth/user-group-header.guard');

 import { BackendModule } from './backend/backend.module';
 l('./backend/backend.module');

 import Config, { AppConfig } from './config';
 l('./config');

 import { DatabaseModule } from './database/database.module';
 l('./database/database.module');

 import { DatabaseService } from './database/database.service';
 l('./database/database.service');

 import { EventLoggingModule } from './event-logging/event-logging.module';
 l('./event-logging/event-logging.module');

 import { GqlModule } from './gql/gql.module';
 l('./gql/gql.module');

 import { NewslettersModule } from './newsletters/newsletters.module';
 l('./newsletters/newsletters.module');

 import { SubscriptionModule } from './subscriptions/subscriptions.module';
 l('./subscriptions/subscriptions.module');

 import { Request, Response, NextFunction } from 'express';
 l('express');


const version = getVersionInfo(__dirname);

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [(): AppConfig => Config.getProperties()],
      isGlobal: true,
    }),
    BackendModule,
    DatabaseModule,
    EventLoggingModule,
    SubscriptionModule,
    NewslettersModule,
    GqlModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        path: '/graphql',
        useGlobalPrefix: true,
        allowBatchedHttpRequests: true,
        playground: configService.get<string>('env') !== 'production',
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        definitions: {
          path: join(process.cwd(), 'src/graphql.ts'),
        },
        context: ({ req, connection }: any) =>
          createContext({ req, connection }),
        fieldResolverEnhancers: ['guards'],
      }),
    }),
    HealthModule.forRootAsync({
      imports: [DatabaseModule],
      inject: [DatabaseService],
      useFactory: async (db: DatabaseService) => ({
        version,
        extraHealthData: () => db.dbHealthCheck(),
      }),
    }),
    LoggerModule,
  ],
  controllers: [],
  providers: [
    MetricsFactory,
    {
      provide: APP_GUARD,
      useClass: UserGroupGuard,
    },
    SentryPlugin,
    MozLoggerService,
    NotifierSnsFactory,
    NotifierService,
    LegacyStatsDProvider,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}

/**
 * Temporary logger to possibly pinpoint slow response times from our API.
 * Traces should also do this, but this is just a secondary sanity check
 * in case we are missing something, or traces are getting truncated.
 */
@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, path: url } = request;
    const userAgent = request.get('user-agent') || '';

    const start = Date.now();
    const id = Math.random();
    this.logger.debug(`${id}: ${method} ${url} - ${ip}`);

    response.on('close', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');

      this.logger.debug(
        `${id}: ${url} ${statusCode} - ${ip} - contentLength: ${contentLength}, duration: ${
          Date.now() - start
        }`
      );
    });

    next();
  }
}
