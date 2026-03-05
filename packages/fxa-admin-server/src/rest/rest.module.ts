/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LegacyStatsDProvider } from '@fxa/shared/metrics/statsd';
import { MozLoggerService } from '@fxa/shared/mozlog';
import {
  LegacyNotifierServiceProvider,
  LegacyNotifierSnsFactory,
} from '@fxa/shared/notifier';
import { Module } from '@nestjs/common';
import { BackendModule } from '../backend/backend.module';
import { DatabaseModule } from '../database/database.module';
import { EventLoggingModule } from '../event-logging/event-logging.module';
import { NewslettersModule } from '../newsletters/newsletters.module';
import { SubscriptionModule } from '../subscriptions/subscriptions.module';
import { AccountController } from './account/account.controller';
import { EmailBounceController } from './email-bounce/email-bounce.controller';
import { RelyingPartyController } from './relying-party/relying-party.controller';
import { RateLimitingController } from './rate-limiting/rate-limiting.controller';
import {
  RateLimitProvider,
  RateLimitRedisProvider,
} from '@fxa/accounts/rate-limit';
import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { CartModule } from './cart.module';

@Module({
  imports: [
    DatabaseModule,
    SubscriptionModule,
    EventLoggingModule,
    BackendModule,
    NewslettersModule,
    CartModule,
  ],
  controllers: [
    AccountController,
    EmailBounceController,
    RateLimitingController,
    RelyingPartyController,
  ],
  providers: [
    RateLimitProvider,
    RateLimitRedisProvider,
    LegacyStatsDProvider,
    LegacyNotifierServiceProvider,
    LegacyNotifierSnsFactory,
    MozLoggerService,
    {
      provide: LOGGER_PROVIDER,
      useClass: MozLoggerService,
    },
  ],
})
export class RestModule {}
