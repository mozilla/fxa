/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const Joi = require('@hapi/joi');
const validators = require('../routes/validators');

module.exports = (config) => {
  return {
    path: '/v1/client/:clientId',
    method: 'GET',
    validate: {
      params: {
        clientId: validators.clientId.required(),
      },
      response: {
        id: validators.clientId.required(),
        name: Joi.string()
          .max(255)
          .regex(validators.DISPLAY_SAFE_UNICODE)
          .required(),
        trusted: Joi.boolean().required(),
        image_uri: Joi.string().optional().allow(''),
        redirect_uri: Joi.string().required().allow(''),
      },
    },
  };
};
