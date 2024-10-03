/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { MozLoggerService } from '@fxa/shared/mozlog';
import { Module } from '@nestjs/common';
import { MetricsFactory } from 'fxa-shared/nestjs/metrics.service';
import { DatabaseService } from './database.service';

@Module({
  providers: [
    DatabaseService,
    {
      provide: LOGGER_PROVIDER,
      useClass: MozLoggerService,
    },
    MetricsFactory,
  ],
  exports: [DatabaseService],
})
export class DatabaseModule {}
