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
    scope: ['profile', 'profile:email']
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
        logger.error('request.auth_server.fail', { code: res.statusCode });
        return reply(new AppError.authError('auth server error'));
      }

      if (!body || !body.email) {
        return reply(
          new AppError.authError('email field missing from auth response')
        );
      }
      reply({
        email: body.email
      });
    });
  }
};

