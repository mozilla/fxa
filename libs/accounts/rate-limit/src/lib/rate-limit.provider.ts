/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ConfigService } from '@nestjs/config';
import { parseConfigRules, RateLimitConfig } from './config';
import { RateLimit } from './rate-limit';
import Redis, { RedisOptions } from 'ioredis';
import { StatsD, StatsDService } from '@fxa/shared/metrics/statsd';
import { Provider } from '@nestjs/common';

export const RateLimitRedisClient = Symbol('RATE_LIMIT__REDIS_CLIENT');

export const RateLimitRedisProvider: Provider = {
  provide: RateLimitRedisClient,
  useFactory: (config: ConfigService) => {
    const redisConfig = config.get<RedisOptions>('redis');
    if (redisConfig == null) {
      throw new Error('Missing config for redis');
    }

    const redisRateLimitConfig = config.get<RedisOptions>('redis.customs');
    if (redisRateLimitConfig == null) {
      throw new Error('Missing config for redis.customs');
    }

    return new Redis({
      ...redisConfig,
      ...redisRateLimitConfig,
    });
  },
  inject: [ConfigService],
};

export const RateLimitClient = Symbol('RATE_LIMIT_CLIENT');
export const RateLimitProvider = {
  provide: RateLimitClient,
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
  inject: [ConfigService, RateLimitRedisClient, StatsDService],
};
