/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*jshint camelcase: false*/
const Joi = require('joi');
const validators = require('../../oauth/validators');
const { OauthError } = require('@fxa/accounts/errors');
const { getTokenId } = require('../../oauth/token');
const OAUTH_SERVER_DOCS =
  require('../../../docs/swagger/oauth-server-api').default;
const DESCRIPTION =
  require('../../../docs/swagger/shared/descriptions').default;
const PAYLOAD_SCHEMA = Joi.object({
  token: Joi.string().required().description(DESCRIPTION.tokenOauth),
  token_type_hint: Joi.string()
    .equal('access_token', 'refresh_token')
    .description(DESCRIPTION.tokenTypeHint),
});

// The "token introspection" endpoint, per https://tools.ietf.org/html/rfc7662

module.exports = ({ oauthDB, customs }) => ({
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
        // RFC 9470 §6.2 — authentication level, event time, and methods of the
        // access token. Access tokens only; refresh tokens never carry these.
        // NOTE on units: `auth_time` is SECONDS since the epoch (OIDC/RFC 9470),
        // whereas this endpoint's `iat`/`exp` are historically emitted in
        // MILLISECONDS (`.getTime()`). They therefore differ in magnitude by
        // ~1000x; this is intentional to preserve backwards compatibility for
        // RPs that already parse iat/exp as milliseconds.
        acr: Joi.string().optional().description(DESCRIPTION.acr),
        auth_time: Joi.number().optional().description(DESCRIPTION.authTime),
        amr: Joi.array().items(Joi.string()).optional().description(DESCRIPTION.amr),
      }),
    },
    handler: async function introspectEndpoint(req) {
      await customs.checkIpOnly(req, 'oauthIntrospect');

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
            throw OauthError.notPublicClient(token.clientId);
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
          client_id: token.clientId.toString('hex'),
          token_type: tokenType,
          iat: token.createdAt.getTime(),
          sub: token.userId.toString('hex'),
          jti: tokenId.toString('hex'),
        });

        if (token.expiresAt) {
          response.exp = token.expiresAt.getTime();
        }

        if (token.lastUsedAt) {
          response['fxa-lastUsedAt'] = token.lastUsedAt.getTime();
        }

        // RFC 9470 §6.2: report the session's authentication level and event on
        // access tokens. These are persisted only on access tokens, so a refresh
        // token never surfaces them — that is what keeps elevation from surviving
        // a token refresh. `auth_time` is seconds since epoch (as sourced from the
        // grant's authAt), matching the token response's `auth_at`. This is
        // intentionally a different unit from `iat`/`exp` above, which this
        // endpoint has long emitted in milliseconds (`.getTime()`); changing
        // those would break RPs that parse them as ms, so they are left as-is.
        if (tokenType === 'access_token') {
          if (token.aal) {
            response.acr = 'AAL' + token.aal;
          }
          if (token.authAt) {
            response.auth_time = token.authAt;
          }
          if (token.amr) {
            response.amr = token.amr;
          }
        }
      }

      return response;
    },
  },
});
