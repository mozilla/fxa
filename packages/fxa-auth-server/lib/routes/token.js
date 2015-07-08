/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint camelcase: false*/
const AppError = require('../error');
const buf = require('buf').hex;
const hex = require('buf').to.hex;
const Joi = require('joi');

const config = require('../config');
const db = require('../db');
const encrypt = require('../encrypt');
const logger = require('../logging')('routes.token');
const P = require('../promise');
const Scope = require('../scope');
const validators = require('../validators');

const MAX_TTL_S = config.get('expiration.accessToken') / 1000;
const GRANT_AUTHORIZATION_CODE = 'authorization_code';
const GRANT_REFRESH_TOKEN = 'refresh_token';

function confirmClient(id, secret) {
  return db.getClient(buf(id)).then(function(client) {
    if (!client) {
      logger.debug('client.notFound', { id: id });
      throw AppError.unknownClient(id);
    }

    var submitted = hex(encrypt.hash(buf(secret)));
    var stored = hex(client.hashedSecret);
    if (submitted !== stored) {
      logger.info('client.mismatchSecret', { client: id });
      logger.verbose('client.mismatchSecret.details', {
        submitted: submitted,
        db: stored
      });
      throw AppError.incorrectSecret(id);
    }

    return client;
  });
}

function confirmCode(id, code) {
  return db.getCode(buf(code)).then(function(codeObj) {
    if (!codeObj) {
      logger.debug('code.notFound', { code: code });
      throw AppError.unknownCode(code);
    } else if (hex(codeObj.clientId) !== hex(id)) {
      logger.debug('code.mismatch', {
        client: hex(id),
        code: hex(codeObj.clientId)
      });
      throw AppError.mismatchCode(code, id);
    } else {
      // + because loldatemath. without it, it does string concat
      var expiresAt = +codeObj.createdAt + config.get('expiration.code');
      if (Date.now() > expiresAt) {
        logger.debug('code.expired', { code: code });
        throw AppError.expiredCode(code, expiresAt);
      }
    }
    return codeObj;
  });
}

function confirmRefreshToken(params) {
  return db.getRefreshToken(encrypt.hash(params.refresh_token))
  .then(function(tokObj) {
    if (!tokObj) {
      logger.debug('refresh_token.notFound', params.refresh_token);
      throw AppError.invalidToken();
    } else if (hex(tokObj.clientId) !== hex(params.client_id)) {
      logger.debug('refresh_token.mismatch', {
        client: params.client_id,
        code: tokObj.clientId
      });
      throw AppError.invalidToken();
    } else if (!Scope(tokObj.scope).has(params.scope)) {
      logger.debug('refresh_token.invalidScopes', {
        allowed: tokObj.scope,
        requested: params.scope
      });
      throw AppError.invalidScopes();
    }
    tokObj.scope = params.scope;
    return tokObj;
  });
}

function generateTokens(options) {
  // we always are generating an access token here
  // but depending on options, we may also be generating a refresh_token
  var promises = [db.generateAccessToken(options)];
  if (options.offline) {
    promises.push(db.generateRefreshToken(options));
  }
  return P.all(promises).spread(function(access, refresh) {
    var json = {
      access_token: access.token.toString('hex'),
      token_type: access.type,
      scope: Scope(access.scope).toString()
    };
    if (options.authAt) {
      json.auth_at = options.authAt;
    }
    json.expires_in = options.ttl;
    if (refresh) {
      json.refresh_token = refresh.token.toString('hex');
    }
    return json;
  });
}

var payloadSchema = Joi.object({
  client_id: validators.clientId,
  client_secret: validators.clientSecret,

  grant_type: Joi.string()
    .valid(GRANT_AUTHORIZATION_CODE, GRANT_REFRESH_TOKEN)
    .default(GRANT_AUTHORIZATION_CODE)
    .optional(),

  ttl: Joi.number()
    .max(MAX_TTL_S)
    .default(MAX_TTL_S)
    .optional(),

  scope: Joi.alternatives().when('grant_type', {
    is: GRANT_REFRESH_TOKEN,
    then: Joi.string(),
    otherwise: Joi.forbidden()
  }),

  code: Joi.string()
    .length(config.get('unique.code') * 2)
    .regex(validators.HEX_STRING)
    .required()
    .when('grant_type', {
      is: GRANT_AUTHORIZATION_CODE,
      otherwise: Joi.forbidden()
    }),

  refresh_token: validators.token
    .required()
    .when('grant_type', {
      is: GRANT_REFRESH_TOKEN,
      otherwise: Joi.forbidden()
    })
});

module.exports = {
  validate: {
    // stripUnknown is used to allow various oauth2 libraries to be used
    // with FxA OAuth. Sometimes, they will send other parameters that
    // we don't use, such as `response_type`, or something else. Instead
    // of giving an error here, we can just ignore them.
    payload: function validatePayload(value, options, next) {
      return Joi.validate(value, payloadSchema, { stripUnknown: true }, next);
    }
  },
  response: {
    schema: Joi.object().keys({
      access_token: validators.token.required(),
      refresh_token: validators.token,
      scope: Joi.string().required().allow(''),
      token_type: Joi.string().valid('bearer').required(),
      expires_in: Joi.number().max(MAX_TTL_S).required(),
      auth_at: Joi.number(),
    })
  },
  handler: function tokenEndpoint(req, reply) {
    var params = req.payload;
    confirmClient(params.client_id, params.client_secret).then(function() {
      if (params.grant_type === GRANT_AUTHORIZATION_CODE) {
        return confirmCode(params.client_id, params.code).then(function(vals) {
          vals.ttl = params.ttl;
          return vals;
        });
      } else if (params.grant_type === GRANT_REFRESH_TOKEN) {
        return confirmRefreshToken(params).then(function(vals) {
          vals.ttl = params.ttl;
          return vals;
        });
      } // else our Joi validation failed us?
    })
    .then(generateTokens)
    .done(reply, reply);
  }
};
