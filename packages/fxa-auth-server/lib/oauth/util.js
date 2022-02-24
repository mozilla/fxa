/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const encrypt = require('./encrypt');
const AuthError = require('../error');
const { signJWT } = require('../serverJWT');

/**
 * .base64URLEncode
 *
 * return an encoded Buffer as URL Safe Base64
 *
 * Note: This function encodes to the RFC 4648 Spec where '+' is encoded
 *       as '-' and '/' is encoded as '_'. The padding character '=' is
 *       removed.
 *
 * @param {Buffer} buf
 * @return {String}
 * @api public
 */
function base64URLEncode(buf) {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generates a hash of the access token based on
 * http://openid.net/specs/openid-connect-core-1_0.html#CodeIDToken
 *
 * This hash of the access token, then the base64url
 * value of the left half.
 *
 * @param {Buffer} accessToken The access token as seen by the client (hex form)
 * @returns {String}
 * @api public
 */
function generateTokenHash(accessToken) {
  const hash = encrypt.hash(accessToken);
  return base64URLEncode(hash.slice(0, hash.length / 2));
}

function makeAssertionJWT(config, credentials) {
  if (!credentials.emailVerified) {
    throw AuthError.unverifiedAccount();
  }
  if (credentials.mustVerify && !credentials.tokenVerified) {
    throw AuthError.unverifiedSession();
  }
  const claims = {
    sub: credentials.uid,
    'fxa-generation': credentials.verifierSetAt,
    'fxa-verifiedEmail': credentials.email,
    'fxa-sessionTokenId': credentials.id,
    'fxa-lastAuthAt': credentials.lastAuthAt(),
    'fxa-tokenVerified': credentials.tokenVerified,
    'fxa-amr': Array.from(credentials.authenticationMethods),
    'fxa-aal': credentials.authenticatorAssuranceLevel,
    'fxa-profileChangedAt': credentials.profileChangedAt,
    'fxa-keysChangedAt': credentials.keysChangedAt,
  };
  return signJWT(
    claims,
    config.oauth.url,
    config.domain,
    config.oauth.secretKey,
    60
  );
}

module.exports = {
  base64URLEncode,
  generateTokenHash,
  makeAssertionJWT,
};
