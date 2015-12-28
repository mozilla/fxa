/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Hello, dear traveller! Please, turn back now. It's dangerous in here!

/*jshint camelcase: false*/
const AppError = require('../error');
const buf = require('buf').hex;
const hex = require('buf').to.hex;
const Joi = require('joi');
const JwTool = require('fxa-jwtool');

const config = require('../config');
const db = require('../db');
const encrypt = require('../encrypt');
const logger = require('../logging')('routes.token');
const P = require('../promise');
const Scope = require('../scope');
const validators = require('../validators');

const HEX_STRING = validators.HEX_STRING;

const MAX_TTL_S = config.get('expiration.accessToken') / 1000;
const GRANT_AUTHORIZATION_CODE = 'authorization_code';
const GRANT_REFRESH_TOKEN = 'refresh_token';
const GRANT_JWT = 'urn:ietf:params:oauth:grant-type:jwt-bearer';

const JWT_AUD = config.get('publicUrl') + '/v1/token';

const SERVICE_CLIENTS = {};
const SERVICE_JWTOOL = new JwTool(config.get('serviceClients').map(function(client) {
  SERVICE_CLIENTS[client.jku] = client;
  return client.jku;
}));

const SCOPE_OPENID = 'openid';

const ID_TOKEN_EXPIRATION = Math.floor(config.get('openid.ttl') / 1000);
const ID_TOKEN_ISSUER = config.get('openid.issuer');
const ID_TOKEN_KEY = JwTool.JWK.fromObject(config.get('openid.key'), {
  iss: ID_TOKEN_ISSUER
});

const PAYLOAD_SCHEMA = Joi.object({

  client_id: validators.clientId
    .when('grant_type', {
      is: GRANT_JWT,
      then: Joi.forbidden()
    }),

  client_secret: validators.clientSecret
    .when('grant_type', {
      is: GRANT_JWT,
      then: Joi.forbidden()
    }),

  grant_type: Joi.string()
    .valid(GRANT_AUTHORIZATION_CODE, GRANT_REFRESH_TOKEN, GRANT_JWT)
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
    }),

  assertion: validators.assertion
    .required()
    .when('grant_type', {
      is: GRANT_JWT,
      otherwise: Joi.forbidden()
    })

});

// No? Still want to press on? Well, OK. But you were warned.
//
// This route takes takes an authorization grant, and returns an
// access_token if everything matches up.
//
// Steps from start to finish:
//
// 1. Confirm grant credentials.
//    - If grant type is authorization code or refresh token, first
//      confirm the client credentials in `confirmClient()`.
//      - If grant type is authorization code, proceed to `confirmCode()`.
//      - If grant type is refresh token, proceed to `confirmRefreshToken()`.
//    - If grant type is a JWT, all information is in the JWT. So jump
//      straight to `confirmJwt()`.
// 2. Generate tokens.
//   - An options object is passed to `generateTokens()`.
//     - An access_token is generated.
//     - If grant type is authorization code, and it was created with
//       offline access, a refresh_token is also generated.
// 3. The tokens are returned in the response payload.
module.exports = {
  validate: {
    // stripUnknown is used to allow various oauth2 libraries to be used
    // with FxA OAuth. Sometimes, they will send other parameters that
    // we don't use, such as `response_type`, or something else. Instead
    // of giving an error here, we can just ignore them.
    payload: function validatePayload(value, options, next) {
      return Joi.validate(value, PAYLOAD_SCHEMA, { stripUnknown: true }, next);
    }
  },
  response: {
    schema: Joi.object().keys({
      access_token: validators.token.required(),
      refresh_token: validators.token,
      id_token: validators.assertion,
      scope: Joi.string().required().allow(''),
      token_type: Joi.string().valid('bearer').required(),
      expires_in: Joi.number().max(MAX_TTL_S).required(),
      auth_at: Joi.number(),
    })
  },
  handler: function tokenEndpoint(req, reply) {
    var params = req.payload;
    P.try(function() {
      if (params.grant_type === GRANT_AUTHORIZATION_CODE) {
        return confirmClient(params.client_id, params.client_secret)
        .then(function() {
          return confirmCode(params.client_id, params.code);
        });
      } else if (params.grant_type === GRANT_REFRESH_TOKEN) {
        return confirmClient(params.client_id, params.client_secret)
        .then(function() {
          return confirmRefreshToken(params);
        });
      } else if (params.grant_type === GRANT_JWT) {
        return confirmJwt(params);
      } else {
        // else our Joi validation failed us?
        logger.critical('joi.grant_type', params.grant_type);
        throw Error('unreachable');
      }
    })
    .then(function(vals) {
      vals.ttl = params.ttl;
      if (vals.scope && Scope(vals.scope).has(SCOPE_OPENID)) {
        vals.idToken = true;
      }
      return vals;
    })
    .then(generateTokens)
    .done(reply, reply);
  }
};


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

