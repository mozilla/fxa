/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('joi');

const AppError = require('../error');
const logger = require('../logging')('routes.email');

module.exports = {
  auth: {
    strategy: 'oauth',
    scope: ['profile:email', /* openid-connect scope */ 'email'],
  },
  response: {
    schema: {
      email: Joi.string().required(),
    },
  },
  handler: function email(req, reply) {
    req.server.inject(
      {
        allowInternals: true,
        method: 'get',
        url: '/v1/_core_profile',
        headers: req.headers,
        credentials: req.auth.credentials,
      },
      res => {
        if (res.statusCode !== 200) {
          return reply(res);
        }
        // Since this route requires 'email' scope,
        // we should always get an email field back.
        if (!res.result.email) {
          logger.error('request.auth_server.fail', res.result);
          return reply(
            new AppError({
              code: 500,
              message: 'auth server did not return email',
            })
          );
        }
        return reply({
          email: res.result.email,
        });
      }
    );
  },
};
