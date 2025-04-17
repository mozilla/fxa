/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const ScopeSet = require('fxa-shared').oauth.scopes;

const OauthError = require('./error');
const { config } = require('../../config');
const db = require('./db');
const encrypt = require('fxa-shared/auth/encrypt');
const JWTAccessToken = require('./jwt_access_token');
const validators = require('./validators');
const { SHORT_ACCESS_TOKEN_TTL_IN_MS } = require('fxa-shared/oauth/constants');

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
  // JWT tokens with lifespan < SHORT_ACCESS_TOKEN_TTL_IN_MS are not
  // stored in the db
  if (!validators.jwt.validate(accessToken).error) {
    const t = await JWTAccessToken.verify(accessToken);
    const lifespan = (t.exp - t.iat) * 1000;
    if (lifespan <= SHORT_ACCESS_TOKEN_TTL_IN_MS) {
      const info = {
        user: t.sub,
        client_id: t.client_id,
        scope: ScopeSet.fromString(t.scope),
        generation: t['fxa-generation'],
        profile_changed_at: t['fxa-profileChangedAt'],
        // Note, some tokens might not have this yet. A refresh is required to get this state
        // updated in the token or DB.
        device_id: t.device_id || undefined,
      };
      return info;
    }
  }
  // These JWT access tokens are still database backed, continue
  // to use the database as the canonical source of info
  // until we fully migrate to JWTs.
  const accessTokenId = await exports.getTokenId(accessToken);
  const token = await db.getAccessToken(accessTokenId);
  if (!token) {
    throw OauthError.invalidToken();
  }

  console.log('!!! accessTokenId', { accessTokenId, token });

  // We dug ourselves a bit of a hole with token expiry,
  // and this logic is here to help us climb back out.
  // There's a huge backlog of expired tokens in the wild,
  // and if we start rejecting them all at once, then the
  // thundering herd of token updates will crush our db.
  // Instead we "grandfather" these old tokens in and
  // pretend they're still valid, while chipping away at
  // the backlog by either slowly reducing this epoch, or
  // by slowly purging older tokens from the db.
  const expired =
    +token.expiresAt < Date.now() &&
    +token.expiresAt >=
      config.get('oauthServer.expiration.accessTokenExpiryEpoch');

  // Pocket was one of FxA first clients and does not currently support refresh tokens.
  // We currently can't expire any pocket tokens.
  // Ref: https://bugzilla.mozilla.org/show_bug.cgi?id=1547902
  const isPocket = db.getPocketIds().includes(token.clientId.toString('hex'));

  if (expired && !isPocket) {
    throw OauthError.expiredToken(token.expiresAt);
  }

  var tokenInfo = {
    user: token.userId.toString('hex'),
    client_id: token.clientId.toString('hex'),
    scope: token.scope,
    device_id: token.device_id.toString('hex'),
  };

  if (token.profileChangedAt) {
    tokenInfo.profile_changed_at = token.profileChangedAt;
  }

  return tokenInfo;
};
