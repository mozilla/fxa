/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

/* Routes for managing OAuth authorization grants.
 *
 * These routes are a more-or-less direct proxy through to
 * routes on the underlying "fxa-oauth-server", treating it
 * as a kind of back-end microservice.  We want to eventually
 * merge that codebase directly into the main auth-server
 * here, at which point these routes will become the direct
 * implementation of their respesctive features.
 *
 */

const Joi = require('joi');
const validators = require('../routes/validators');
const {
  clientAuthValidators,
  getClientCredentials,
} = require('../../fxa-oauth-server/lib/client');

const error = require('../error');
const oauthRouteUtils = require('./utils/oauth');
const { OAUTH_SCOPE_SESSION_TOKEN } = require('../constants');
const ScopeSet = require('../../../fxa-shared').oauth.scopes;

module.exports = (log, config, oauthdb, db, mailer, devices) => {
  const OAUTH_DISABLE_NEW_CONNECTIONS_FOR_CLIENTS = new Set(
    config.oauth.disableNewConnectionsForClients || []
  );

  function checkDisabledClientId(payload) {
    const clientId = payload.client_id;
    if (OAUTH_DISABLE_NEW_CONNECTIONS_FOR_CLIENTS.has(clientId)) {
      throw error.disabledClientId(clientId);
    }
  }

  const routes = [
    {
      method: 'GET',
      path: '/oauth/client/{client_id}',
      options: {
        validate: {
          params: oauthdb.api.getClientInfo.opts.validate.params,
        },
        response: {
          schema: oauthdb.api.getClientInfo.opts.validate.response,
        },
      },
      handler: async function(request) {
        return oauthdb.getClientInfo(request.params.client_id);
      },
    },
    {
      method: 'POST',
      path: '/account/scoped-key-data',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          payload: Joi.object(
            oauthdb.api.getScopedKeyData.opts.validate.payload
          ).keys({
            assertion: Joi.forbidden(),
          }),
        },
        response: {
          schema: oauthdb.api.getScopedKeyData.opts.validate.response,
        },
      },
      handler: async function(request) {
        checkDisabledClientId(request.payload);
        const sessionToken = request.auth.credentials;
        return oauthdb.getScopedKeyData(sessionToken, request.payload);
      },
    },
    {
      method: 'POST',
      path: '/oauth/authorization',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          payload: oauthdb.api.createAuthorizationCode.opts.validate.payload.keys(
            {
              assertion: Joi.forbidden(),
              resource: Joi.forbidden(),
            }
          ),
        },
        response: {
          schema: oauthdb.api.createAuthorizationCode.opts.validate.response,
        },
      },
      handler: async function(request) {
        checkDisabledClientId(request.payload);
        const sessionToken = request.auth.credentials;
        return oauthdb.createAuthorizationCode(sessionToken, request.payload);
      },
    },
    {
      method: 'POST',
      path: '/oauth/token',
      options: {
        auth: {
          // XXX TODO: To be able to fully replace the /token route from oauth-server,
          // this route must also be able to accept 'client_secret' as Basic Auth in header.
          mode: 'optional',
          strategy: 'sessionToken',
        },
        validate: {
          // Note: the use of 'alternatives' here means that `grant_type` will default to
          // `authorization_code` if a `code` parameter is provided, or `fxa-credentials`
          // otherwise. This is intended behaviour.
          payload: Joi.alternatives().try(
            oauthdb.api.grantTokensFromAuthorizationCode.opts.validate.payload,
            oauthdb.api.grantTokensFromRefreshToken.opts.validate.payload,
            oauthdb.api.grantTokensFromCredentials.opts.validate.payload.keys({
              assertion: Joi.forbidden(),
            })
          ),
        },
        response: {
          schema: Joi.alternatives().try(
            oauthdb.api.grantTokensFromAuthorizationCode.opts.validate.response.keys(
              {
                session_token: validators.sessionToken.optional(),
                session_token_id: Joi.forbidden(),
              }
            ),
            oauthdb.api.grantTokensFromRefreshToken.opts.validate.response,
            oauthdb.api.grantTokensFromCredentials.opts.validate.response
          ),
        },
      },
      handler: async function(request) {
        const sessionToken = request.auth.credentials;
        let grant;
        switch (request.payload.grant_type) {
          case 'authorization_code':
            grant = await oauthdb.grantTokensFromAuthorizationCode(
              request.payload
            );
            break;
          case 'refresh_token':
            grant = await oauthdb.grantTokensFromRefreshToken(request.payload);
            break;
          case 'fxa-credentials':
            if (!sessionToken) {
              throw error.invalidToken();
            }
            grant = await oauthdb.grantTokensFromSessionToken(
              sessionToken,
              request.payload
            );
            break;
          default:
            throw error.internalValidationError();
        }

        const scopeSet = ScopeSet.fromString(grant.scope);

        if (scopeSet.contains(OAUTH_SCOPE_SESSION_TOKEN)) {
          // the OAUTH_SCOPE_SESSION_TOKEN allows the client to create a new session token.
          // the sessionTokens live in the auth-server db, we create them here after the oauth-server has validated the request.
          let origSessionToken;
          try {
            origSessionToken = await db.sessionToken(grant.session_token_id);
          } catch (e) {
            throw error.unknownAuthorizationCode();
          }

          const newTokenData = await origSessionToken.copyTokenState();

          // Update UA info based on the requesting device.
          const { ua } = request.app;
          const newUAInfo = {
            uaBrowser: ua.browser,
            uaBrowserVersion: ua.browserVersion,
            uaOS: ua.os,
            uaOSVersion: ua.osVersion,
            uaDeviceType: ua.deviceType,
            uaFormFactor: ua.formFactor,
          };

          const sessionTokenOptions = {
            ...newTokenData,
            ...newUAInfo,
          };

          const newSessionToken = await db.createSessionToken(
            sessionTokenOptions
          );
          // the new session token information is later
          // used in 'newTokenNotification' to attach it to device records
          grant.session_token_id = newSessionToken.id;
          grant.session_token = newSessionToken.data;
        }

        if (grant.refresh_token) {
          // if a refresh token has
          // been provisioned as part of the flow
          // then we want to send some notifications to the user
          await oauthRouteUtils.newTokenNotification(
            db,
            oauthdb,
            mailer,
            devices,
            request,
            grant
          );
        }

        // done with 'session_token_id' at this point, do not return it.
        delete grant.session_token_id;

        return grant;
      },
    },
    {
      method: 'POST',
      path: '/oauth/destroy',
      options: {
        validate: {
          headers: clientAuthValidators.headers,
          payload: {
            client_id: clientAuthValidators.clientId,
            client_secret: clientAuthValidators.clientSecret.optional(),
            token: Joi.alternatives().try(
              validators.accessToken,
              validators.refreshToken
            ),
            // The spec says we have to ignore invalid token_type_hint values,
            // but no way I'm going to accept an arbitrarily-long string here...
            token_type_hint: Joi.string()
              .max(64)
              .optional(),
          },
        },
        response: {},
      },
      handler: async function(request) {
        // This endpoint implements the API for token revocation from RFC7009,
        // which says that if we can't find the token using the provided token_type_hint
        // then we MUST search other possible types of token as well. So really
        // token_type_hint just tells us what *order* to try different token types in.
        let methodsToTry = ['revokeAccessToken', 'revokeRefreshToken'];
        if (request.payload.token_type_hint === 'refresh_token') {
          methodsToTry = ['revokeRefreshToken', 'revokeAccessToken'];
        }
        const methodArgValidators = {
          revokeAccessToken: validators.accessToken,
          revokeRefreshToken: validators.refreshToken,
        };

        const creds = getClientCredentials(request.headers, request.payload);

        const token = request.payload.token;
        for (const methodName of methodsToTry) {
          // Only try this method, if the token is syntactically valid for that token type.
          if (!methodArgValidators[methodName].validate(token).error) {
            try {
              return await oauthdb[methodName](request.payload.token, creds);
            } catch (err) {
              // If that was an invalid token, try the next token type.
              // All other errors are fatal.
              if (err.errno !== error.ERRNO.INVALID_TOKEN) {
                throw err;
              }
            }
          }
        }

        // If we coudn't find the token, the RFC says to silently succeed anyway.
        return {};
      },
    },
  ];
  return routes;
};
