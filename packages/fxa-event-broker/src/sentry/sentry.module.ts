/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { SentryService } from './sentry.service';

@Module({
  imports: [ConfigModule],
  providers: [SentryService],
})
export class SentryModule {}
