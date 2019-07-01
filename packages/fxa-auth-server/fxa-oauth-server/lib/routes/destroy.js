/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('joi');

const AppError = require('../error');
const db = require('../db');
const encrypt = require('../encrypt');
const validators = require('../validators');

/*jshint camelcase: false*/

module.exports = {
  validate: {
    payload: Joi.object()
      .keys({
        client_secret: Joi.string().allow(''),
        access_token: validators.token,
        refresh_token: validators.token,
        refresh_token_id: validators.token,
      })
      .rename('token', 'access_token')
      .xor('access_token', 'refresh_token', 'refresh_token_id'),
  },
  handler: async function destroyToken(req) {
    var token;
    var getToken;
    var removeToken;
    if (req.payload.access_token) {
      getToken = 'getAccessToken';
      removeToken = 'removeAccessToken';
      token = encrypt.hash(req.payload.access_token);
    } else {
      getToken = 'getRefreshToken';
      removeToken = 'removeRefreshToken';
      if (req.payload.refresh_token_id) {
        token = req.payload.refresh_token_id;
      } else {
        token = encrypt.hash(req.payload.refresh_token);
      }
    }

    return db[getToken](token)
      .then(function(tok) {
        if (!tok) {
          throw AppError.invalidToken();
        }
        return db[removeToken](token);
      })
      .then(function() {
        return {};
      });
  },
};
