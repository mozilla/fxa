/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import MISC_DOCS from '../../../docs/swagger/misc-api';
import OAUTH_DOCS from '../../../docs/swagger/oauth-api';
import DESCRIPTION from '../../../docs/swagger/shared/descriptions';

const crypto = require('crypto');
const Joi = require('@hapi/joi');
const hex = require('buf').to.hex;

const OauthError = require('../../oauth/error');
const AuthError = require('../../error');
const encrypt = require('fxa-shared/auth/encrypt');
const validators = require('../../oauth/validators');
const { getTokenId } = require('../../oauth/token');
const {
  authenticateClient,
  clientAuthValidators,
} = require('../../oauth/client');

/*jshint camelcase: false*/
module.exports = ({ log, oauthDB }) => {
  async function destroyHandler(req) {
    let tokenId;
    let getToken;
    let removeToken;

    // If client credentials were provided, validate them.
    // For legacy reasons it is possible to call this endpoint without credentials.
    let client = null;
    if (req.headers.authorization || req.payload.client_id) {
      client = await authenticateClient(req.headers, req.payload);
    }

    if (req.payload.access_token) {
      getToken = 'getAccessToken';
      removeToken = 'removeAccessToken';
      tokenId = await getTokenId(req.payload.access_token);
    } else {
      getToken = 'getRefreshToken';
      removeToken = 'removeRefreshToken';
      if (req.payload.refresh_token_id) {
        tokenId = req.payload.refresh_token_id;
      } else {
        tokenId = encrypt.hash(req.payload.refresh_token);
      }
    }

    const token = await oauthDB[getToken](tokenId);
    if (!token) {
      throw OauthError.invalidToken();
    }
    if (client && !crypto.timingSafeEqual(token.clientId, client.id)) {
      throw OauthError.invalidToken();
      // eslint-disable-next-line no-prototype-builtins
    } else if (!client && req.payload.hasOwnProperty('client_secret')) {
      // Log a warning if legacy client_secret is provided, so we can
      // measure whether it's safe to remove this behaviour.
      log.warn('destroy.unexpectedClientSecret', {
        client_id: hex(token.clientId),
      });
    }
    await oauthDB[removeToken](token);
    return {};
  }

  return [
    {
      method: 'POST',
      path: '/destroy',
      config: {
        ...MISC_DOCS.DESTROY_POST,
        cors: { origin: 'ignore' },
        validate: {
          headers: clientAuthValidators.headers,
          payload: Joi.object()
            .keys({
              client_id: clientAuthValidators.clientId.optional(),
              // For historical reasons, we accept and ignore a client_secret if one
              // is provided without a corresponding client_id.
              // https://github.com/mozilla/fxa-oauth-server/pull/198
              client_secret: clientAuthValidators.clientSecret
                .allow('')
                .optional(),
              access_token: validators.accessToken,
              refresh_token: validators.token,
              refresh_token_id: validators.token,
            })
            .rename('token', 'access_token')
            .xor('access_token', 'refresh_token', 'refresh_token_id')
            .label('Destroy_payload'),
        },
        handler: destroyHandler,
      },
    },
    {
      method: 'POST',
      path: '/oauth/destroy',
      config: {
        ...OAUTH_DOCS.OAUTH_DESTROY_POST,
        validate: {
          headers: clientAuthValidators.headers,
          payload: Joi.object({
            client_id: clientAuthValidators.clientId.description(
              DESCRIPTION.clientId
            ),
            client_secret: clientAuthValidators.clientSecret
              .optional()
              .description(DESCRIPTION.clientSecret),
            token: Joi.alternatives()
              .try(validators.accessToken, validators.refreshToken)
              .description(DESCRIPTION.token),
            // The spec says we have to ignore invalid token_type_hint values,
            // but no way I'm going to accept an arbitrarily-long string here...
            token_type_hint: Joi.string()
              .max(64)
              .optional()
              .description(DESCRIPTION.tokenTypeHint),
          }).label('oauth.destroy_payload'),
        },
        response: {},
      },
      handler: async function (req) {
        // This endpoint implements the API for token revocation from RFC7009,
        // which says that if we can't find the token using the provided token_type_hint
        // then we MUST search other possible types of token as well. So really
        // token_type_hint just tells us what *order* to try different token types in.
        let tokenTypes = ['access_token', 'refresh_token'];
        if (req.payload.token_type_hint === 'refresh_token') {
          tokenTypes = ['refresh_token', 'access_token'];
        }
        const methodArgValidators = {
          access_token: validators.accessToken,
          refresh_token: validators.refreshToken,
        };

        const token = req.payload.token;
        delete req.payload.token;
        for (const tokenType of tokenTypes) {
          // Only try this method, if the token is syntactically valid for that token type.
          if (!methodArgValidators[tokenType].validate(token).error) {
            try {
              req.payload[tokenType] = token;
              return await destroyHandler(req);
            } catch (err) {
              // If that was an invalid token, try the next token type.
              // All other errors are fatal.
              // TODO: on the error refactor pass, change this
              if (err.errno === 101) {
                throw AuthError.unknownClientId();
              } else if (err.errno !== 108) {
                throw err;
              }
              delete req.payload[tokenType];
            }
          }
        }

        // If we coudn't find the token, the RFC says to silently succeed anyway.
        return {};
      },
    },
  ];
};
