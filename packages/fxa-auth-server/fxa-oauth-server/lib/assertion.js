/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use stict';

/* Utilities for verifing signed identity assertions.
 *
 * This service accepts two different kinds of identity assertions
 * for authenticating the caller:
 *
 *  - A JWT, signed by one of a fixed set of trusted server-side secret
 *    HMAC keys.
 *  - A BrowserID assertion bundle, signed via BrowserID's public key
 *    discovery mechanisms.
 *
 * The former is much simpler and easier to verify, so much so that
 * we do it inline in the server process. The later is much more
 * complicated and we need to call out to an external verifier process.
 * We hope to eventually phase out support for BrowserID assertions.
 *
 */

const P = require('./promise');

const Joi = require('joi');
const validators = require('../lib/validators');
const jwt = P.promisifyAll(require('jsonwebtoken'));

const AppError = require('./error');
const config = require('./config');
const logger = require('./logging')('assertion');

const HEX_STRING = /^[0-9a-f]+$/;
const CLAIMS_SCHEMA = Joi.object({
  uid: Joi.string()
    .length(32)
    .regex(HEX_STRING)
    .required(),
  'fxa-generation': Joi.number()
    .integer()
    .min(0)
    .required(),
  'fxa-verifiedEmail': Joi.string()
    .max(255)
    .required(),
  'fxa-lastAuthAt': Joi.number()
    .integer()
    .min(0)
    .required(),
  iat: Joi.number()
    .integer()
    .min(0)
    .optional(),
  'fxa-tokenVerified': Joi.boolean().optional(),
  'fxa-sessionTokenId': validators.sessionTokenId.optional(),
  'fxa-amr': Joi.array()
    .items(Joi.string().alphanum())
    .optional(),
  'fxa-aal': Joi.number()
    .integer()
    .min(0)
    .max(3)
    .optional(),
  'fxa-profileChangedAt': Joi.number()
    .integer()
    .min(0)
    .optional(),
}).options({ stripUnknown: true });
const validateClaims = P.promisify(CLAIMS_SCHEMA.validate, {
  context: CLAIMS_SCHEMA,
});

const AUDIENCE = config.get('publicUrl');
const ALLOWED_ISSUER = config.get('browserid.issuer');

const request = P.promisify(
  require('request').defaults({
    url: config.get('browserid.verificationUrl'),
    pool: {
      maxSockets: config.get('browserid.maxSockets'),
    },
  }),
  { multiArgs: true }
);

function error(assertion, msg, val) {
  logger.info('invalidAssertion', { assertion, msg, val });
  throw AppError.invalidAssertion();
}

// Verify a BrowserID assertion,
// by posting to an external verifier service.

async function verifyBrowserID(assertion) {
  let res, body;
  try {
    [res, body] = await request({
      method: 'POST',
      json: {
        assertion: assertion,
        audience: AUDIENCE,
      },
    });
  } catch (err) {
    logger.error('verify.error', err);
    throw err;
  }
  if (!res || !body || body.status !== 'okay') {
    return error(assertion, 'non-okay response', body);
  }

  const email = body.email;
  const parts = email.split('@');
  if (parts.length !== 2 || parts[1] !== ALLOWED_ISSUER) {
    return error(assertion, 'invalid email', email);
  }
  if (body.issuer !== ALLOWED_ISSUER) {
    return error(assertion, 'invalid issuer', body.issuer);
  }
  const uid = parts[0];

  const claims = body.idpClaims || {};
  claims.uid = uid;
  return claims;
}

// Verify a JWT assertion.
// Since it's just a symmetric HMAC signature,
// this should be safe and performant enough to do in-proces.
async function verifyJWT(assertion) {
  const opts = {
    algorithms: ['HS256'],
    audience: AUDIENCE,
    issuer: ALLOWED_ISSUER,
  };
  // To allow for key rotation, we may have
  // several valid shared secret keys in-flight.
  const keys = config.get('authServerSecrets');
  for (const key of keys) {
    try {
      const claims = jwt.verify(assertion, key, opts);
      claims.uid = claims.sub;
      return claims;
    } catch (err) {
      // Any error other than 'invalid signature' will not
      // be resolved by trying the remaining keys.
      if (err.message !== 'invalid signature') {
        return error(assertion, err.message);
      }
    }
  }
  // None of the keys worked, clearly invalid.
  return error(assertion, 'unknown signing key');
}

module.exports = async function verifyAssertion(assertion) {
  // We can differentiate between JWTs and BrowserID assertions
  // because the former cannot contain "~" while the later always do.
  let claims;
  if (/~/.test(assertion)) {
    claims = await verifyBrowserID(assertion);
  } else {
    claims = await verifyJWT(assertion);
  }
  try {
    return await validateClaims(claims);
  } catch (err) {
    return error(assertion, err, claims);
  }
};
