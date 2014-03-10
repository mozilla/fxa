/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const url = require('url');

const Hapi = require('hapi');
const Joi = Hapi.types;

const AppError = require('../error');
const config = require('../config');
const db = require('../db');
const logger = require('../logging').getLogger('fxa.routes.authorization');
const Promise = require('../promise');
const verify = require('../browserid');

const HEX_STRING = /^[0-9a-f]+$/;

function set(arr) {
  var obj = {};
  for (var i = 0; i < arr.length; i++) {
    obj[arr[i]] = true;
  }
  return Object.keys(obj);
}

module.exports = {
  validate: {
    query: {
      /*jshint camelcase: false*/
      client_id: Joi.string()
        .length(config.get('unique.id') * 2) // hex = bytes*2
        .regex(HEX_STRING)
        .required(),
      assertion: Joi.string()
        // taken from mozilla/persona/lib/validate.js
        .min(50)
        .max(10240)
        .regex(/^[a-zA-Z0-9_\-\.~]+$/)
        .required(),
      redirect_uri: Joi.string()
        .max(256),
      scope: Joi.string()
        .max(256),
      state: Joi.string()
        .max(256)
    }
  },
  handler: function authorizationEndpoint(req, reply) {
    Promise.all([
      verify(req.query.assertion).then(function(userid) {
        if (!userid) {
          throw AppError.invalidAssertion();
        }
        return Buffer(userid, 'hex');
      }),
      db.getClient(Buffer(req.query.client_id, 'hex')).then(function(client) {
        if (!client) {
          logger.debug('client_id="%s" not found', req.query.client_id);
          throw AppError.unknownClient(req.query.client_id);
        } else if (!client.whitelisted) {
          logger.error('client_id="%s" not whitelisted', req.query.client_id);
          // TODO: implement external clients so we can remove this
          throw Hapi.error.notImplemented();
        }

        if (!req.query.redirect_uri) {
          req.query.redirect_uri = client.redirectUri;
        }
        if (req.query.redirect_uri !== client.redirectUri) {
          logger.debug('redirect_uri [%s] does not match registered [%s]',
            req.query.redirect_uri, client.redirectUri);
          throw AppError.incorrectRedirect(req.query.redirect_uri);
        }

        return client;
      })
    ])
    .spread(function(userid, client) {
      // make scope a set
      var scope = req.query.scope ? set(req.query.scope.split(' ')) : [];
      return db.generateCode(client.id, userid, scope);
    })
    .done(function(code) {
      // for now, since we only use whitelisted clients, we can just
      // redirect right away with a code
      logger.debug('redirecting with code to %s', req.query.redirect_uri);
      var redirect = url.parse(req.query.redirect_uri, true);
      if (req.query.state) {
        redirect.query.state = req.query.state;
      }
      redirect.query.code = code.toString('hex');
      delete redirect.search;
      delete redirect.path;
      reply().redirect(url.format(redirect));
    }, reply);
  }
};

