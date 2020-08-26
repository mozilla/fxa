/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { AuthModule } from './auth/auth.module';
import { ClientCapabilityModule } from './client-capability/client-capability.module';
import { ClientWebhooksModule } from './client-webhooks/client-webhooks.module';
import Config, { AppConfig } from './config';
import { FirestoreModule } from './firestore/firestore.module';
import { HealthModule } from './health/health.module';
import { JwtsetModule } from './jwtset/jwtset.module';
import { LoggerModule } from './logger/logger.module';
import { MetricsFactory } from './metrics.service';
import { PubsubProxyModule } from './pubsub-proxy/pubsub-proxy.module';
import { QueueworkerModule } from './queueworker/queueworker.module';
import { SentryModule } from './sentry/sentry.module';

@Module({
  imports: [
    AuthModule,
    ClientCapabilityModule,
    ClientWebhooksModule,
    ConfigModule.forRoot({
      load: [(): AppConfig => Config.getProperties()],
      isGlobal: true,
    }),
    FirestoreModule,
    HealthModule,
    JwtsetModule,
    LoggerModule,
    ScheduleModule.forRoot(),
    SentryModule,
    QueueworkerModule,
    PubsubProxyModule,
  ],
  controllers: [],
  providers: [MetricsFactory],
})
export class AppModule {}
