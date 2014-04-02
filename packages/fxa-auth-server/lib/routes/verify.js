/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('hapi').types;

const AppError = require('../error');
const config = require('../config');
const db = require('../db');

const HEX_STRING = /^[0-9a-f]+$/;

module.exports = {
  validate: {
    payload: {
      token: Joi.string()
        .length(config.get('unique.token') * 2)
        .regex(HEX_STRING)
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
    db.getToken(Buffer(req.payload.token, 'hex'))
    .then(function(token) {
      if (!token) {
        throw AppError.invalidToken();
      }
      var blob = {
        user: token.userId.toString('hex'),
        scope: token.scope
      };

      // token.scope is a Set/Array
      if (token.scope.indexOf('profile') !== -1) {
        blob.email = token.email;
      }

      return blob;
    }).done(reply, reply);
  }
};
