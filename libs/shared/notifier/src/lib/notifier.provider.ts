/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LoggerService, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { StatsDService } from '@fxa/shared/metrics/statsd';
import { SNS } from 'aws-sdk';
import { StatsD } from 'hot-shots';
import { NotifierSnsService } from './notifier.sns.provider';
import { NotifierService } from './notifier.service';

export const LegacyNotifierServiceProvider: Provider<NotifierService> = {
  provide: NotifierService,
  useFactory: (
    configService: ConfigService,
    log: LoggerService,
    sns: SNS,
    statsd: StatsD | undefined
  ) => {
    const config = configService.get('notifier.sns');
    if (config == null) {
      throw new Error('Could not locate notifier.sns config');
    }
    return new NotifierService(config, log, sns, statsd);
  },
  inject: [ConfigService, LOGGER_PROVIDER, NotifierSnsService, StatsDService],
};
