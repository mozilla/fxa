/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import { RedisShared, Config as RedisSharedConfig } from 'fxa-shared/db/redis';
import { Container } from 'typedi';
import { AuthLogger } from './types';
import { StatsD } from 'hot-shots';

function resolveLogger() {
  if (Container.has(AuthLogger)) {
    return Container.get(AuthLogger);
  }
  return;
}
function resolveMetrics() {
  if (Container.has(StatsD)) {
    return Container.get(StatsD);
  }
  return;
}

export type MetricsRedisConfig = {
  redis: {
    metrics: RedisSharedConfig & {
      lifetime: number;
    };
  };
};

export class MetricsRedis extends RedisShared {
  private enabled: boolean;
  private lifetime: number;
  private prefix: string;

  constructor(config: MetricsRedisConfig) {
    super(config.redis.metrics, resolveLogger(), resolveMetrics());
    this.enabled = config.redis.metrics.enabled || false;
    // TBD - Assigned but not used?
    this.prefix = config.redis.metrics.prefix || 'metrics:';
    this.lifetime = config.redis.metrics.lifetime || 7200;
  }

  /**
   * Add data to the cache, keyed by a string.
   * If the key already exists,
   * the call will fail.
   *
   * Fails silently if the cache is not enabled.
   *
   * @param {string} key
   * @param data
   */
  async add(key: string, data: any) {
    if (!this.enabled) {
      return;
    }

    const result = await this.redis.exists(key);
    if (result === 1) {
      throw Error('Key already exists');
    }

    // Set the value in redis. We use 'EX' to set the expiration time in seconds.
    return this.redis.set(key, JSON.stringify(data), 'EX', this.lifetime);
  }

  /**
   * Delete data from the cache, keyed by a string.
   *
   * Fails silently if the cache is not enabled.
   *
   * @param {string} key
   */
  async del(key: string) {
    if (!this.enabled) {
      return;
    }

    return this.redis.del(key);
  }

  /**
   * Fetch data from the cache, keyed by a string.
   *
   * @param {string} key
   */
  async get(key: string) {
    if (!this.enabled) {
      return {};
    }

    try {
      const value = await this.redis.get(key);
      return JSON.parse(value || '{}');
    } catch (err) {
      return {};
    }
  }
}
