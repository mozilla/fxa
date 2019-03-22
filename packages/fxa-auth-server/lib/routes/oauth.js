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

const error = require('../error');

module.exports = (log, config, oauthdb) => {
  const routes = [
    {
      method: 'GET',
      path: '/oauth/client/{client_id}',
      options: {
        validate: {
          params: oauthdb.api.getClientInfo.opts.validate.params
        },
        response: {
          schema: oauthdb.api.getClientInfo.opts.validate.response
        }
      },
      handler: async function (request) {
        return oauthdb.getClientInfo(request.params.client_id);
      }
    },
    {
      method: 'POST',
      path: '/account/scoped-key-data',
      options: {
        auth: {
          strategy: 'sessionToken'
        },
        validate: {
          payload: Joi.object(oauthdb.api.getScopedKeyData.opts.validate.payload).keys({
            assertion: Joi.forbidden()
          })
        },
        response: {
          schema: oauthdb.api.getScopedKeyData.opts.validate.response
        }
      },
      handler: async function (request) {
        const sessionToken = request.auth.credentials;
        return oauthdb.getScopedKeyData(sessionToken, request.payload);
      }
    },
    {
      method: 'POST',
      path: '/oauth/authorization',
      options: {
        auth: {
          strategy: 'sessionToken'
        },
        validate: {
          payload: oauthdb.api.createAuthorizationCode.opts.validate.payload.keys({
            assertion: Joi.forbidden()
          })
        },
        response: {
          schema: oauthdb.api.createAuthorizationCode.opts.validate.response
        }
      },
      handler: async function (request) {
        const sessionToken = request.auth.credentials;
        return oauthdb.createAuthorizationCode(sessionToken, request.payload);
      }
    },
    {
      method: 'POST',
      path: '/oauth/token',
      options: {
        auth: {
          // XXX TODO: To be able to fully replace the /token route from oauth-server,
          // this route must also be able to accept 'client_secret' as Basic Auth in header.
          mode: 'optional',
          strategy: 'sessionToken'
        },
        validate: {
          // Note: the use of 'alternatives' here means that `grant_type` will default to
          // `authorization_code` if a `code` parameter is provided, or `fxa-credentials`
          // otherwise. This is intended behaviour.
          payload: Joi.alternatives().try(
            oauthdb.api.grantTokensFromAuthorizationCode.opts.validate.payload,
            oauthdb.api.grantTokensFromRefreshToken.opts.validate.payload,
            oauthdb.api.grantTokensFromCredentials.opts.validate.payload.keys({
              assertion: Joi.forbidden()
            })
          )
        },
        response: {
          schema: Joi.alternatives().try(
            oauthdb.api.grantTokensFromAuthorizationCode.opts.validate.response,
            oauthdb.api.grantTokensFromRefreshToken.opts.validate.response,
            oauthdb.api.grantTokensFromCredentials.opts.validate.response
          )
        }
      },
      handler: async function (request) {
        const sessionToken = request.auth.credentials;
        switch (request.payload.grant_type) {
          case 'authorization_code':
            return await oauthdb.grantTokensFromAuthorizationCode(request.payload);
          case 'refresh_token':
            return await oauthdb.grantTokensFromRefreshToken(request.payload);
          case 'fxa-credentials':
            if (! sessionToken) {
              throw error.invalidToken();
            }
            return await oauthdb.grantTokensFromSessionToken(sessionToken, request.payload);
          default:
            throw error.internalValidationError();
        }
      }
    },
  ];
  return routes;
};
