/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/*jshint camelcase: false*/

const Joi = require('joi');

const AppError = require('../error');
const config = require('../config');
const db = require('../db');
const encrypt = require('../encrypt');
const HEX_STRING = /^[0-9a-f]+$/;

function eq(orig, unhashed) {
  return orig.toString('hex') === encrypt.hash(unhashed).toString('hex');
}

module.exports = {
  validate: {
    payload: {
      token: Joi.string()
        .length(config.get('unique.token') * 2) // hex = bytes*2
        .regex(HEX_STRING)
        .required(),
      client_secret: Joi.string()
        .length(config.get('unique.clientSecret') * 2) // hex = bytes*2
        .regex(HEX_STRING)
        .required()
    }
  },
  handler: function destroyToken(req, reply) {
    var token = req.payload.token;
    var secret = req.payload.client_secret;

    db.getToken(Buffer(token, 'hex'))
    .then(function(tok) {
      if (!tok) {
        throw AppError.invalidToken();
      }
      return db.getClient(tok.clientId);
    }).then(function(client) {
      if (client && !eq(client.secret, secret)) {
        throw AppError.incorrectSecret(client && client.id.toString('hex'));
      }
      // if client doesn't exist, but token does, then just clean up
      return db.removeToken(token);
    }).done(reply, reply);

  }
};
