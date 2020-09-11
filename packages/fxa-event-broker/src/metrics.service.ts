/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StatsD } from 'hot-shots';

import { AppConfig } from './config';

export const MetricsFactory: Provider<StatsD> = {
  provide: 'METRICS',
  useFactory: (configService: ConfigService<AppConfig>) => {
    const config = configService.get('metrics') as AppConfig['metrics'];
    if (config.host === '') {
      return new StatsD({ mock: true });
    }
    return new StatsD(config);
  },
  inject: [ConfigService],
};
