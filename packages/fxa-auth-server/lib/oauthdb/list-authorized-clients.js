/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const Joi = require('joi');
const validators = require('../routes/validators');

module.exports = (config) => {
  return {
    path: '/v1/authorized-clients',
    method: 'POST',
    validate: {
      payload: {
        assertion: validators.assertion.required(),
      },
      response: Joi.array().items(Joi.object({
        client_id: validators.clientId,
        refresh_token_id: validators.refreshToken.optional(),
        client_name: Joi.string().max(255).regex(validators.DISPLAY_SAFE_UNICODE).required(),
        created_time: Joi.number().min(0).required(),
        last_access_time: Joi.number().min(0).required().allow(null),
        scope: Joi.array().items(validators.scope).required(),
      }))
    }
  };
};
