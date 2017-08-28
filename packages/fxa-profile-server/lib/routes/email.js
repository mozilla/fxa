/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('joi');

const AppError = require('../error');
const config = require('../config');
const logger = require('../logging')('routes.email');
const request = require('../request');

const AUTH_SERVER_URL = config.get('authServer.url') + '/account/profile';

module.exports = {
  auth: {
    strategy: 'oauth',
    scope: ['profile', 'profile:email', /* openid-connect scope */'email' ]
  },
  response: {
    schema: {
      email: Joi.string().required()
    }
  },
  handler: function email(req, reply) {
    request.get(AUTH_SERVER_URL, {
      headers: {
        Authorization: 'Bearer ' + req.auth.credentials.token
      },
      json: true
    }, function(err, res, body) {
      if (err) {
        logger.error('request.auth_server.network', err);
        return reply(new AppError.authError('network error'));
      }
      if (res.statusCode >= 400) {
        body = body && body.code ? body : { code: res.statusCode };
        if (res.statusCode >= 500) {
          logger.error('request.auth_server.fail', body);
          return reply(new AppError.authError('auth-server server error'));
        }
        // Return Unauthorized if the token turned out to be invalid,
        // or if the account has been deleted on the auth-server.
        // (we can still have valid oauth tokens for deleted accounts,
        // because distributed state).
        if (body.code === 401 || body.errno === 102) {
          logger.info('request.auth_server.fail', body);
          return reply(new AppError.unauthorized(body.message));
        }
        // There should be no other 400-level errors, unless we're
        // sending a badly-formed request of our own.  That warrants
        // an "Internal Server Error" on our part.
        logger.error('request.auth_server.fail', body);
        return reply(new AppError({
          code: 500,
          message: 'error communicating with auth server'
        }));
      }

      if (! body || ! body.email) {
        return reply(
          new AppError('email field missing from auth response')
        );
      }
      reply({
        email: body.email
      });
    });
  }
};

