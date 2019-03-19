/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint camelcase: false*/
const Joi = require('joi');
const db = require('../db');
const encrypt = require('../encrypt');
const validators = require('../validators');
const hex = require('buf').to.hex;
const AppError = require('../error');

const PAYLOAD_SCHEMA = Joi.object({
  token: Joi.string().required(),
  token_type_hint: Joi.string().equal(['access_token', 'refresh_token'])
});

// The "token introspection" endpoint, per https://tools.ietf.org/html/rfc7662

module.exports = {
  validate: {
    payload: PAYLOAD_SCHEMA.options({ stripUnknown: true })
  },
  response: {
    schema: Joi.object().keys({
      // https://tools.ietf.org/html/rfc7662#section-2.2
      active: Joi.boolean().required(),
      scope: validators.scope.optional(),
      client_id: validators.clientId.optional(),
      token_type: Joi.string().equal(['access_token', 'refresh_token']),
      exp: Joi.number().optional(),
      iat: Joi.number().optional(),
      sub: Joi.string().optional(),
      iss: Joi.string().optional(),
      jti: Joi.string().required(),
      'fxa-lastUsedAt': Joi.number().optional()
    })
  },
  handler: async function introspectEndpoint(req) {
    let token;
    let tokenType = req.payload.token_type;
    const tokenId = encrypt.hash(req.payload.token);
    if (tokenType === 'access_token' || ! tokenType) {
      token = await db.getAccessToken(tokenId);
      if (token) {
        tokenType = 'access_token';
      }
    }
    if (tokenType === 'refresh_token' || (! tokenType && ! token)) {
      token = await db.getRefreshToken(tokenId);
      if (token) {
        tokenType = 'refresh_token';
        const client = await db.getClient(token.clientId);
        // at this time we only support this endpoint for public clients
        // in the future other clients should be able to use it
        // by providing client_secret in the Authentication header
        if (! client || ! client.publicClient) {
          throw new AppError.notPublicClient();
        }
      }
    }

    const response = {
      active: !! token
    };

    if (token) {
      if (token.expiresAt) {
        response.active = (+token.expiresAt < Date.now());
      }
      Object.assign(response, {
        scope: token.scope.toString(),
        client_id: hex(token.clientId),
        token_type: tokenType,
        exp: token.expiresAt && token.expiresAt.getTime(),
        iat: token.createdAt.getTime(),
        sub: hex(token.userId),
        jti: hex(tokenId),
        'fxa-lastUsedAt': token.lastUsedAt && token.lastUsedAt.getTime(),
      });
    }

    return response;
  }
};
