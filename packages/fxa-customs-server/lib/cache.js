const Memcached = require('memcached');
const { RedisShared } = require('fxa-shared/db/redis');
const P = require('bluebird');
P.promisifyAll(Memcached.prototype);

class Cache {
  constructor(config) {
    const customsRedisConfig = config.redis.customs;
    this.useRedis = customsRedisConfig.enabled;

    if (this.useRedis) {
      this.client = new RedisShared(config.redis.customs);
    } else {
      this.client = new Memcached(config.memcache.address, {
        timeout: 500,
        retries: 1,
        retry: 1000,
        reconnect: 1000,
        idle: 30000,
        namespace: 'fxa~',
      });
    }
  }

  async setAsync(key, value, lifetime) {
    if (this.useRedis) {
      if (lifetime === 0) {
        return this.client.redis.set(key, JSON.stringify(value));
      }
      // Set the value in redis. We use 'EX' to set the expiration time in seconds.
      return this.client.redis.set(key, JSON.stringify(value), 'EX', lifetime);
    }
    return this.client.setAsync(key, value, lifetime);
  }

  async getAsync(key) {
    if (this.useRedis) {
      const value = await this.client.redis.get(key);
      try {
        return JSON.parse(value);
      } catch (err) {
        return {};
      }
    } else {
      return this.client.getAsync(key);
    }
  }
}

module.exports = Cache;
