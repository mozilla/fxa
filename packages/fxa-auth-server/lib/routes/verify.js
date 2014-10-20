/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('joi');

const config = require('../config');
const token = require('../token');
const validators = require('../validators');

module.exports = {
  validate: {
    payload: {
      token: Joi.string()
        .length(config.get('unique.token') * 2)
        .regex(validators.HEX_STRING)
        .required()
    }
  },
  response: {
    schema: {
      user: Joi.string().required(),
      scope: Joi.array(),
      email: Joi.string()
    }
  },
  handler: function verify(req, reply) {
    token.verify(req.payload.token).done(reply, reply);
  }
};
