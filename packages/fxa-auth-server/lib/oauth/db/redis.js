/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const config = require('../../../config');
const logger = require('../logging')('db');
const redis = require('../../redis');

// These are used only in type declarations.
// eslint-disable-next-line no-unused-vars
const AccessToken = require('./accessToken');
// eslint-disable-next-line no-unused-vars
const RefreshTokenMetadata = require('./refreshTokenMetadata');

// We store both access token and refresh token data in redis, separated
// into two namespaces by using the "key prefix" feature of our  redis library.
// Unfortunately, the key prefix is a connection-level setting, meaning that
// we need to use a separate connection for each type of data.
//
// This is a little wrapper class to present the separate access-token and
// refresh-token connections as a single conceptual "oauth redis db", in order
// to keep the calling code a bit simpler.

class OauthRedis {
  constructor() {
    this.redisAccessTokens = redis(
      {
        ...config.get('redis.accessTokens'),
        enabled: true,
        maxttl: config.get('oauthServer.expiration.accessToken'),
      },
      logger
    );
    this.redisRefreshTokens = redis(config.get('redis.refreshTokens'), logger);
  }

  async close() {
    await this.redisAccessTokens.close();
    await this.redisRefreshTokens.close();
  }

  /**
   *
   * @param {Buffer | string} tokenId
   * @return {Promise<AccessToken>}
   */
  async getAccessToken(tokenId) {
    return this.redisAccessTokens.getAccessToken(tokenId);
  }

  /**
   *
   * @param {Buffer | string} uid
   * @return {Promise<AccessToken[]>}
   */
  async getAccessTokens(uid) {
    return this.redisAccessTokens.getAccessTokens(uid);
  }

  /**
   *
   * @param {AccessToken} token
   */
  setAccessToken(token) {
    return this.redisAccessTokens.setAccessToken(token);
  }

  /**
   *
   * @param {Buffer | string} id
   * @returns {Promise<boolean>} done
   */
  async removeAccessToken(id) {
    return this.redisAccessTokens.removeAccessToken(id);
  }

  /**
   *
   * @param {Buffer | string} uid
   */
  removeAccessTokensForPublicClients(uid) {
    return this.redisAccessTokens.removeAccessTokensForPublicClients(uid);
  }

  /**
   *
   * @param {Buffer | string} uid
   * @param {Buffer | string} clientId
   */
  removeAccessTokensForUserAndClient(uid, clientId) {
    return this.redisAccessTokens.removeAccessTokensForUserAndClient(
      uid,
      clientId
    );
  }

  /**
   *
   * @param {Buffer | string} uid
   */
  removeAccessTokensForUser(uid) {
    return this.redisAccessTokens.removeAccessTokensForUser(uid);
  }

  /**
   *
   * @param {Buffer | string} uid
   * @param {Buffer | string} tokenId
   * @return {Promise<RefreshTokenMetadata>}
   */
  async getRefreshToken(uid, tokenId) {
    if (!this.redisRefreshTokens) {
      return null;
    }
    return this.redisRefreshTokens.getRefreshToken(uid, tokenId);
  }

  /**
   *
   * @param {Buffer | string} uid
   * @return {Promise<{[key: string]: RefreshTokenMetadata}>}
   */
  async getRefreshTokens(uid) {
    if (!this.redisRefreshTokens) {
      return {};
    }
    return this.redisRefreshTokens.getRefreshTokens(uid);
  }

  /**
   * @param {Buffer | string} uid
   * @param {Buffer | string} tokenId
   * @param {RefreshTokenMetadata} token
   */
  setRefreshToken(uid, tokenId, token) {
    if (!this.redisRefreshTokens) {
      return null;
    }
    return this.redisRefreshTokens.setRefreshToken(uid, tokenId, token);
  }

  /**
   *
   * @param {Buffer | string} uid
   * @param {Buffer | string} token
   * @returns {Promise<boolean>} done
   */
  async removeRefreshToken(uid, token) {
    if (!this.redisRefreshTokens) {
      return null;
    }
    return this.redisRefreshTokens.removeRefreshToken(uid, token);
  }

  /**
   *
   * @param {Buffer | string} uid
   */
  removeRefreshTokensForUser(uid) {
    if (!this.redisRefreshTokens) {
      return null;
    }
    return this.redisRefreshTokens.removeRefreshTokensForUser(uid);
  }

  /**
   *
   * @param {Buffer | string} uid
   * @param {(Buffer | string)[]} tokenIdsToPrune
   */
  pruneRefreshTokens(uid, tokenIdsToPrune) {
    if (!this.redisRefreshTokens) {
      return null;
    }
    return this.redisRefreshTokens.pruneRefreshTokens(uid, tokenIdsToPrune);
  }
}

module.exports = () => {
  return new OauthRedis();
};
