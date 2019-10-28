/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const ScopeSet = require('../../../fxa-shared').oauth.scopes;

const AppError = require('./error');
const config = require('../../config');
const db = require('./db');
const encrypt = require('./encrypt');
const logger = require('./logging')('token');
const JWTAccessToken = require('./jwt_access_token');
const validators = require('./validators');

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

const SCOPES_REQUIRING_EMAIL = ScopeSet.fromArray(['profile:email', 'oauth']);

/**
 * Get the tokenId stored in the DB for `accessToken`
 *
 * @throws `invalidToken` error if a JWT access token
 *   is passed and invalid.
 */
exports.getTokenId = async function getTokenId(accessToken) {
  let unhashedAccessTokenId = accessToken;

  if (!validators.jwt.validate(accessToken).error) {
    unhashedAccessTokenId = await JWTAccessToken.tokenId(accessToken);
  }
  return encrypt.hash(unhashedAccessTokenId);
};

/**
 * Verify an accessToken.
 */
exports.verify = async function verify(accessToken) {
  // JWT access tokens are still database backed, continue
  // to use the database as the canonical source of info
  // until we fully migrate to JWTs.
  const token = await db.getAccessToken(await exports.getTokenId(accessToken));
  if (!token) {
    throw AppError.invalidToken();
  } else if (+token.expiresAt < Date.now()) {
    // We dug ourselves a bit of a hole with token expiry,
    // and this logic is here to help us climb back out.
    // There's a huge backlog of expired tokens in the wild,
    // and if we start rejecting them all at once, then the
    // thundering herd of token updates will crush our db.
    // Instead we "grandfather" these old tokens in and
    // pretend they're still valid, while chipping away at
    // the backlog by either slowly reducing this epoch, or
    // by slowly purging older tokens from the db.
    if (
      +token.expiresAt >=
      config.get('oauthServer.expiration.accessTokenExpiryEpoch')
    ) {
      throw AppError.expiredToken(token.expiresAt);
    }
    logger.warn('token.verify.expired', {
      user: token.userId.toString('hex'),
      client_id: token.clientId.toString('hex'),
      scope: token.scope.toString(),
      created_at: token.createdAt,
      expires_at: token.expiresAt,
    });
  } else if (+token.createdAt + TWENTY_FOUR_HOURS < Date.now()) {
    // Log a warning if reliers are using access tokens that are more
    // than 24 hours old.  Eventually we will shorten the expiry time
    // on access tokens and such old tokens won't be allowed.
    logger.warn('token.verify.expiring_soon', {
      user: token.userId.toString('hex'),
      client_id: token.clientId.toString('hex'),
      scope: token.scope,
      created_at: token.createdAt,
      expires_at: token.expiresAt,
    });
  }
  var tokenInfo = {
    user: token.userId.toString('hex'),
    client_id: token.clientId.toString('hex'),
    scope: token.scope,
  };

  if (token.profileChangedAt) {
    tokenInfo.profile_changed_at = token.profileChangedAt;
  }

  if (token.scope.intersects(SCOPES_REQUIRING_EMAIL)) {
    tokenInfo.email = token.email;
  }

  return tokenInfo;
};
