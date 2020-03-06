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
    tokenId,
    clientId,
    name,
    canGrant,
    publicClient,
    userId,
    email,
    scope,
    createdAt,
    profileChangedAt,
    expiresAt,
    token
  ) {
    /** @type {Buffer} */
    this.tokenId = tokenId;
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
    /** @type {Date} */
    this.createdAt = createdAt;
    /** @type {number} */
    this.profileChangedAt = profileChangedAt;
    /** @type {Date} */
    this.expiresAt = expiresAt;
    /** @type {Buffer} this won't be proided unless we're creating a brand new token */
    this.token = token || null;
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

  /**
   *
   * @returns {object}
   */
  toJSON() {
    return {
      tokenId: this.tokenId.toString('hex'),
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
    };
  }

  static generate(
    clientId,
    name,
    canGrant,
    publicClient,
    userId,
    email,
    scope,
    profileChangedAt,
    expiresAt,
    ttl
  ) {
    const token = unique.token();
    const tokenId = encrypt.hash(token);
    return new AccessToken(
      tokenId,
      clientId,
      name,
      canGrant,
      publicClient,
      userId,
      email,
      scope,
      // Truncated createdAt to the second to match mysql
      new Date(new Date().setMilliseconds(0)),
      profileChangedAt || 0,
      expiresAt || new Date(Date.now() + (ttl * 1000 || MAX_TTL)),
      // This is the one and only time the caller can get at the unhashed token.
      token
    );
  }

  /**
   *
   * @param {string} string
   * @returns {AccessToken}
   */
  static parse(string) {
    const json = JSON.parse(string);
    // We previously wrote the raw token into redis, but are now writing
    // only the hashed tokenId.
    let tokenId;
    if (json.tokenId) {
      tokenId = Buffer.from(json.tokenId, 'hex');
    } else {
      tokenId = encrypt.hash(Buffer.from(json.token, 'hex'));
    }
    return new AccessToken(
      tokenId,
      Buffer.from(json.clientId, 'hex'),
      json.name,
      json.canGrant,
      json.publicClient,
      Buffer.from(json.userId, 'hex'),
      json.email,
      ScopeSet.fromString(json.scope),
      new Date(json.createdAt),
      json.profileChangedAt,
      new Date(json.expiresAt)
    );
  }

  /**
   * @param {any} row
   * @returns {AccessToken}
   */
  static fromMySQL(row) {
    return new AccessToken(
      row.tokenId,
      row.clientId,
      row.clientName,
      row.clientCanGrant,
      row.publicClient,
      row.userId,
      row.email,
      ScopeSet.fromString(row.scope),
      row.createdAt,
      row.profileChangedAt,
      row.expiresAt
    );
  }
}

module.exports = AccessToken;
