/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const Joi = require('@hapi/joi');
const validators = require('../routes/validators');

module.exports = config => {
  return {
    path: '/v1/authorized-clients/destroy',
    method: 'POST',
    validate: {
      payload: {
        assertion: validators.assertion.required(),
        client_id: validators.clientId.required(),
        refresh_token_id: validators.refreshToken.optional().allow(null),
      },
      response: Joi.object({}),
    },
  };
};
