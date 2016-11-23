/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const AppError = require('../../error');
const Joi = require('joi');

module.exports = {
  auth: {
    strategy: 'oauth',
    scope: ['profile:write', 'profile:avatar:write']
  },
  response: {
    schema: {
      avatars: Joi.array().required().items(Joi.object({
        id: Joi.string().length(32).required(),
        url: Joi.string().required(),
        selected: Joi.boolean()
      }))
    }
  },
  handler: function avatarList(req, reply) {
    reply(new AppError.deprecated());
  }
};
