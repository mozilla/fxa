/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const unique = require('../unique');
const encrypt = require('fxa-shared/auth/encrypt');
const { config } = require('../../../config');
const MAX_TTL = config.get('oauthServer.expiration.accessToken');

const { AccessToken } = require('fxa-shared/db/models/auth/access-token');

// Tack on static function
AccessToken.generate = function (
  clientId,
  name,
  canGrant,
  publicClient,
  userId,
  scope,
  profileChangedAt,
  expiresAt,
  ttl,
  deviceId
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
    scope,
    // Truncated createdAt to the second to match mysql
    new Date(new Date().setMilliseconds(0)),
    profileChangedAt || 0,
    expiresAt || new Date(Date.now() + (ttl * 1000 || MAX_TTL)),
    // This is the one and only time the caller can get at the unhashed token.
    token,
    'bearer',
    deviceId
  );
};

module.exports = AccessToken;
