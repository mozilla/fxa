/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Module } from '@nestjs/common';
import { LegacyStatsDProvider } from '@fxa/shared/metrics/statsd';
import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { CustomsService } from './customs.service';
import {
  RateLimitProvider,
  RateLimitRedisProvider,
} from '@fxa/accounts/rate-limit';
import { MozLoggerService } from '@fxa/shared/mozlog';

@Module({
  providers: [
    CustomsService,
    RateLimitRedisProvider,
    RateLimitProvider,
    MozLoggerService,
    LegacyStatsDProvider,
    {
      provide: LOGGER_PROVIDER,
      useClass: MozLoggerService,
    },
  ],
  exports: [CustomsService],
})
export class CustomsModule {}
