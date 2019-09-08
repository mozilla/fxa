/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const Joi = require('joi');
const validators = require('../routes/validators');

module.exports = config => {
  return {
    path: '/v1/token',
    method: 'POST',
    validate: {
      payload: Joi.object({
        grant_type: Joi.string()
          .valid('authorization_code')
          .default('authorization_code'),
        client_id: validators.clientId.required(),
        client_secret: validators.clientSecret.optional(),
        code: validators.authorizationCode.required(),
        code_verifier: validators.pkceCodeVerifier.optional(),
        redirect_uri: validators.url().optional(),
        // Note: the max allowed TTL is currently configured in oauth-server config,
        // making it hard to know what limit to set here.
        ttl: Joi.number()
          .positive()
          .optional(),
        ppid_seed: validators.ppidSeed.optional(),
        resource: validators.resourceUrl.optional(),
      }).xor('client_secret', 'code_verifier'),
      response: Joi.object({
        access_token: validators.accessToken.required(),
        refresh_token: validators.refreshToken.optional(),
        id_token: validators.assertion.optional(),
        session_token_id: validators.sessionTokenId.optional(),
        scope: validators.scope.required(),
        token_type: Joi.string()
          .valid('bearer')
          .required(),
        expires_in: Joi.number().required(),
        auth_at: Joi.number().required(),
        keys_jwe: validators.jwe.optional(),
      }),
    },
  };
};
