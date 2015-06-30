/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('joi');

const AppError = require('../error');
const config = require('../config');
const db = require('../db');
const encrypt = require('../encrypt');
const validators = require('../validators');

module.exports = {
  validate: {
    payload: {
      token: Joi.string()
        .length(config.get('unique.token') * 2) // hex = bytes*2
        .regex(validators.HEX_STRING)
        .required(),
      client_secret: Joi.string()
    }
  },
  handler: function destroyToken(req, reply) {
    var token = encrypt.hash(req.payload.token);

    db.getToken(token)
    .then(function(tok) {
      if (!tok) {
        throw AppError.invalidToken();
      }
      return db.removeToken(token);
    }).done(function() {
      reply({});
    }, reply);
  }
};
