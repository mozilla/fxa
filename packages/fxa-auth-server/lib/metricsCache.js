/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { RedisShared } = require('fxa-shared/db/redis');
const { Container } = require('typedi');
const { AuthLogger } = require('./types');
const { StatsD } = require('hot-shots');

function resolveLogger() {
  if (Container.has(AuthLogger)) {
    return Container.get(AuthLogger);
  }
}
function resolveMetrics() {
  if (Container.has(StatsD)) {
    return Container.get(StatsD);
  }
}

export class MetricsRedis extends RedisShared {
  constructor(config) {
    super(config.redis.metrics, resolveLogger(), resolveMetrics());
    this.enabled = config.redis?.metrics?.enabled || false;
    this.config = config;
    this.prefix = config.redis?.metrics?.prefix || 'metrics:';
    this.lifetime = config.redis?.metrics?.lifetime || 7200;
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
  async add(key, data) {
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
  async del(key) {
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
  async get(key) {
    if (!this.enabled) {
      return {};
    }

    try {
      const value = await this.redis.get(key);
      return JSON.parse(value);
    } catch (err) {
      return {};
    }
  }
}
