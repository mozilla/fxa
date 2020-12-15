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

const Joi = require('@hapi/joi');
const validators = require('../../routes/validators');

const error = require('../../error');

/**
 * @deprecated to be replaced with direct implementations
 */
module.exports = (config, oauthService) => {
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
      method: 'POST',
      path: '/account/scoped-key-data',
      config: {
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          payload: {
            client_id: validators.clientId.required(),
            scope: validators.scope.required(),
            assertion: Joi.forbidden(),
          },
        },
        response: {
          schema: Joi.object().pattern(
            Joi.any(),
            Joi.object({
              identifier: validators.scope.required(),
              keyRotationSecret: validators.hexString.length(64).required(),
              keyRotationTimestamp: Joi.number().required(),
            })
          ),
        },
      },
      handler: async function (request) {
        checkDisabledClientId(request.payload);
        const sessionToken = request.auth.credentials;
        return oauthService.getScopedKeyData(sessionToken, request.payload);
      },
    },
  ];
  return routes;
};
