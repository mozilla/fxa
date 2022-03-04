/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { HealthModule } from 'fxa-shared/nestjs/health/health.module';
import { LoggerModule } from 'fxa-shared/nestjs/logger/logger.module';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';
import { SentryModule } from 'fxa-shared/nestjs/sentry/sentry.module';
import { MetricsFactory } from 'fxa-shared/nestjs/metrics.service';
import { getVersionInfo } from 'fxa-shared/nestjs/version';

import { AuthModule } from './auth/auth.module';
import { BackendModule } from './backend/backend.module';
import Config, { AppConfig } from './config';
import { DatabaseModule } from './database/database.module';
import { DatabaseService } from './database/database.service';
import { GqlModule, GraphQLConfigFactory } from './gql/gql.module';

const version = getVersionInfo(__dirname);

@Module({
  imports: [
    AuthModule,
    BackendModule,
    ConfigModule.forRoot({
      load: [(): AppConfig => Config.getProperties()],
      isGlobal: true,
    }),
    DatabaseModule,
    GqlModule,
    GraphQLModule.forRootAsync({
      imports: [ConfigModule, LoggerModule, SentryModule],
      inject: [ConfigService, MozLoggerService],
      useFactory: GraphQLConfigFactory,
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
    SentryModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig>) => ({
        dsn: configService.get('sentryDsn'),
        environment: configService.get('env'),
        release: version.version,
      }),
    }),
  ],
  controllers: [],
  providers: [MetricsFactory],
})
export class AppModule {}
