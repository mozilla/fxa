/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const Joi = require('@hapi/joi');
const validators = require('../routes/validators');

module.exports = config => {
  return {
    path: '/v1/introspect',
    method: 'POST',
    validate: {
      payload: {
        token: Joi.string().required(),
        token_type_hint: Joi.string()
          .allow('refresh_token')
          .default('refresh_token'),
      },
      response: {
        // https://tools.ietf.org/html/rfc7662#section-2.2
        active: Joi.boolean().required(),
        scope: validators.scope.optional(),
        client_id: validators.clientId.optional(),
        token_type: Joi.string().equal(['refresh_token']),
        exp: Joi.number().optional(),
        iat: Joi.number().optional(),
        sub: Joi.string().optional(),
        iss: Joi.string().optional(),
        jti: Joi.string().optional(),
        'fxa-lastUsedAt': Joi.number().optional(),
      },
    },
  };
};
