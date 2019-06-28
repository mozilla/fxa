/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const Joi = require('joi');
const validators = require('../routes/validators');

module.exports = config => {
  return {
    path: '/v1/token',
    method: 'POST',
    validate: {
      payload: Joi.object({
        grant_type: Joi.string()
          .valid('refresh_token')
          .required(),
        client_id: validators.clientId.required(),
        client_secret: validators.clientSecret.optional(),
        refresh_token: validators.refreshToken.required(),
        scope: validators.scope.optional(),
        // Note: the max allowed TTL is currently configured in oauth-server config,
        // making it hard to know what limit to set here.
        ttl: Joi.number()
          .positive()
          .optional(),
      }),
      response: Joi.object({
        access_token: validators.accessToken.required(),
        scope: validators.scope.required(),
        token_type: Joi.string()
          .valid('bearer')
          .required(),
        expires_in: Joi.number().required(),
      }),
    },
  };
};
