/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthModule } from 'fxa-shared/nestjs/health/health.module';
// TODO: FXA-9967 Point this at @fxa/shared/logs
import { LoggerModule } from 'fxa-shared/nestjs/logger/logger.module';
import { MetricsFactory } from 'fxa-shared/nestjs/metrics.service';
import { SentryModule } from 'fxa-shared/nestjs/sentry/sentry.module';
import { getVersionInfo } from 'fxa-shared/nestjs/version';

import { AuthModule } from './auth/auth.module';
import { ClientCapabilityModule } from './client-capability/client-capability.module';
import { ClientWebhooksModule } from './client-webhooks/client-webhooks.module';
import Config, { AppConfig } from './config';
import { FirestoreModule } from './firestore/firestore.module';
import { JwtsetModule } from './jwtset/jwtset.module';
import { PubsubProxyModule } from './pubsub-proxy/pubsub-proxy.module';
import { QueueworkerModule } from './queueworker/queueworker.module';

const version = getVersionInfo(__dirname);

@Module({
  imports: [
    AuthModule,
    ClientCapabilityModule,
    ClientWebhooksModule,
    ConfigModule.forRoot({
      load: [(): AppConfig => Config.getProperties()],
      isGlobal: true,
    }),
    LoggerModule,
    FirestoreModule,
    HealthModule.register({ version }),
    JwtsetModule,
    ScheduleModule.forRoot(),
    SentryModule.forRootAsync({
      imports: [ConfigModule, LoggerModule],
      inject: [ConfigService, LoggerModule],
      useFactory: (configService: ConfigService<AppConfig>) => ({
        sentryConfig: {
          sentry: configService.get('sentry'),
          version: version.version,
        },
      }),
    }),
    QueueworkerModule,
    PubsubProxyModule,
  ],
  controllers: [],
  providers: [MetricsFactory],
})
export class AppModule {}
