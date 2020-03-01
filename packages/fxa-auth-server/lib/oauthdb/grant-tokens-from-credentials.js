/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const Joi = require('@hapi/joi');
const validators = require('../routes/validators');

module.exports = config => {
  return {
    path: '/v1/token',
    method: 'POST',
    validate: {
      payload: Joi.object({
        grant_type: Joi.string()
          .valid('fxa-credentials')
          .default('fxa-credentials'),
        client_id: validators.clientId.required(),
        assertion: validators.assertion.required(),
        scope: validators.scope.optional(),
        access_type: Joi.string()
          .valid('online', 'offline')
          .default('online'),
        // Note: the max allowed TTL is currently configured in oauth-server config,
        // making it hard to know what limit to set here.
        ttl: Joi.number()
          .positive()
          .optional(),
        resource: validators.resourceUrl.optional(),
      }),
      response: Joi.object({
        access_token: validators.accessToken.required(),
        refresh_token: validators.refreshToken.optional(),
        id_token: validators.assertion.optional(),
        scope: validators.scope.required(),
        auth_at: Joi.number().required(),
        token_type: Joi.string()
          .valid('bearer')
          .required(),
        expires_in: Joi.number().required(),
      }),
    },
  };
};
