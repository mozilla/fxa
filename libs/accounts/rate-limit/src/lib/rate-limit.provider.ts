/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ConfigService } from '@nestjs/config';
import { parseConfigRules, RateLimitConfig } from './config';
import { RateLimit } from './rate-limit';
import Redis from 'ioredis';
import { StatsD } from 'hot-shots';
import { Provider } from '@nestjs/common';


export const RATE_LIMIT_REDIS_CLIENT = 'RATE_LIMIT__REDIS_CLIENT';
export const RateLimitRedisProvider: Provider = {
  provide: RATE_LIMIT_REDIS_CLIENT,
  useFactory: (config: ConfigService) => {
    const redisConfig = config.get<any>('redis');
    if (redisConfig == null) {
      throw new Error('Missing config for redis');
    }

    const redisRateLimitConfig = config.get<any>('redis.customs');
    if (redisRateLimitConfig == null) {
      throw new Error('Missing config for redis.customs');
    }

    return new Redis({
      ...config.get<any>('redis'),
      ...config.get<any>('redis.customs'),
    });
  },
};

export const RATE_LIMIT_CLIENT = 'RATE_LIMIT_CLIENT';
export const RateLimitProvider = {
  provide: RATE_LIMIT_CLIENT,
  useFactory: (config: ConfigService, redis: Redis.Redis, statsd: StatsD) => {
    const rateLimitConfig = config.get<RateLimitConfig>('rateLimit');
    if (rateLimitConfig == null) {
      throw new Error('Missing rateLimit config');
    }

    const rules = parseConfigRules(rateLimitConfig.rules);
    return new RateLimit(
      {
        rules,
        ignoreEmails: rateLimitConfig.ignoreEmails,
        ignoreIPs: rateLimitConfig.ignoreIPs,
        ignoreUIDs: rateLimitConfig.ignoreUIDs,
      },
      redis,
      statsd
    );
  },
  inject: [RATE_LIMIT_REDIS_CLIENT],
};
