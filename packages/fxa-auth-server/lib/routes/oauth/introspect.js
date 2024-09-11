/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint camelcase: false*/
import Joi from 'joi';

import validators from '../../oauth/validators';
import hexModule from "buf";
const hex = hexModule.to.hex;
import AppError from '../../oauth/error';
import { getTokenId } from '../../oauth/token';
import { default as OAUTH_SERVER_DOCS } from '../../../docs/swagger/oauth-server-api';
import { default as DESCRIPTION } from '../../../docs/swagger/shared/descriptions';
const PAYLOAD_SCHEMA = Joi.object({
  token: Joi.string().required().description(DESCRIPTION.tokenOauth),
  token_type_hint: Joi.string()
    .equal('access_token', 'refresh_token')
    .description(DESCRIPTION.tokenTypeHint),
});

// The "token introspection" endpoint, per https://tools.ietf.org/html/rfc7662

export default ({ oauthDB }) => ({
  method: 'POST',
  path: '/introspect',
  config: {
    ...OAUTH_SERVER_DOCS.INTROSPECT_POST,
    cors: { origin: 'ignore' },
    validate: {
      payload: PAYLOAD_SCHEMA.options({ stripUnknown: true }),
    },
    response: {
      schema: Joi.object().keys({
        // https://tools.ietf.org/html/rfc7662#section-2.2
        active: Joi.boolean().required().description(DESCRIPTION.active),
        scope: validators.scope.optional().description(DESCRIPTION.scope),
        client_id: validators.clientId
          .optional()
          .description(DESCRIPTION.clientId),
        token_type: Joi.string()
          .equal('access_token', 'refresh_token')
          .description(DESCRIPTION.tokenTypeOauth),
        exp: Joi.number().optional().description(DESCRIPTION.exp),
        iat: Joi.number().optional().description(DESCRIPTION.iat),
        sub: Joi.string().optional().description(DESCRIPTION.sub),
        iss: Joi.string().optional(),
        jti: Joi.string().optional().description(DESCRIPTION.jti),
        'fxa-lastUsedAt': Joi.number()
          .optional()
          .description(DESCRIPTION['fxa-lastUsedAt']),
      }),
    },
    handler: async function introspectEndpoint(req) {
      const tokenTypeHint = req.payload.token_type_hint;
      let token;
      let tokenType;
      let tokenId;

      try {
        // getTokenId will fail if an invalid JWT is passed in.
        tokenId = await getTokenId(req.payload.token);
      } catch (err) {
        return {
          active: false,
        };
      }
      if (tokenTypeHint === 'access_token' || !tokenTypeHint) {
        token = await oauthDB.getAccessToken(tokenId);
        if (token) {
          tokenType = 'access_token';
        }
      }
      if (tokenTypeHint === 'refresh_token' || (!tokenTypeHint && !token)) {
        token = await oauthDB.getRefreshToken(tokenId);
        if (token) {
          tokenType = 'refresh_token';
          const client = await oauthDB.getClient(token.clientId);
          // at this time we only support this endpoint for public clients
          // in the future other clients should be able to use it
          // by providing client_secret in the Authentication header
          if (!client || !client.publicClient) {
            throw new AppError.notPublicClient();
          }
        }
      }
      const response = {
        active: !!token,
      };

      if (token) {
        if (token.expiresAt) {
          response.active = +token.expiresAt > Date.now();
        }

        Object.assign(response, {
          scope: token.scope.toString(),
          client_id: hex(token.clientId),
          token_type: tokenType,
          iat: token.createdAt.getTime(),
          sub: hex(token.userId),
          jti: hex(tokenId),
        });

        if (token.expiresAt) {
          response.exp = token.expiresAt.getTime();
        }

        if (token.lastUsedAt) {
          response['fxa-lastUsedAt'] = token.lastUsedAt.getTime();
        }
      }

      return response;
    },
  },
});
