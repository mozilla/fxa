/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import assert from 'assert';
import { config } from '../../config';
import { jwk2pem, pem2jwk } from '@fxa/shared/pem-jwk';
import * as crypto from 'crypto';
import * as Joi from 'joi';

const BASE64URL = /^[A-Za-z0-9-_]+$/;

const PUBLIC_KEY_SCHEMA = (exports.PUBLIC_KEY_SCHEMA = Joi.object({
  kty: Joi.string().valid('RSA').required(),
  kid: Joi.string().required(),
  n: Joi.string().regex(BASE64URL).required(),
  e: Joi.string().regex(BASE64URL).required(),
  alg: Joi.string().valid('RS256').optional(),
  use: Joi.string().valid('sig').optional(),
  'fxa-createdAt': Joi.number().integer().min(0).optional(),
}));

const PRIVATE_KEY_SCHEMA = (exports.PRIVATE_KEY_SCHEMA = Joi.object({
  kty: Joi.string().valid('RSA').required(),
  kid: Joi.string().required(),
  n: Joi.string().regex(BASE64URL).required(),
  e: Joi.string().regex(BASE64URL).required(),
  d: Joi.string().regex(BASE64URL).required(),
  alg: Joi.string().valid('RS256').optional(),
  use: Joi.string().valid('sig').optional(),
  p: Joi.string().regex(BASE64URL).required(),
  q: Joi.string().regex(BASE64URL).required(),
  dp: Joi.string().regex(BASE64URL).required(),
  dq: Joi.string().regex(BASE64URL).required(),
  qi: Joi.string().regex(BASE64URL).required(),
  'fxa-createdAt': Joi.number().integer().min(0).optional(),
}));

const PRIVATE_JWKS_MAP = new Map();
const PUBLIC_JWK_MAP = new Map();
const PUBLIC_PEM_MAP = new Map();

// The active signing key should be a proper RSA private key,
// and should always exist (unless we're initializing the keys for the first time).
const currentPrivJWK = config.get('oauthServer.openid.key');
if (currentPrivJWK) {
  assert.strictEqual(
    PRIVATE_KEY_SCHEMA.validate(currentPrivJWK).error,
    undefined,
    new Error('openid.key must be a valid private key')
  );
  PRIVATE_JWKS_MAP.set(currentPrivJWK.kid, currentPrivJWK);
} else if (!config.get('oauthServer.openid.unsafelyAllowMissingActiveKey')) {
  assert.fail(
    'oauthServer.openid.key is missing; bailing out in a cowardly fashion...'
  );
}

// The pending signing key, if present, should be a proper RSA private key
// and must be different from the active key..
const newPrivJWK = config.get('oauthServer.openid.newKey');
if (newPrivJWK) {
  assert.strictEqual(
    PRIVATE_KEY_SCHEMA.validate(newPrivJWK).error,
    undefined,
    new Error('openid.newKey must be a valid private key')
  );
  assert.notEqual(
    currentPrivJWK.kid,
    newPrivJWK.kid,
    'openid.key.kid must differ from openid.newKey.id'
  );
  PRIVATE_JWKS_MAP.set(newPrivJWK.kid, newPrivJWK);
}

// The retired signing key, if present, should be a proper RSA *public* key.
// We will never again sign anything with it, so no need to keep the private component.
const oldPubJWK = config.get('oauthServer.openid.oldKey');
if (oldPubJWK) {
  assert.strictEqual(
    PUBLIC_KEY_SCHEMA.validate(oldPubJWK).error,
    undefined,
    new Error('openid.oldKey must be a valid public key')
  );
  assert.notEqual(
    currentPrivJWK?.kid,
    oldPubJWK?.kid,
    'openid.key.kid must differ from openid.oldKey.id'
  );
  PRIVATE_JWKS_MAP.set(oldPubJWK.kid, oldPubJWK);
}

/**
 * Extract the public portion of a key.
 *
 * @param {JWK} The private key.
 * @returns {JWK} Its corresponding public key.
 */
exports.extractPublicKey = function extractPublicKey(key: any) {
  // Hey, this is important. Listen up.
  //
  // This function pulls out only the **PUBLIC** pieces of this key.
  // For RSA, that's the `e` and `n` values.
  //
  // BE CAREFUL IF YOU REFACTOR THIS. Thanks.
  return {
    kty: key.kty,
    alg: key.alg || 'RS256',
    kid: key.kid,
    'fxa-createdAt': key['fxa-createdAt'],
    use: key.use || 'sig',
    n: key.n,
    e: key.e,
  };
};

/**
 * Generate a new, random private key.
 *
 * @returns {JWK}
 */
exports.generatePrivateKey = function generatePrivateKey() {
  const PEM_ENCODING = {
    type: 'pkcs1',
    format: 'pem',
  };
  const kp = crypto.generateKeyPairSync('rsa' as any, {
    modulusLength: 256 * 8,
    publicKeyEncoding: PEM_ENCODING,
    privateKeyEncoding: PEM_ENCODING,
  });
  // We tag our keys with their creation time, and a unique key id
  // based on a hash of the public key and the timestamp.  The result
  // comes out like:
  //  {
  //    kid: "20170316-ebe69008"
  //    "fxa-createdAt": 1489716000,
  //  }
  const now = new Date();
  const pubKeyFingerprint = crypto
    .createHash('sha256')
    .update(kp.publicKey.toString())
    .digest('hex')
    .slice(0, 8);
  const privKey = Object.assign(pem2jwk(kp.privateKey.toString()), {
    kid:
      now.toISOString().slice(0, 10).replace(/-/g, '') +
      '-' +
      pubKeyFingerprint,
    alg: 'RS256',
    use: 'sig',
    // Timestamp to nearest hour; consumers don't need to know the precise time.
    'fxa-createdAt': Math.floor(now.getTime() / 1000 / 3600) * 3600,
  });
  return privKey;
};

/**
 * Get a public PEM by `kid`.
 *
 * @param {String} kid of PEM to get
 * @throws {Error} if no PEM found for `kid`
 * @returns {JWK}
 */
exports.publicPEM = function publicPEM(kid: any) {
  const pem = PUBLIC_PEM_MAP.get(kid);
  if (!pem) {
    throw new Error('PEM not found');
  }
  return pem;
};

PRIVATE_JWKS_MAP.forEach((privJWK, kid) => {
  const publicJWK = exports.extractPublicKey(privJWK);

  PUBLIC_JWK_MAP.set(kid, publicJWK);
  PUBLIC_PEM_MAP.set(kid, jwk2pem(publicJWK));
});

// An array of raw public keys that can be fetched
// by remote services to locally verify.
exports.PUBLIC_KEYS = Array.from(PUBLIC_JWK_MAP.values());

// The PEM to sign with, and related details.
// This won't be present if we're unsafely allowing the module to load without
// keys property configured.
if (currentPrivJWK) {
  const SIGNING_JWK = currentPrivJWK;
  const SIGNING_PEM = jwk2pem(SIGNING_JWK);

  exports.SIGNING_PEM = SIGNING_PEM;
  exports.SIGNING_KID = SIGNING_JWK.kid;
  exports.SIGNING_ALG = 'RS256';
}
