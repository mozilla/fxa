/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


const Joi = require('joi');

const AppError = require('./error');
const config = require('./config');
const logger = require('./logging')('assertion');
const P = require('./promise');

const HEX_STRING = /^[0-9a-f]+$/;
const CLAIMS_SCHEMA = Joi.object({
  'uid': Joi.string().length(32).regex(HEX_STRING).required(),
  'fxa-generation': Joi.number().integer().min(0).required(),
  'fxa-verifiedEmail': Joi.string().max(255).required(),
  'fxa-lastAuthAt': Joi.number().integer().min(0).required(),
  'fxa-tokenVerified': Joi.boolean().optional(),
  'fxa-amr': Joi.array().items(Joi.string().alphanum()).optional(),
  'fxa-aal': Joi.number().integer().min(0).max(3).optional(),
}).options({ stripUnknown: true });

const AUDIENCE = config.get('publicUrl');

const request = require('request').defaults({
  url: config.get('browserid.verificationUrl'),
  pool: {
    maxSockets: config.get('browserid.maxSockets')
  }
});

function unb64(text) {
  return Buffer.from(text, 'base64').toString('utf8');
}

function Assertion(assertion) {
  this.assertion = assertion;
}

Assertion.prototype.toJSON = function() {
  const parts = this.assertion.split('.');
  const ass = JSON.parse(unb64(parts[1]));
  ass.pubkey = ass.publicKey = ass['public-key'] = undefined;
  try {
    return {
      header: JSON.parse(unb64(parts[0])),
      assertion: ass,
      cert: JSON.parse(unb64(parts[3]))
    };
  } catch (ex) {
    return ex;
  }
};

module.exports = function verifyAssertion(assertion) {
  logger.verbose('assertion', new Assertion(assertion));
  const d = P.defer();
  const opts = {
    json: {
      assertion: assertion,
      audience: AUDIENCE
    }
  };
  request.post(opts, (err, res, body) => {
    if (err) {
      logger.error('verify.error', err);
      return d.reject(err);
    }

    function error(msg, val) {
      logger.info('invalidAssertion', {
        msg: msg,
        val: val,
        assertion: assertion
      });
      d.reject(AppError.invalidAssertion());
    }

    if (! body || body.status !== 'okay') {
      return error('non-okay response', body);
    }
    const email = body.email;
    const parts = email.split('@');
    const allowedIssuer = config.get('browserid.issuer');
    if (parts.length !== 2 || parts[1] !== allowedIssuer) {
      return error('invalid email', email);
    }
    if (body.issuer !== allowedIssuer) {
      return error('invalid issuer', body.issuer);
    }
    const uid = parts[0];

    const claims = body.idpClaims || {};
    claims.uid = uid;
    CLAIMS_SCHEMA.validate(claims, (err, claims) => {
      if (err) {
        return error(err, claims);
      }
      return d.resolve(claims);
    });
  });
  return d.promise;
};
