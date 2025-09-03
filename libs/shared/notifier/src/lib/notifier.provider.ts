/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ConfigService } from '@nestjs/config';
import { Provider } from '@nestjs/common';
import { StatsDService } from '@fxa/shared/metrics/statsd';
import { SNS } from '@aws-sdk/client-sns';
import { StatsD } from 'hot-shots';
import { NotifierSnsService } from './notifier.sns.provider';
import { NotifierService } from './notifier.service';
import { MozLoggerService } from '@fxa/shared/mozlog';

export const LegacyNotifierServiceProvider: Provider<NotifierService> = {
  provide: NotifierService,
  useFactory: (
    configService: ConfigService,
    log: MozLoggerService,
    sns: SNS,
    statsd: StatsD | undefined
  ) => {
    const config = configService.get('notifier.sns');
    if (config == null) {
      throw new Error('Could not locate notifier.sns config');
    }
    return new NotifierService(config, log, sns, statsd);
  },
  inject: [ConfigService, MozLoggerService, NotifierSnsService, StatsDService],
};
