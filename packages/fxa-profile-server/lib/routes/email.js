/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('joi');

const AppError = require('../error');

module.exports = {
  auth: {
    strategy: 'oauth',
    scope: ['profile', 'profile:email']
  },
  response: {
    schema: {
      email: Joi.string().required()
    }
  },
  handler: function email(req, reply) {
    var email = req.auth.credentials.email;
    if (email) {
      reply({
        email: email
      });
    } else {
      reply(new AppError.oauthError('email field missing from oauth response'));
    }
  }
};

