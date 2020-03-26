/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('@hapi/joi');

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
  handler: async function email(req) {
    return req.server
      .inject({
        allowInternals: true,
        method: 'get',
        url: '/v1/_core_profile',
        headers: req.headers,
        auth: {
          credentials: req.auth.credentials,
          // As of Hapi 18: "To use the new format simply wrap the credentials and optional
          // artifacts with an auth object and add a new strategy key with a name matching
          // a configured authentication strategy."
          // Ref: https://github.com/hapijs/hapi/issues/3871
          strategy: 'oauth',
        },
      })
      .then(res => {
        if (res.statusCode !== 200) {
          return res;
        }
        // Since this route requires 'email' scope,
        // we should always get an email field back.
        if (!res.result.email) {
          logger.error('request.auth_server.fail', res.result);
          throw new AppError({
            code: 500,
            message: 'auth server did not return email',
          });
        }
        return {
          email: res.result.email,
        };
      });
  },
};
