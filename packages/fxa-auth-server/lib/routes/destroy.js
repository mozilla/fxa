/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/*jshint camelcase: false*/

const Joi = require('joi');

const unbuf = require('buf').unbuf.hex;

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
      client_secret: validators.clientSecret
    }
  },
  handler: function destroyToken(req, reply) {
    var token = encrypt.hash(req.payload.token);
    var secret = encrypt.hash(req.payload.client_secret);

    db.getToken(token)
    .then(function(tok) {
      if (!tok) {
        throw AppError.invalidToken();
      }
      return db.getClient(tok.clientId);
    }).then(function(client) {
      if (client && (unbuf(client.secret) !== unbuf(secret))) {
        throw AppError.incorrectSecret(client && unbuf(client.id));
      }
      // if client doesn't exist, but token does, then just clean up
      return db.removeToken(token);
    }).done(reply, reply);

  }
};
