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
import { AccountResolver } from './account/account.resolver';
import { EmailBounceResolver } from './email-bounce/email-bounce.resolver';
import { RelyingPartyResolver } from './relying-party/relying-party.resolver';
import { RateLimitingResolver } from './rate-limiting/rate-limiting.resolver';
import {
  RateLimitProvider,
  RateLimitRedisProvider,
} from '@fxa/accounts/rate-limit';
import { APP_FILTER } from '@nestjs/core';
import { SentryGlobalFilter } from '@sentry/nestjs/setup';
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
  providers: [
    AccountResolver,
    EmailBounceResolver,
    RateLimitingResolver,
    RateLimitProvider,
    RateLimitRedisProvider,
    LegacyStatsDProvider,
    LegacyNotifierServiceProvider,
    LegacyNotifierSnsFactory,
    MozLoggerService,
    {
      // Note, the 'NotifierService, requires that 'LOGGER_PROVIDER' be injected.
      //       At the time of writing, it takes any valid LoggerService, and the
      //       MozLoggerService extends LoggerService, so this will suffice...
      provide: LOGGER_PROVIDER,
      useClass: MozLoggerService,
    },
    RelyingPartyResolver,
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
  ],
})
export class GqlModule {}
