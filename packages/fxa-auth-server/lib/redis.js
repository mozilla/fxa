/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
const { RedisShared } = require('fxa-shared/db/redis');
const { resolve } = require('path');
const { AuthLogger } = require('./types');
const { Container } = require('typedi');
const { StatsD } = require('hot-shots');
const opentelemetry = require('@opentelemetry/api');

('use strict');

const tracer = opentelemetry.trace.getTracer('redis-tracer');
const hex = require('buf').to.hex;

function resolveLogger() {
  if (Container.has(AuthLogger)) return Container.get(AuthLogger);
}
function resolveMetrics() {
  if (Container.has(StatsD)) {
    return Container.get(StatsD);
  }
}

class FxaRedis extends RedisShared {
  constructor(config) {
    super(config, resolveLogger(), resolveMetrics());

    // Applies custom scripts which are turned into methods on
    // the redis object.
    const scriptsDirectory = resolve(__dirname, 'luaScripts');
    this.defineCommands(this.redis, scriptsDirectory);
  }

  /**
   *
   * @param {AccessToken} token
   */
  async setAccessToken(token) {
    if (token.ttl < 1) {
      this.log.error('redis', new Error('invalid ttl on access token'));
      return;
    }
    this.metrics?.increment('redis.setAccessToken');
    const span = tracer.startSpan('redis.setAccessToken');
    const value = JSON.stringify(token);
    const result = await this.redis.setAccessToken(
      token.userId.toString('hex'),
      token.tokenId.toString('hex'),
      value,
      this.recordLimit,
      token.ttl,
      this.maxttl
    );
    span.end();
    return result;
  }

  /**
   *
   * @param {Buffer | string} id
   * @returns {Promise<boolean>} done
   */
  async removeAccessToken(id) {
    this.metrics?.increment('redis.removeAccessToken');
    const span = tracer.startSpan('redis.removeAccessToken');
    // This does not remove the id from the user's index
    // because getAccessTokens cleans up expired/missing tokens
    const done = await this.redis.removeAccessToken(hex(id));
    span.end();
    return !!done;
  }

  /**
   *
   * @param {Buffer | string} uid
   */
  async removeAccessTokensForPublicClients(uid) {
    this.metrics?.increment('redis.removeAccessTokensForPublicClients');
    const span = tracer.startSpan('redis.removeAccessTokensForPublicClients');
    const result = await this.redis.removeAccessTokensForPublicClients(
      hex(uid)
    );
    span.end();
    return result;
  }

  /**
   *
   * @param {Buffer | string} uid
   * @param {Buffer | string} clientId
   */
  async removeAccessTokensForUserAndClient(uid, clientId) {
    this.metrics?.increment('redis.removeAccessTokensForUserAndClient');
    const span = tracer.startSpan('redis.removeAccessTokensForUserAndClient');
    const result = await this.redis.removeAccessTokensForUserAndClient(
      hex(uid),
      hex(clientId)
    );
    span.end();
    return result;
  }

  /**
   *
   * @param {Buffer | string} uid
   */
  async removeAccessTokensForUser(uid) {
    this.metrics?.increment('redis.removeAccessTokensForUser');
    const span = tracer.startSpan('redis.removeAccessTokensForUser');
    const result = await this.redis.removeAccessTokensForUser(hex(uid));
    span.end();
    return result;
  }

  /**
   * @param {Buffer | string} uid
   * @param {Buffer | string} tokenId
   * @param {RefreshTokenMetadata} token
   */
  async setRefreshToken(uid, tokenId, token) {
    this.metrics?.increment('redis.setRefreshToken');
    const span = tracer.startSpan('redis.setRefreshToken');
    const p1 = this.redis.setRefreshToken(
      hex(uid),
      hex(tokenId),
      JSON.stringify(token),
      this.recordLimit,
      this.maxttl
    );
    const p2 = this.resolveInMs(p1, this.timeoutMs);
    const result = await Promise.race([p1, p2]);
    span.end();
    return result;
  }

  /**
   *
   * @param {Buffer | string} uid
   * @param {Buffer | string} tokenId
   */
  async removeRefreshToken(uid, tokenId) {
    this.metrics?.increment('redis.removeRefreshToken');
    const span = await tracer.startSpan('redis.removeRefreshToken');
    const p1 = this.redis.hdel(hex(uid), hex(tokenId));
    const p2 = this.resolveInMs(p1, this.timeoutMs);
    const result = await Promise.race([p1, p2]);
    span.end();
    return result;
  }

  /**
   *
   * @param {Buffer | string} uid
   */
  async removeRefreshTokensForUser(uid) {
    this.metrics?.increment('redis.removeRefreshTokensForUser');
    const span = tracer.startSpan('redis.removeRefreshTokensForUser');
    const p1 = this.redis.unlink(hex(uid));
    const p2 = this.resolveInMs(p1, this.timeoutMs);
    const result = await Promise.race([p1, p2]);
    span.end();
    return result;
  }

  async get(key) {
    this.metrics?.increment('redis.get');
    const span = tracer.startSpan('redis.get');
    const result = await this.redis.get(key);

    if (result?.length > 0) {
      span.setAttribute('redis.get.size', result.length);
      this.metrics?.histogram('redis.get.size', result.length);
    }
    span.end();
    return result;
  }

  set(key, val, ...args) {
    return this.redis.set(key, val, ...args);
  }
  zadd(key, ...args) {
    return this.redis.zadd(key, ...args);
  }
  zrange(key, start, stop, withScores) {
    if (withScores) {
      return this.redis.zrange(key, start, stop, 'WITHSCORES');
    }
    return this.redis.zrange(key, start, stop);
  }
  zrangebyscore(key, min, max) {
    return this.redis.zrangebyscore(key, min, max);
  }
  zrem(key, ...members) {
    return this.redis.zrem(key, members);
  }
  zrevrange(key, start, stop) {
    return this.redis.zrevrange(key, start, stop);
  }
  zrevrangebyscore(key, min, max) {
    return this.redis.zrevrangebyscore(key, min, max);
  }
  zrank(key, member) {
    return this.redis.zrank(key, member);
  }

  keys(key) {
    return this.redis.keys(key);
  }

  async zpoprangebyscore(key, min, max) {
    const args = Array.from(arguments);
    const results = await this.redis
      .multi()
      .zrangebyscore(...args)
      .zremrangebyscore(key, min, max)
      .exec();
    return results[0][1];
  }
}

module.exports = (config, log) => {
  log = log || resolveLogger();

  if (!config) {
    log?.warn('redis', {
      msg: `No redis config provided`,
      stack: Error().stack,
    });
    return;
  }
  if (!config.enabled) {
    log?.warn('redis', {
      msg: `Redis not enabled, config.enabled:${config?.enabled} `,
      stack: Error().stack,
    });
    return;
  }

  // Sanity check
  if (!config.host || !config.port) {
    log?.warn('redis', {
      msg: `No redis host/port defined, config.host:${config?.host} config.port:${config?.port}`,
      stack: Error().stack,
    });
  }

  return new FxaRedis(config, log);
};

// module.exports.FxaRedis = FxaRedis;
