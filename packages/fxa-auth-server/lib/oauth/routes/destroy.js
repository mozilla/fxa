/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const crypto = require('crypto');
const Joi = require('@hapi/joi');
const hex = require('buf').to.hex;

const AppError = require('../error');
const db = require('../db');
const encrypt = require('../encrypt');
const validators = require('../validators');
const logger = require('../logging')('routes.destroy');
const { getTokenId } = require('../token');
const { authenticateClient, clientAuthValidators } = require('../client');

/*jshint camelcase: false*/

module.exports = {
  validate: {
    headers: clientAuthValidators.headers,
    payload: Joi.object()
      .keys({
        client_id: clientAuthValidators.clientId.optional(),
        // For historical reasons, we accept and ignore a client_secret if one
        // is provided without a corresponding client_id.
        // https://github.com/mozilla/fxa-oauth-server/pull/198
        client_secret: clientAuthValidators.clientSecret.allow('').optional(),
        access_token: validators.accessToken,
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

    // If client credentials were provided, validate them.
    // For legacy reasons it is possible to call this endpoint without credentials.
    let client = null;
    if (req.headers.authorization || req.payload.client_id) {
      client = await authenticateClient(req.headers, req.payload);
    }

    if (req.payload.access_token) {
      getToken = 'getAccessToken';
      removeToken = 'removeAccessToken';
      token = await getTokenId(req.payload.access_token);
    } else {
      getToken = 'getRefreshToken';
      removeToken = 'removeRefreshToken';
      if (req.payload.refresh_token_id) {
        token = req.payload.refresh_token_id;
      } else {
        token = encrypt.hash(req.payload.refresh_token);
      }
    }

    const tokObj = await db[getToken](token);
    if (!tokObj) {
      throw AppError.invalidToken();
    }
    if (client && !crypto.timingSafeEqual(tokObj.clientId, client.id)) {
      throw AppError.invalidToken();
      // eslint-disable-next-line no-prototype-builtins
    } else if (!client && req.payload.hasOwnProperty('client_secret')) {
      // Log a warning if legacy client_secret is provided, so we can
      // measure whether it's safe to remove this behaviour.
      logger.warn('destroy.unexpectedClientSecret', {
        client_id: hex(tokObj.clientId),
      });
    }
    await db[removeToken](tokObj);
    return {};
  },
};
