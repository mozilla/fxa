/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const config = require('./config');
const { jwk2pem } = require('pem-jwk');


function pub(key) {
  // Hey, this is important. Listen up.
  //
  // This function pulls out only the **PUBLIC** pieces of this key.
  // For RSA, that's the `e` and `n` values.
  //
  // BE CAREFUL IF YOU REFACTOR THIS. Thanks.
  return {
    kty: key.kty,
    alg: 'RS256',
    kid: key.kid,
    'fxa-createdAt': key['fxa-createdAt'],
    use: 'sig',
    n: key.n,
    e: key.e,
  };
}

const PRIVATE_JWKS_MAP = new Map();

const currentPrivJWK = config.get('openid.key');
PRIVATE_JWKS_MAP.set(currentPrivJWK.kid, currentPrivJWK);

const oldPrivJWK = config.get('openid.oldKey');
if (oldPrivJWK && Object.keys(oldPrivJWK).length) {
  PRIVATE_JWKS_MAP.set(oldPrivJWK.kid, oldPrivJWK);
}

const SIGNING_JWK = config.get('openid.key');
const SIGNING_PEM = jwk2pem(SIGNING_JWK);

const PUBLIC_JWK_MAP = new Map();
const PUBLIC_PEM_MAP = new Map();

PRIVATE_JWKS_MAP.forEach((privJWK, kid) => {
  const publicJWK = pub(privJWK);

  PUBLIC_JWK_MAP.set(kid, publicJWK);
  PUBLIC_PEM_MAP.set(kid, jwk2pem(publicJWK));
});

/**
 * Get a public PEM by `kid`.
 *
 * @param {String} kid of PEM to get
 * @throws {Error} if no PEM found for `kid`
 * @returns {JWK}
 */
exports.publicPEM = function publicPEM(kid) {
  const pem = PUBLIC_PEM_MAP.get(kid);
  if (!pem) {
    throw new Error('PEM not found');
  }
  return pem;
};

// An array of raw public keys that can be fetched
// by remote services to locally verify.
exports.PUBLIC_KEYS = Array.from(PUBLIC_JWK_MAP.values());

// The PEM to sign with
exports.SIGNING_PEM = SIGNING_PEM;
exports.SIGNING_KID = SIGNING_JWK.kid;
exports.SIGNING_ALG = 'RS256';