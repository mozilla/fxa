/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StatsD } from 'hot-shots';

export const StatsDService = Symbol('STATSD');
export const StatsDFactory: Provider<StatsD> = {
  provide: StatsDService,
  useFactory: (configService: ConfigService) => {
    const config = configService.get('metrics');
    if (config.host === '') {
      return new StatsD({ mock: true });
    }
    return new StatsD(config);
  },
  inject: [ConfigService],
};

/**
 * Can be used to satisfy DI when unit testing things that should not need
 * statsd.
 * Note: this will cause errors to be thrown if statsd is used
 */
export const MockStatsDFactory: Provider<StatsD> = {
  provide: StatsDService,
  useFactory: () => {
    return {} as StatsD;
  },
};
