/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const url = require('url');

const buf = require('buf').hex;
const hex = require('buf').to.hex;
const Hapi = require('hapi');
const Joi = require('joi');

const AppError = require('../error');
const config = require('../config');
const db = require('../db');
const logger = require('../logging').getLogger('fxa.routes.authorization');
const P = require('../promise');
const verify = require('../browserid');

const HEX_STRING = /^(?:[0-9a-f]{2})+$/;
const CODE = 'code';
const TOKEN = 'token';

/*jshint camelcase: false*/

function set(arr) {
  var obj = {};
  for (var i = 0; i < arr.length; i++) {
    obj[arr[i]] = true;
  }
  return Object.keys(obj);
}

function generateCode(claims, client, scope, req) {

  return db.generateCode(
    client.id,
    buf(claims.uid),
    claims['fxa-verifiedEmail'],
    scope
  ).then(function(code) {
    logger.debug('redirecting with code to %s', req.payload.redirect_uri);
    var redirect = url.parse(req.payload.redirect_uri, true);
    if (req.payload.state) {
      redirect.query.state = req.payload.state;
    }
    redirect.query.code = hex(code);
    delete redirect.search;
    delete redirect.path;

    return { redirect: url.format(redirect) };
  });
}

function generateGrant(claims, client, scope) {
  return db.generateToken({
    clientId: client.id,
    userId: buf(claims.uid),
    email: claims['fxa-verifiedEmail'],
    scope: scope
  }).then(function(token) {
    return {
      access_token: hex(token.token),
      token_type: 'bearer',
      scope: scope.join(' ')
    };
  });
}

module.exports = {
  validate: {
    payload: {
      client_id: Joi.string()
        .length(config.get('unique.id') * 2) // hex = bytes*2
        .regex(HEX_STRING)
        .required(),
      assertion: Joi.string()
        // taken from mozilla/persona/lib/validate.js
        .min(50)
        .max(10240)
        .regex(/^[a-zA-Z0-9_\-\.~=]+$/)
        .required(),
      redirect_uri: Joi.string()
        .max(256),
      scope: Joi.string()
        .max(256),
      response_type: Joi.string()
        .valid(CODE, TOKEN)
        .default(CODE),
      state: Joi.string()
        .max(256)
        .when('response_type', {
          is: TOKEN,
          then: Joi.optional(),
          otherwise: Joi.required()
        })
    }
  },
  response: {
    schema: Joi.object().keys({
      redirect: Joi.string(),
      access_token: Joi.string().regex(HEX_STRING),
      token_type: Joi.string().valid('bearer'),
      scope: Joi.string()
    }).without('redirect', [
      'access_token',
      'token_type',
      'scope']
    ).with('access_token', 'token_type', 'scope')
  },
  handler: function authorizationEndpoint(req, reply) {
    var wantsGrant = req.payload.response_type === TOKEN;
    P.all([
      verify(req.payload.assertion).then(function(claims) {
        if (!claims) {
          throw AppError.invalidAssertion();
        }
        return claims;
      }),
      db.getClient(Buffer(req.payload.client_id, 'hex')).then(function(client) {
        if (!client) {
          logger.debug('client_id="%s" not found', req.payload.client_id);
          throw AppError.unknownClient(req.payload.client_id);
        } else if (!client.whitelisted) {
          logger.error('client_id="%s" not whitelisted', req.payload.client_id);
          // TODO: implement external clients so we can remove this
          throw Hapi.error.notImplemented();
        }

        if (!req.payload.redirect_uri) {
          req.payload.redirect_uri = client.redirectUri;
        }
        if (req.payload.redirect_uri !== client.redirectUri) {
          logger.debug('redirect_uri [%s] does not match registered [%s]',
            req.payload.redirect_uri, client.redirectUri);
          throw AppError.incorrectRedirect(req.payload.redirect_uri);
        }

        if (wantsGrant && !client.canGrant) {
          logger.warn(
            'client_id [%s] tried to get implicit grant without permission',
            req.payload.client_id
          );
          throw AppError.invalidResponseType();
        }

        return client;
      }),
      // make scope a set
      req.payload.scope ? set(req.payload.scope.split(' ')) : [],
      req
    ])
    .spread(wantsGrant ? generateGrant : generateCode)
    .done(reply, reply);
  }
};

