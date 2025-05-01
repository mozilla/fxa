/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use stict';

/* Utilities for verifying signed identity assertions.
 *
 * This service accepts one kind of identity assertions
 * for authenticating the caller:
 *
 *  - A JWT, signed by one of a fixed set of trusted server-side secret
 *    HMAC keys.
 *
 */

const Joi = require('joi');
const validators = require('./validators');

const OauthError = require('./error');
const { config } = require('../../config');
const { verifyJWT } = require('../../lib/serverJWT');

const HEX_STRING = /^[0-9a-f]+$/;

// FxA sends several custom claims, ref
// https://mozilla.github.io/ecosystem-platform/api#tag/Sign/operation/postCertificateSign
const CLAIMS_SCHEMA = Joi.object({
  uid: Joi.string().length(32).regex(HEX_STRING).required(),
  'fxa-generation': Joi.number().integer().min(0).required(),
  'fxa-verifiedEmail': Joi.string().max(255).required(),
  'fxa-lastAuthAt': Joi.number().integer().min(0).required(),
  iat: Joi.number().integer().min(0).optional(),
  'fxa-tokenVerified': Joi.boolean().optional(),
  'fxa-sessionTokenId': validators.sessionTokenId.optional(),
  'fxa-amr': Joi.array().items(Joi.string().alphanum()).optional(),
  'fxa-aal': Joi.number().integer().min(0).max(3).optional(),
  'fxa-profileChangedAt': Joi.number().integer().min(0).optional(),
  'fxa-keysChangedAt': Joi.number().integer().min(0).optional(),
}).options({ stripUnknown: true });

const AUDIENCE = config.get('oauthServer.audience');
const ALLOWED_ISSUER = config.get('oauthServer.browserid.issuer');

function error(assertion, msg, val) {
  throw OauthError.invalidAssertion();
}

module.exports = async function verifyAssertion(assertion) {
  let claims;
  try {
    claims = await verifyJWT(
      assertion,
      AUDIENCE,
      ALLOWED_ISSUER,
      config.get('oauthServer.authServerSecrets'),
      error
    );
    claims.uid = claims.sub;
  } catch (err) {
    return error(assertion, err.message);
  }
  try {
    return await CLAIMS_SCHEMA.validateAsync(claims);
  } catch (err) {
    return error(assertion, err, claims);
  }
};
