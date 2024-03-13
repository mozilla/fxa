/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AccountTasksFactory,
  AccountTasks,
  DeleteAccountCloudTaskConfig,
} from '@fxa/shared/cloud-tasks';
import { StatsD } from 'hot-shots';

export type CloudTasks = {
  accountTasks: AccountTasks;
};

export const CloudTasksService = Symbol('CLOUDTASKS');

export const CloudTasksFactory: Provider<{ accountTasks: any }> = {
  provide: CloudTasksService,
  useFactory: (configService: ConfigService, statsd: StatsD) => {
    const config = {
      cloudTasks: configService.get('cloudTasks'),
    } as DeleteAccountCloudTaskConfig;

    if (!configService) {
      throw new Error('Missing Config service');
    }

    if (!statsd) {
      throw new Error('Missing StatsD');
    }

    const accountTasks = AccountTasksFactory(config, statsd);
    return {
      accountTasks,
    };
  },
  inject: [ConfigService, 'METRICS'],
};
