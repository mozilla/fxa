/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const buf = require('buf').hex;
const hex = require('buf').to.hex;
const Joi = require('joi');
const URI = require('urijs');

const AppError = require('../error');
const config = require('../config');
const db = require('../db');
const logger = require('../logging')('routes.authorization');
const P = require('../promise');
const Scope = require('../scope');
const validators = require('../validators');
const verify = require('../browserid');

const CODE = 'code';
const TOKEN = 'token';

const ACCESS_TYPE_ONLINE = 'online';
const ACCESS_TYPE_OFFLINE = 'offline';

const PKCE_SHA256_CHALLENGE_METHOD = 'S256'; // This server only supports S256 PKCE, no 'plain'
const PKCE_CODE_CHALLENGE_LENGTH = 43;

const MAX_TTL_S = config.get('expiration.accessToken') / 1000;

const UNTRUSTED_CLIENT_ALLOWED_SCOPES = [
  'openid',
  'profile:uid',
  'profile:email',
  'profile:display_name'
];

const allowHttpRedirects = config.get('allowHttpRedirects');

var ALLOWED_SCHEMES = [
  'https'
];

if (allowHttpRedirects === true) {
  // http scheme used when developing OAuth clients
  ALLOWED_SCHEMES.push('http');
}

function isLocalHost(url) {
  var host = new URI(url).hostname();
  return host === 'localhost' || host === '127.0.0.1';
}

function detectInvalidScopes(requestedScopes, validScopes) {
  var invalidScopes = [];

  requestedScopes.forEach(function(scope) {
    if (validScopes.indexOf(scope) === -1) {
      invalidScopes.push(scope);
    }
  });

  return invalidScopes;
}

function generateCode(claims, client, scope, req) {
  return db.generateCode({
    clientId: client.id,
    userId: buf(claims.uid),
    email: claims['fxa-verifiedEmail'],
    scope: scope,
    authAt: claims['fxa-lastAuthAt'],
    offline: req.payload.access_type === ACCESS_TYPE_OFFLINE,
    codeChallengeMethod: req.payload.code_challenge_method,
    codeChallenge: req.payload.code_challenge,
    keysJwe: req.payload.keys_jwe,
  }).then(function(code) {
    logger.debug('redirecting', { uri: req.payload.redirect_uri });

    var redirect = URI(req.payload.redirect_uri)
      .addQuery({ state: req.payload.state, code: hex(code) });


    var out = { redirect: String(redirect) };
    logger.info('generateCode', {
      request: {
        client_id: req.payload.client_id,
        redirect_uri: req.payload.redirect_uri,
        scope: req.payload.scope,
        state: req.payload.state,
        response_type: req.payload.response_type
      },
      response: out
    });
    return out;
  });
}

function generateGrant(claims, client, scope, req) {
  return db.generateAccessToken({
    clientId: client.id,
    userId: buf(claims.uid),
    email: claims['fxa-verifiedEmail'],
    scope: scope,
    ttl: req.payload.ttl
  }).then(function(token) {
    return {
      access_token: hex(token.token),
      token_type: 'bearer',
      expires_in: Math.floor((token.expiresAt - Date.now()) / 1000),
      scope: scope.join(' '),
      auth_at: claims['fxa-lastAuthAt']
    };
  });
}

