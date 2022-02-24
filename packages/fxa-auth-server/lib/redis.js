/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { RedisShared } from 'fxa-shared/db/redis';
import { resolve } from 'path';

('use strict');

const hex = require('buf').to.hex;

class FxaRedis extends RedisShared {
  constructor(config) {
    super(config);

    // Applies custom scripts which are turned into methods on
    // the redis object.
    const scriptsDirectory = resolve(__dirname, 'luaScripts');
    this.defineCommands(this.redis, scriptsDirectory);
  }

  /**
   *
   * @param {AccessToken} token
   */
  setAccessToken(token) {
    if (token.ttl < 1) {
      this.log.error('redis', new Error('invalid ttl on access token'));
      return;
    }
    return this.redis.setAccessToken(
      token.userId.toString('hex'),
      token.tokenId.toString('hex'),
      JSON.stringify(token),
      this.recordLimit,
      token.ttl,
      this.maxttl
    );
  }

  /**
   *
   * @param {Buffer | string} id
   * @returns {Promise<boolean>} done
   */
  async removeAccessToken(id) {
    // This does not remove the id from the user's index
    // because getAccessTokens cleans up expired/missing tokens
    const done = await this.redis.removeAccessToken(hex(id));
    return !!done;
  }

  /**
   *
   * @param {Buffer | string} uid
   */
  removeAccessTokensForPublicClients(uid) {
    return this.redis.removeAccessTokensForPublicClients(hex(uid));
  }

  /**
   *
   * @param {Buffer | string} uid
   * @param {Buffer | string} clientId
   */
  removeAccessTokensForUserAndClient(uid, clientId) {
    return this.redis.removeAccessTokensForUserAndClient(
      hex(uid),
      hex(clientId)
    );
  }

  /**
   *
   * @param {Buffer | string} uid
   */
  removeAccessTokensForUser(uid) {
    return this.redis.removeAccessTokensForUser(hex(uid));
  }

  /**
   * @param {Buffer | string} uid
   * @param {Buffer | string} tokenId
   * @param {RefreshTokenMetadata} token
   */
  setRefreshToken(uid, tokenId, token) {
    const p1 = this.redis.setRefreshToken(
      hex(uid),
      hex(tokenId),
      JSON.stringify(token),
      this.recordLimit,
      this.maxttl
    );
    const p2 = this.resolveInMs(p1, this.timeoutMs);
    return Promise.race([p1, p2]);
  }

  /**
   *
   * @param {Buffer | string} uid
   * @param {Buffer | string} tokenId
   */
  async removeRefreshToken(uid, tokenId) {
    const p1 = this.redis.hdel(hex(uid), hex(tokenId));
    const p2 = this.resolveInMs(p1, this.timeoutMs);
    return Promise.race([p1, p2]);
  }

  /**
   *
   * @param {Buffer | string} uid
   */
  removeRefreshTokensForUser(uid) {
    const p1 = this.redis.unlink(hex(uid));
    const p2 = this.resolveInMs(p1, this.timeoutMs);
    return Promise.race([p1, p2]);
  }

  get(key) {
    return this.redis.get(key);
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
  if (!config.enabled) {
    return;
  }
  return new FxaRedis(config, log);
};
module.exports.FxaRedis = FxaRedis;
