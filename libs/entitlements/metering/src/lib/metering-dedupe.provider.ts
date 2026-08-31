/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Provider } from '@nestjs/common';
import Redis from 'ioredis';

import { MeteringRedisConfig } from './metering-redis.config';

export const MeteringDedupeRedisClient = Symbol('METERING_DEDUPE_REDIS_CLIENT');

export const MeteringDedupeRedisClientProvider: Provider<Redis.Redis> = {
  provide: MeteringDedupeRedisClient,
  useFactory: (config: MeteringRedisConfig) => {
    return new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      keyPrefix: config.keyPrefix,
      connectTimeout: config.connectTimeoutMs,
      commandTimeout: config.commandTimeoutMs,
      ...(config.tls ? { tls: {} } : {}),
    });
  },
  inject: [MeteringRedisConfig],
};
