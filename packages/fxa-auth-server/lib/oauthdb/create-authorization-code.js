/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const Joi = require('@hapi/joi');
const validators = require('../routes/validators');

module.exports = (config) => {
  return {
    path: '/v1/authorization',
    method: 'POST',
    validate: {
      payload: Joi.object({
        response_type: Joi.string().valid('code').default('code'),
        client_id: validators.clientId.required(),
        assertion: validators.assertion.required(),
        redirect_uri: Joi.string()
          .max(256)
          .uri({
            scheme: ['http', 'https'],
          })
          .optional(),
        scope: validators.scope.optional(),
        state: Joi.string().max(256).required(),
        access_type: Joi.string().valid('offline', 'online').default('online'),
        code_challenge_method: validators.pkceCodeChallengeMethod.optional(),
        code_challenge: validators.pkceCodeChallenge.optional(),
        keys_jwe: validators.jwe.optional(),
        acr_values: Joi.string().max(256).allow(null).optional(),
      }).and('code_challenge', 'code_challenge_method'),
      response: Joi.object({
        redirect: Joi.string(),
        code: validators.authorizationCode,
        state: Joi.string().max(256),
      }),
    },
  };
};
