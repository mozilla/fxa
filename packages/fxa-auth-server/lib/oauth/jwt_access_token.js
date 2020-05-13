/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const hex = require('buf').to.hex;
const AppError = require('./error');
const jwt = require('./jwt');
const sub = require('./jwt_sub');
const { OAUTH_SCOPE_OLD_SYNC } = require('../constants');
const config = require('../../config');
const TOKEN_SERVER_URL = config.get('syncTokenserverUrl');

const HEADER_TYP = 'at+JWT';

/**
 * Create a JWT access token from `grant`
 */
exports.create = async function generateJWTAccessToken(accessToken, grant) {
  const clientId = hex(grant.clientId);
  // For historical reasons (based on an early draft of the JWT-access-token spec) we
  // always include the client_id in the `aud` claim. A future iteration of this code
  // should instead infer an appropriate default `aud` based on the requested scopes.
  // Ref https://github.com/mozilla/fxa/issues/4962
  const audience = grant.resource
    ? [clientId, grant.resource]
    : grant.scope.contains(OAUTH_SCOPE_OLD_SYNC)
    ? TOKEN_SERVER_URL
    : clientId;

  // Claims list from:
  // https://tools.ietf.org/html/draft-ietf-oauth-access-token-jwt#section-2.2
  const claims = {
    aud: audience,
    client_id: clientId,
    exp: Math.floor(accessToken.expiresAt / 1000),
    iat: Math.floor(Date.now() / 1000),
    // iss is set in jwt.sign
    jti: hex(accessToken.token),
    scope: grant.scope.toString(),
    sub: await sub(grant.userId, grant.clientId, grant.ppidSeed),
  };

  // Note, a new claim is used rather than scopes because
  // FxA's scope checking somewhat blindly accepts user input,
  // meaning a malicious user could reload FxA after editing the URL
  // to contain subscription name in the scope list and the subscription
  // would end up in the user's scope list whether they actually
  // paid for it or not. See https://github.com/mozilla/fxa/issues/2478
  if (grant['fxa-subscriptions']) {
    claims['fxa-subscriptions'] = grant['fxa-subscriptions'].join(' ');
  }

  if (grant.generation) {
    claims['fxa-generation'] = grant.generation;
  }

  if (grant.profileChangedAt) {
    claims['fxa-profileChangedAt'] = grant.profileChangedAt;
  }

  return {
    ...accessToken,
    jwt_token: await exports.sign(claims),
  };
};

/**
 * Sign a set of claims to create a JWT access token
 *
 * @param {Object} claims
 * @returns {Promise<JWT>}
 */
exports.sign = function sign(claims) {
  return jwt.sign(claims, {
    header: {
      typ: HEADER_TYP,
    },
  });
};

/**
 * Get the token ID of the JWT access token.
 *
 * @param {String} accessToken
 * @throws `invalidToken` error if access token is invalid.
 */
exports.tokenId = async function tokenId(accessToken) {
  // The access token ID is stored in the jti field of
  // a JWT access token.
  const payload = await exports.verify(accessToken);
  if (!payload.jti) {
    throw AppError.invalidToken();
  }
  return payload.jti;
};

/**
 * Verify a JWT access token, return the payload if valid.
 *
 * @param {String} accessToken
 * @throws `invalidToken` error if access token is invalid.
 * @returns {Promise<Object>}
 */
exports.verify = async function verify(accessToken) {
  let payload;
  try {
    payload = await jwt.verify(accessToken, {
      typ: HEADER_TYP,
    });
  } catch (err) {
    throw AppError.invalidToken();
  }

  if (!payload) {
    throw AppError.invalidToken();
  }

  return payload;
};
