/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { RedisShared } = require('fxa-shared/db/redis');

class Cache {
  constructor(config) {
    this.client = new RedisShared(config.redis.customs);
  }

  async setAsync(key, value, lifetime) {
    if (lifetime === 0) {
      return this.client.redis.set(key, JSON.stringify(value));
    }
    // Set the value in redis. We use 'EX' to set the expiration time in seconds.
    return this.client.redis.set(key, JSON.stringify(value), 'EX', lifetime);
  }

  async getAsync(key) {
    const value = await this.client.redis.get(key);
    try {
      return JSON.parse(value);
    } catch (err) {
      return {};
    }
  }

  async getMultiAsync(keys) {
    const values = await this.client.redis.mget(keys);
    return values.map((value) => {
      try {
        return JSON.parse(value);
      } catch (err) {
        return {};
      }
    });
  }
}

module.exports = Cache;