function confirmJwt(params) {
  var assertion = params.assertion;
  logger.debug('jwt.confirm', assertion);

  return SERVICE_JWTOOL.verify(assertion).catch(function(err) {
    logger.info('jwt.invalid.verify', err.message);
    throw AppError.invalidAssertion();
  }).then(function(payload) {
    logger.verbose('jwt.payload', payload);

    // this cannot fail! huh, why?
    // if the assertion couldn't decode, or the jku was not in our
    // trusted list, the assertion would not have verified.
    var client = SERVICE_CLIENTS[JwTool.unverify(assertion).header.jku];

    // ohai eslint complexity
    var uid = _validateJwtSub(payload.sub);

    if (payload.aud !== JWT_AUD) {
      logger.debug('jwt.invalid.aud', payload.aud);
      throw AppError.invalidAssertion();
    }

    if (!Scope(client.scope).has(payload.scope)) {
      logger.debug('jwt.invalid.scopes', {
        allowed: client.scope,
        requested: payload.scope
      });
      throw AppError.invalidScopes(payload.scope);
    }

    var now = Date.now() / 1000;
    if ((payload.iat || Infinity) > now) {
      logger.debug('jwt.invalid.iat', { now: now, iat: payload.iat });
      throw AppError.invalidAssertion();
    }
    if ((payload.exp || -Infinity) < now) {
      logger.debug('jwt.invalid.exp', { now: now, exp: payload.exp });
      throw AppError.invalidAssertion();
    }

    // We can't know the email based on a service token,
    // so we can't cache it locally.  Insert an empty string
    // for now, while we complete the process of entirely
    // removing the 'email' column from our database.
    return {
      clientId: client.id,
      userId: uid,
      scope: payload.scope,
      email: ''
    };
  });
}

function _validateJwtSub(sub) {
  if (!sub) {
    logger.debug('jwt.invalid.sub.missing');
    throw AppError.invalidAssertion();
  }
  if (sub.length !== 32 || !HEX_STRING.test(sub)) {
    logger.debug('jwt.invalid.sub', sub);
    throw AppError.invalidAssertion();
  }

  return sub;
}

function generateIdToken(options) {
  var now = Math.floor(Date.now() / 1000);
  var claims = {
    sub: hex(options.userId),
    aud: hex(options.clientId),
    iss: ID_TOKEN_ISSUER,
    iat: now,
    exp: now + ID_TOKEN_EXPIRATION
  };
  return ID_TOKEN_KEY.sign(claims);
}

function generateTokens(options) {
  // we always are generating an access token here
  // but depending on options, we may also be generating a refresh_token
  var promises = {
    access: db.generateAccessToken(options)
  };
  if (options.offline) {
    promises.refresh = db.generateRefreshToken(options);
  }
  if (options.idToken) {
    promises.idToken = generateIdToken(options);
  }
  return P.props(promises).then(function(result) {
    var access = result.access;
    var refresh = result.refresh;
    var idToken = result.idToken;

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
    if (idToken) {
      json.id_token = idToken;
    }
    return json;
  });
}

