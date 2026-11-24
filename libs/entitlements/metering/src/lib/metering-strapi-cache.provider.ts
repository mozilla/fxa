/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { OnApplicationShutdown, Provider } from '@nestjs/common';
import type { CacheClient } from '@type-cacheable/core';
import { IoRedisAdapter } from '@type-cacheable/ioredis-adapter';
import Redis from 'ioredis';

import { StrapiRemoteCacheClient } from '@fxa/shared/cms';

import { MeteringRedisConfig } from './metering-redis.config';

export class MeteringStrapiCacheClient
  extends IoRedisAdapter
  implements OnApplicationShutdown
{
  constructor(private readonly redis: Redis) {
    super(redis);
  }

  async onApplicationShutdown(): Promise<void> {
    try {
      await this.redis.quit();
    } catch {
      this.redis.disconnect();
    }
  }
}

export const MeteringStrapiCacheClientProvider: Provider<CacheClient> = {
  provide: StrapiRemoteCacheClient,
  useFactory: (config: MeteringRedisConfig) => {
    return new MeteringStrapiCacheClient(
      new Redis({
        host: config.host,
        port: config.port,
        password: config.password,
        keyPrefix: 'metering:cms:',
        connectTimeout: config.connectTimeoutMs,
        commandTimeout: config.commandTimeoutMs,
        ...(config.tls ? { tls: {} } : {}),
      })
    );
  },
  inject: [MeteringRedisConfig],
};
