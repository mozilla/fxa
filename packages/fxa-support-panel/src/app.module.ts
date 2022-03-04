/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HealthModule } from 'fxa-shared/nestjs/health/health.module';
import { LoggerModule } from 'fxa-shared/nestjs/logger/logger.module';
import { SentryModule } from 'fxa-shared/nestjs/sentry/sentry.module';
import { getVersionInfo } from 'fxa-shared/nestjs/version';

import { AppController } from './app/app.controller';
import Config, { AppConfig } from './config';
import { RemoteLookupService } from './remote-lookup/remote-lookup.service';
import { DatabaseModule } from './database/database.module';
import { DatabaseService } from './database/database.service';
import { MetricsFactory } from 'fxa-shared/nestjs/metrics.service';

const version = getVersionInfo(__dirname);

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [(): AppConfig => Config.getProperties()],
      isGlobal: true,
    }),
    DatabaseModule,
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
  controllers: [AppController],
  providers: [RemoteLookupService, MetricsFactory],
})
export class AppModule {}
