/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const hex = require('buf').to.hex;
const AppError = require('./error');
const jwt = require('./jwt');
const sub = require('./jwt_sub');

const HEADER_TYP = 'at+JWT';

/**
 * Create a JWT access token from `grant`
 */
exports.create = async function generateJWTAccessToken(accessToken, grant) {
  const clientId = hex(grant.clientId);
  // The IETF spec for `aud` refers to https://openid.net/specs/openid-connect-core-1_0.html#IDToken
  // > REQUIRED. Audience(s) that this ID Token is intended for. It MUST contain the
  // > OAuth 2.0 client_id of the Relying Party as an audience value. It MAY also contain
  // > identifiers for other audiences. In the general case, the aud value is an array of
  // > case sensitive strings. In the common special case when there is one audience, the
  // > aud value MAY be a single case sensitive string.
  const audience = grant.resource ? [clientId, grant.resource] : clientId;

  // Claims list from:
  // https://tools.ietf.org/html/draft-bertocci-oauth-access-token-jwt-00#section-2.2
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
