/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StatsD } from 'hot-shots';
import { StatsDConfig } from './statsd.config';

export const StatsDService = Symbol('STATSD');

export const StatsDProvider: Provider<StatsD> = {
  provide: StatsDService,
  useFactory: (config: StatsDConfig) => {
    if (config.host === '') {
      return new StatsD({ mock: true });
    }
    return new StatsD(config);
  },
  inject: [StatsDConfig],
};

/**
 * Can be used to satisfy DI when unit testing things that should not need
 * statsd.
 * Note: this will cause errors to be thrown if statsd is used
 */
export const MockStatsDProvider: Provider<StatsD> = {
  provide: StatsDService,
  useFactory: () => {
    return {
      increment: () => {},
      timing: () => {},
    } as unknown as StatsD;
  },
};

export const LegacyStatsDProvider: Provider<StatsD> = {
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