module.exports = {
  validate: {
    payload: {
      client_id: validators.clientId,
      assertion: validators.assertion
        .required(),
      redirect_uri: Joi.string()
        .max(256)
        // uri validation ref: https://github.com/hapijs/joi/blob/master/API.md#stringurioptions
        .uri({
          scheme: ALLOWED_SCHEMES
        }),
      scope: validators.scope,
      response_type: Joi.string()
        .valid(CODE, TOKEN)
        .default(CODE),
      state: Joi.string()
        .max(256)
        .when('response_type', {
          is: TOKEN,
          then: Joi.optional(),
          otherwise: Joi.required()
        }),
      ttl: Joi.number()
        .positive()
        .max(MAX_TTL_S)
        .default(MAX_TTL_S)
        .when('response_type', {
          is: TOKEN,
          then: Joi.optional(),
          otherwise: Joi.forbidden()
        }),
      access_type: Joi.string()
        .valid(ACCESS_TYPE_OFFLINE, ACCESS_TYPE_ONLINE)
        .default(ACCESS_TYPE_ONLINE)
        .optional(),
      code_challenge_method: Joi.string()
        .valid(PKCE_SHA256_CHALLENGE_METHOD)
        .when('response_type', {
          is: CODE,
          then: Joi.optional(),
          otherwise: Joi.forbidden()
        }),
      code_challenge: Joi.string()
        .length(PKCE_CODE_CHALLENGE_LENGTH)
        .when('response_type', {
          is: CODE,
          then: Joi.optional(),
          otherwise: Joi.forbidden()
        }),
      keys_jwe: validators.jwe
        .when('response_type', {
          is: CODE,
          then: Joi.optional(),
          otherwise: Joi.forbidden()
        })
    }
  },
  response: {
    schema: Joi.object().keys({
      redirect: Joi.string(),
      access_token: validators.token,
      token_type: Joi.string().valid('bearer'),
      scope: Joi.string().allow(''),
      auth_at: Joi.number(),
      expires_in: Joi.number()
    }).without('redirect', [
      'access_token'
    ]).with('access_token', [
      'token_type',
      'scope',
      'auth_at',
      'expires_in'
    ])
  },
  handler: function authorizationEndpoint(req, reply) {
    /*eslint complexity: [2, 13] */
    logger.debug('response_type', req.payload.response_type);
    var start = Date.now();
    var wantsGrant = req.payload.response_type === TOKEN;
    var exitEarly = false;
    var scope = Scope(req.payload.scope || []);
    P.all([
      verify(req.payload.assertion).then(function(claims) {
        logger.info('time.browserid_verify', { ms: Date.now() - start });
        if (! claims) {
          exitEarly = true;
          throw AppError.invalidAssertion();
        }
        return claims;
      }),
      db.getClient(Buffer.from(req.payload.client_id, 'hex')).then(function(client) {
        logger.info('time.db_get_client', { ms: Date.now() - start });
        if (exitEarly) {
          // assertion was invalid, we can just stop here
          return;
        }
        if (! client) {
          logger.debug('notFound', { id: req.payload.client_id });
          throw AppError.unknownClient(req.payload.client_id);
        } else if (! client.trusted) {
          var invalidScopes = detectInvalidScopes(scope.values(),
                                UNTRUSTED_CLIENT_ALLOWED_SCOPES);

          if (invalidScopes.length) {
            throw AppError.invalidScopes(invalidScopes);
          }
        }

        // PKCE client enforcement
        if (client.publicClient &&
           (! req.payload.code_challenge_method || ! req.payload.code_challenge)) {
          // only Public Clients support code_challenge
          logger.info('client.missingPkceParameters');
          throw AppError.missingPkceParameters();
        } else if (! client.publicClient &&
            (req.payload.code_challenge_method || req.payload.code_challenge)) {
          // non-Public Clients do not allow code challenge
          logger.info('client.notPublicClient');
          throw AppError.notPublicClient({ id: req.payload.client_id });
        }

        var uri = req.payload.redirect_uri || client.redirectUri;

        if (uri !== client.redirectUri) {
          logger.debug('redirect.mismatch', {
            param: uri,
            registered: client.redirectUri
          });

          if (config.get('localRedirects') && isLocalHost(uri)) {
            logger.debug('redirect.local', { uri: uri });
          } else {
            throw AppError.incorrectRedirect(uri);
          }

        }

        if (wantsGrant && ! client.canGrant) {
          logger.warn('implicitGrant.notAllowed', {
            id: req.payload.client_id
          });
          throw AppError.invalidResponseType();
        }

        req.payload.redirect_uri = uri;

        return client;
      }),
      scope.values(),
      req
    ])
    .spread(wantsGrant ? generateGrant : generateCode)
    .done(reply, reply);
  }
};
