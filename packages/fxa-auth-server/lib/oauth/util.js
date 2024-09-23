/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AuthError from '../error';

import { signJWT } from '../serverJWT';
import crypto from 'crypto';

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
  return buf.toString('base64url');
}

/**
 * Generates a hash of the access token based on
 * Per: http://openid.net/specs/openid-connect-core-1_0.html#CodeIDToken
 *
 * at_hash
 *     OPTIONAL. Access Token hash value. Its value is the base64url encoding of
 *     the left-most half of the hash of the octets of the ASCII representation
 *     of the access_token value, where the hash algorithm used is the hash
 *     algorithm used in the alg Header Parameter of the ID Token's JOSE Header.
 *     For instance, if the alg is RS256, hash the access_token value with
 *     SHA-256, then take the left-most 128 bits and base64url encode them.
 *     The at_hash value is a case sensitive string.
 *
 * @param {Buffer} accessToken The access token as seen by the client
 * @returns {String}
 * @api public
 */
function generateTokenHash(accessToken) {
  const sha = crypto.createHash('sha256');
  sha.update(accessToken.toString('ascii'));
  const hash = sha.digest();
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

export default {
  base64URLEncode,
  generateTokenHash,
  makeAssertionJWT,
};
