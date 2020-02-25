/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const unique = require('../unique');
const encrypt = require('../encrypt');
const config = require('../../../config');
const MAX_TTL = config.get('oauthServer.expiration.accessToken');
const ScopeSet = require('../../../../fxa-shared').oauth.scopes;

class AccessToken {
  constructor(
    clientId,
    name,
    canGrant,
    publicClient,
    userId,
    email,
    scope,
    token,
    createdAt,
    profileChangedAt,
    expiresAt,
    ttl
  ) {
    /** @type {Buffer} */
    this.clientId = clientId;
    /** @type {string} */
    this.name = name;
    /** @type {boolean} */
    this.canGrant = canGrant;
    /** @type {boolean} */
    this.publicClient = publicClient;
    /** @type {Buffer} */
    this.userId = userId;
    /** @type {string} */
    this.email = email;
    /** @type {ScopeSet} */
    this.scope = scope;
    /** @type {Buffer} */
    this.token = token || unique.token();
    /** @type {Date} */
    this.createdAt = createdAt || new Date(new Date().setMilliseconds(0));
    /** @type {number} */
    this.profileChangedAt = profileChangedAt || 0;
    /** @type {Date} */
    this.expiresAt =
      expiresAt || new Date(Date.now() + (ttl * 1000 || MAX_TTL));
    /** @type {Buffer} */
    this.tokenId = encrypt.hash(this.token);
    this.type = 'bearer';
  }

  get clientCanGrant() {
    return this.canGrant;
  }

  get clientName() {
    return this.name;
  }

  get ttl() {
    return this.expiresAt.getTime() - Date.now();
  }

  get lastAccessTime() {
    return this.createdAt;
  }

  get id() {
    return this.clientId;
  }

  /**
   *
   * @returns {object}
   */
  toJSON() {
    return {
      clientId: this.clientId.toString('hex'),
      name: this.name,
      canGrant: this.canGrant,
      publicClient: this.publicClient,
      userId: this.userId.toString('hex'),
      email: this.email,
      scope: this.scope.toString(),
      createdAt: this.createdAt.getTime(),
      profileChangedAt: this.profileChangedAt,
      expiresAt: this.expiresAt.getTime(),
      token: this.token.toString('hex'),
    };
  }

  /**
   *
   * @param {string} string
   * @returns {AccessToken}
   */
  static parse(string) {
    const json = JSON.parse(string);
    return new AccessToken(
      Buffer.from(json.clientId, 'hex'),
      json.name,
      json.canGrant,
      json.publicClient,
      Buffer.from(json.userId, 'hex'),
      json.email,
      ScopeSet.fromString(json.scope),
      Buffer.from(json.token, 'hex'),
      new Date(json.createdAt),
      json.profileChangedAt,
      new Date(json.expiresAt)
    );
  }
}

module.exports = AccessToken;
