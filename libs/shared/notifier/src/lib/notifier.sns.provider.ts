/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { SNS } from 'aws-sdk';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotifierSnsConfig } from './notifier.sns.config';

/**
 * Creates a SNS instance from a config object.
 * @param config
 * @returns A SNS instance
 */
export function setupSns(config: NotifierSnsConfig) {
  const endpoint = config.snsTopicEndpoint;
  const region = config.snsTopicArn.split(':')[3];
  return new SNS({
    region,
    endpoint,
  });
}

/**
 * Factory for providing access to SNS
 */
export const NotifierSnsService = Symbol('NOTIFIER_SNS');
export const NotifierSnsProvider: Provider<SNS> = {
  provide: NotifierSnsService,
  useFactory: (config: NotifierSnsConfig) => {
    if (config == null) {
      throw new Error('Could not locate notifier.sns config');
    }
    const sns = setupSns(config);
    return sns;
  },
  inject: [NotifierSnsConfig],
};

export const LegacyNotifierSnsFactory: Provider<SNS> = {
  provide: NotifierSnsService,
  useFactory: (configService: ConfigService) => {
    const config = configService.get<NotifierSnsConfig>('notifier.sns');
    if (config == null) {
      throw new Error('Could not locate notifier.sns config');
    }
    const sns = setupSns(config);
    return sns;
  },
  inject: [ConfigService],
};
