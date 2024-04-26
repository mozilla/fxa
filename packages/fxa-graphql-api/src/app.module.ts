/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { HealthModule } from 'fxa-shared/nestjs/health/health.module';
import { MozLoggerService } from '@fxa/shared/mozlog';
import { StatsDFactory } from '@fxa/shared/metrics/statsd';
import { NotifierSnsFactory, NotifierService } from '@fxa/shared/notifier';

import { getVersionInfo } from 'fxa-shared/nestjs/version';

import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';

import { AuthModule } from './auth/auth.module';
import { BackendModule } from './backend/backend.module';
import Config, { AppConfig } from './config';
import { DatabaseModule } from './database/database.module';
import { DatabaseService } from './database/database.service';
import { GqlModule, GraphQLConfigFactory } from './gql/gql.module';
import { ComplexityPlugin } from './backend/complexity.plugin';

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
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
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
  ],
  controllers: [],
  providers: [
    StatsDFactory,
    NotifierSnsFactory,
    NotifierService,
    MozLoggerService,
    ComplexityPlugin,
  ],
})
export class AppModule {}
