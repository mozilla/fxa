/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const Joi = require('joi');
const validators = require('../routes/validators');

module.exports = config => {
  return {
    path: '/v1/verify',
    method: 'POST',
    validate: {
      payload: {
        token: validators.accessToken.required(),
      },
      response: {
        user: Joi.string().required(),
        client_id: Joi.string().required(),
        scope: Joi.array().items(validators.scope),
        profile_changed_at: Joi.number().min(0),
      },
    },
  };
};
