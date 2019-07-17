/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('joi');
const ScopeSet = require('fxa-shared').oauth.scopes;
const authServerValidators = require('../../lib/routes/validators');

const config = require('./config');

exports.HEX_STRING = /^(?:[0-9a-f]{2})+$/;
exports.B64URL_STRING = /^[A-Za-z0-9-_]+$/;

exports.clientId = Joi.string()
  .length(config.get('unique.id') * 2) // hex = bytes*2
  .regex(exports.HEX_STRING)
  .required();

exports.clientSecret = Joi.string()
  .length(config.get('unique.clientSecret') * 2) // hex = bytes*2
  .regex(exports.HEX_STRING)
  .required();

exports.codeVerifier = Joi.string()
  .min(43)
  .max(128)
  .regex(exports.B64URL_STRING); // https://tools.ietf.org/html/rfc7636#section-4.1

exports.token = Joi.string()
  .length(config.get('unique.token') * 2)
  .regex(exports.HEX_STRING);

const scopeString = Joi.string().max(256);
exports.scope = Joi.extend({
  name: 'scope',
  base: Joi.any(), // We're not returning a string, so don't base this on Joi.string().
  language: {
    base: 'needs to be a valid scope string',
  },
  pre(value, state, options) {
    const err = scopeString.validate(value).err;
    if (err) {
      return err;
    }
    try {
      return ScopeSet.fromString(value || '');
    } catch (err) {
      return this.createError('scope.base', { v: value }, state, options);
    }
  },
})
  .scope()
  .default(ScopeSet.fromArray([]));

exports.redirectUri = Joi.string()
  .max(256)
  .regex(/^[a-zA-Z0-9\-_\/.:?=&]+$/);

// taken from mozilla/persona/lib/validate.js
exports.assertion = Joi.string()
  .min(50)
  .max(10240)
  .regex(/^[a-zA-Z0-9_\-\.~=]+$/);

exports.jwe = Joi.string()
  .max(1024)
  // JWE token format: 'protectedheader.encryptedkey.iv.cyphertext.authenticationtag'
  .regex(
    /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/
  );

exports.jwt = Joi.string()
  .max(1024)
  // JWT format: 'header.payload.signature'
  .regex(/^([a-zA-Z0-9\-_]+)\.([a-zA-Z0-9\-_]+)\.([a-zA-Z0-9\-_]+)$/);

exports.accessToken = Joi.alternatives().try([exports.token, exports.jwt]);

exports.ppidSeed = authServerValidators.ppidSeed.default(0);