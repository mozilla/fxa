/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Hello, dear traveller! Please, turn back now. It's dangerous in here!

/*jshint camelcase: false*/
const crypto = require('crypto');
const AppError = require('../error');
const buf = require('buf').hex;
const hex = require('buf').to.hex;
const Joi = require('joi');
const JwTool = require('fxa-jwtool');
const ScopeSet = require('fxa-shared').oauth.scopes;

const config = require('../config');
const db = require('../db');
const encrypt = require('../encrypt');
const logger = require('../logging')('routes.token');
const P = require('../promise');
const util = require('../util');
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

const SCOPE_OPENID = ScopeSet.fromArray(['openid']);

const ID_TOKEN_EXPIRATION = Math.floor(config.get('openid.ttl') / 1000);
const ID_TOKEN_ISSUER = config.get('openid.issuer');
const ID_TOKEN_KEY = JwTool.JWK.fromObject(config.get('openid.key'), {
  iss: ID_TOKEN_ISSUER
});

const REFRESH_LAST_USED_AT_UPDATE_AFTER_MS = config.get('refreshToken.updateAfter');

const BASIC_AUTH_REGEX = /^Basic\s+([a-z0-9+\/]+)$/i;

const PAYLOAD_SCHEMA = Joi.object({

  client_id: validators.clientId
    .when('grant_type', {
      is: GRANT_JWT,
      then: Joi.forbidden()
    })
    .when('$headers.authorization', {
      is: Joi.string().required(),
      then: Joi.forbidden()
    }),

  client_secret: validators.clientSecret
    .when('grant_type', {
      is: GRANT_JWT,
      then: Joi.forbidden()
    })
    .when('code_verifier', {
      is: Joi.string().required(), // if (typeof code_verifier === 'string') {
      then: Joi.forbidden()
    })
    .when('grant_type', {
      is: GRANT_REFRESH_TOKEN,
      then: Joi.optional()
    })
    .when('$headers.authorization', {
      is: Joi.string().required(),
      then: Joi.forbidden()
    }),

  code_verifier: validators.codeVerifier
    .when('grant_type', {
      is: GRANT_JWT,
      then: Joi.forbidden()
    }),

  redirect_uri: validators.redirectUri.optional(),

  grant_type: Joi.string()
    .valid(GRANT_AUTHORIZATION_CODE, GRANT_REFRESH_TOKEN, GRANT_JWT)
    .default(GRANT_AUTHORIZATION_CODE)
    .optional(),

  ttl: Joi.number()
    .positive()
    .max(MAX_TTL_S)
    .default(MAX_TTL_S)
    .optional(),

  scope: Joi.alternatives().when('grant_type', {
    is: GRANT_REFRESH_TOKEN,
    then: validators.scope,
    otherwise: Joi.optional()
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
//      confirm the client credentials in `confirmClientSecret()`.
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
    headers: Joi.object({
      'authorization': Joi.string().regex(BASIC_AUTH_REGEX).optional()
    }).options({ allowUnknown: true }),
    // stripUnknown is used to allow various oauth2 libraries to be used
    // with FxA OAuth. Sometimes, they will send other parameters that
    // we don't use, such as `response_type`, or something else. Instead
    // of giving an error here, we can just ignore them.
    payload: PAYLOAD_SCHEMA.options({ stripUnknown: true })
  },
  response: {
    schema: Joi.object().keys({
      access_token: validators.token.required(),
      refresh_token: validators.token,
      id_token: validators.assertion,
      scope: validators.scope.required().allow(''),
      token_type: Joi.string().valid('bearer').required(),
      expires_in: Joi.number().max(MAX_TTL_S).required(),
      auth_at: Joi.number(),
      keys_jwe: validators.jwe.optional()
    })
  },
  handler: function tokenEndpoint(req, reply) {
    var params = req.payload;
    params.scope = ScopeSet.fromString(params.scope || '');
    P.try(function() {

      // Clients are allowed to provide credentials in either
      // the Authorization header or request body.  Normalize.
      const authzMatch = BASIC_AUTH_REGEX.exec(req.headers.authorization || '');
      if (authzMatch) {
        const creds = Buffer.from(authzMatch[1], 'base64').toString().split(':');
        const err = new AppError.invalidRequestParameter('authorization');
        if (creds.length !== 2) {
          throw err;
        }
        params.client_id = Joi.attempt(creds[0], validators.clientId, err);
        params.client_secret = Joi.attempt(creds[1], validators.clientSecret, err);
      }

      var clientId = params.client_id;

      if (params.grant_type === GRANT_AUTHORIZATION_CODE) {
        return getClientById(clientId).then(function(client) {
          if (params.code_verifier && validPublicClient(client)) {
            return confirmPkceCode(params.code, params.code_verifier);
          } else {
            return confirmClientSecret(client, params.client_secret).then(function() {
              return confirmCode(params.client_id, params.code);
            });
          }
        });
      } else if (params.grant_type === GRANT_REFRESH_TOKEN) {
        // If the client has a client_secret, check that it's provided and valid in the refresh request.
        // If the client does not have client_secret, check that one was not provided in the refresh request.
        return getClientById(clientId).then(function(client) {
          var confirmClientPromise;

          if (client.publicClient) {
            if (params.client_secret) {
              throw new AppError.invalidRequestParameter('client_secret');
            }

            confirmClientPromise = P.resolve();
          } else {
            confirmClientPromise = confirmClientSecret(client, params.client_secret);
          }

          return confirmClientPromise
            .then(function() {
              return confirmRefreshToken(params);
            });
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
      if (vals.scope && vals.scope.contains(SCOPE_OPENID)) {
        vals.idToken = true;
      }
      return vals;
    })
    .then(generateTokens)
    .done(reply, reply);
  }
};

/**
 * Generate a PKCE code_challenge
 * See https://tools.ietf.org/html/rfc7636#section-4.6 for details
 */
function pkceHash(input) {
  return util.base64URLEncode(crypto.createHash('sha256').update(input).digest());
}

function validPublicClient(client) {
  if (! client.publicClient) {
    logger.debug('client.notPublicClient', { id: client.id });
    throw AppError.notPublicClient(client.id);
  }

  return true;
}

function getClientById(clientId) {
  return db.getClient(buf(clientId)).then(function(client) {
    if (! client) {
      logger.debug('client.notFound', { id: clientId });
      throw AppError.unknownClient(clientId);
    }

    return client;
  });
}

function confirmPkceCode(code, pkceVerifier) {
  return db.getCode(buf(code)).then(function(codeObj) {
    if (! codeObj) {
      logger.debug('code.notFound', { code: code });
      throw AppError.unknownCode(code);
    }

    const pkceHashValue = pkceHash(pkceVerifier);
    if (codeObj.codeChallenge &&
        codeObj.codeChallengeMethod === 'S256' &&
        pkceHashValue === codeObj.codeChallenge) {
      return db.removeCode(buf(code)).then(function() {
        return codeObj;
      });
    } else {
      throw AppError.mismatchCodeChallenge(pkceHashValue);
    }
  });
}

function confirmClientSecret(client, secret) {
  return P.resolve().then(function() {
    var id = client.id;
    var submitted = hex(encrypt.hash(buf(secret)));
    var stored = hex(client.hashedSecret);

    if (submitted !== stored) {
      var storedPrevious;
      if (client.hashedSecretPrevious) {
        // Check if secret used is the current previous secret
        storedPrevious = hex(client.hashedSecretPrevious);
        if (submitted === storedPrevious) {
          logger.info('client.matchSecretPrevious', { client: id });
          return client;
        }
      }

      logger.info('client.mismatchSecret', { client: id });
      logger.verbose('client.mismatchSecret.details', {
        submitted: submitted,
        db: stored,
        dbPrevious: storedPrevious
      });
      throw AppError.incorrectSecret(id);
    }

    return client;
  });
}

function confirmCode(id, code) {
  return db.getCode(buf(code)).then(function(codeObj) {
    if (! codeObj) {
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
    return db.removeCode(buf(code)).then(function() {
      return codeObj;
    });
  });
}

function confirmRefreshToken(params) {
  return db.getRefreshToken(encrypt.hash(params.refresh_token))
  .then(function(tokObj) {
    if (! tokObj) {
      logger.debug('refresh_token.notFound', params.refresh_token);
      throw AppError.invalidToken();
    } else if (hex(tokObj.clientId) !== hex(params.client_id)) {
      logger.debug('refresh_token.mismatch', {
        client: params.client_id,
        code: tokObj.clientId
      });
      throw AppError.invalidToken();
    } else if (! tokObj.scope.contains(params.scope)) {
      logger.debug('refresh_token.invalidScopes', {
        allowed: tokObj.scope,
        requested: params.scope
      });
      throw AppError.invalidScopes();
    }
    tokObj.scope = params.scope;

    var now = new Date();
    var lastUsedAt = tokObj.lastUsedAt;

    if ((now - lastUsedAt) > REFRESH_LAST_USED_AT_UPDATE_AFTER_MS){
      db.usedRefreshToken(encrypt.hash(params.refresh_token)).then(function() {
        logger.debug('usedRefreshToken.updated', now);
      });
    } else {
      logger.debug('usedRefreshToken.not_updated');
    }
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

    const requestedScope = ScopeSet.fromString(payload.scope);
    if (! ScopeSet.fromString(client.scope).contains(requestedScope)) {
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
      scope: requestedScope,
      email: ''
    };
  });
}

function _validateJwtSub(sub) {
  if (! sub) {
    logger.debug('jwt.invalid.sub.missing');
    throw AppError.invalidAssertion();
  }
  if (sub.length !== 32 || ! HEX_STRING.test(sub)) {
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
  if (options.amr) {
    claims.amr = options.amr;
  }
  if (options.aal) {
    claims['fxa-aal'] = options.aal;
    claims.acr = 'AAL' + options.aal;
  }
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
      scope: access.scope.toString()
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
    if (options.keysJwe) {
      json.keys_jwe = options.keysJwe;
    }
    return json;
  });
}

