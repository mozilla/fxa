/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { EventLoggingModule } from '../event-logging/event-logging.module';
import { SubscriptionModule } from '../subscriptions/subscriptions.module';
import { AccountResolver } from './account/account.resolver';
import { EmailBounceResolver } from './email-bounce/email-bounce.resolver';
import { RelyingPartyResolver } from './relying-party/relying-party.resolver';
import { BackendModule } from '../backend/backend.module';
import { NewslettersModule } from '../newsletters/newsletters.module';
import { NotifierService, NotifierSnsFactory } from '@fxa/shared/notifier';
import { MozLoggerService } from '@fxa/shared/mozlog';
import { LegacyStatsDProvider } from '@fxa/shared/metrics/statsd';

@Module({
  imports: [
    DatabaseModule,
    SubscriptionModule,
    EventLoggingModule,
    BackendModule,
    NewslettersModule,
  ],
  providers: [
    AccountResolver,
    EmailBounceResolver,
    LegacyStatsDProvider,
    NotifierSnsFactory,
    NotifierService,
    MozLoggerService,
    RelyingPartyResolver,
  ],
})
export class GqlModule {}
