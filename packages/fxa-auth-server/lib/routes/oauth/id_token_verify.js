/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import MISC_DOCS from '../../../docs/swagger/misc-api';

const Joi = require('@hapi/joi');
const JWTIdToken = require('../../oauth/jwt_id_token');

module.exports = () => ({
  method: 'POST',
  path: '/oauth/id-token-verify',
  config: {
    ...MISC_DOCS.OAUTH_ID_TOKEN_VERIFY_POST,
    cors: { origin: 'ignore' },
    validate: {
      payload: Joi.object({
        client_id: Joi.string().required(),
        id_token: Joi.string().required(),
        expiry_grace_period: Joi.number().default(0),
      }).label('Oauth.idTokenVerify_payload'),
    },
    response: {
      schema: Joi.object()
        .unknown()
        .keys({
          acr: Joi.string().optional(),
          aud: Joi.string().optional(),
          alg: Joi.string().optional(),
          at_hash: Joi.string().optional(),
          amr: Joi.array().items(Joi.string()).optional(),
          exp: Joi.number().optional(),
          'fxa-aal': Joi.number().optional(),
          iat: Joi.number().optional(),
          iss: Joi.string().optional(),
          sub: Joi.string().optional(),
        })
        .label('Oauth.idTokenVerify_response'),
    },
  },
  handler: async function (request) {
    const claims = await JWTIdToken.verify(
      request.payload.id_token,
      request.payload.client_id,
      request.payload.expiry_grace_period
    );
    return claims;
  },
});
