/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const Joi = require('@hapi/joi');
const validators = require('../routes/validators');

module.exports = (config) => {
  return {
    path: '/v1/key-data',
    method: 'POST',
    validate: {
      payload: {
        client_id: validators.clientId.required(),
        assertion: validators.assertion.required(),
        scope: validators.scope.required(),
      },
      response: Joi.object().pattern(
        Joi.any(),
        Joi.object({
          identifier: validators.scope.required(),
          keyRotationSecret: validators.hexString.length(64).required(),
          keyRotationTimestamp: Joi.number().required(),
        })
      ),
    },
  };
};
