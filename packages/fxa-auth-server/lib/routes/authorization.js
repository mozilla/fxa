/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const url = require('url');

const Hapi = require('hapi');
const Joi = require('joi');

const AppError = require('../error');
const config = require('../config');
const db = require('../db');
const logger = require('../logging').getLogger('fxa.routes.authorization');
const P = require('../promise');
const verify = require('../browserid');

const HEX_STRING = /^(?:[0-9a-f]{2})+$/;

function set(arr) {
  var obj = {};
  for (var i = 0; i < arr.length; i++) {
    obj[arr[i]] = true;
  }
  return Object.keys(obj);
}

module.exports = {
  validate: {
    payload: {
      /*jshint camelcase: false*/
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
      state: Joi.string()
        .max(256)
        .required()
    }
  },
  response: {
    schema: {
      redirect: Joi.string().required(),
    }
  },
  handler: function authorizationEndpoint(req, reply) {
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

        return client;
      })
    ])
    .spread(function(claims, client) {
      // make scope a set
      var scope = req.payload.scope ? set(req.payload.scope.split(' ')) : [];
      return db.generateCode(
        client.id,
        Buffer(claims.uid, 'hex'),
        claims['fxa-verifiedEmail'],
        scope
      );
    })
    .done(function(code) {
      // for now, since we only use whitelisted clients, we can just
      // redirect right away with a code
      logger.debug('redirecting with code to %s', req.payload.redirect_uri);
      var redirect = url.parse(req.payload.redirect_uri, true);
      if (req.payload.state) {
        redirect.query.state = req.payload.state;
      }
      redirect.query.code = code.toString('hex');
      delete redirect.search;
      delete redirect.path;

      reply({ redirect: url.format(redirect) });
    }, reply);
  }
};

