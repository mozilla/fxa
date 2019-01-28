/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

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

const Joi = require('joi')

const validators = require('./validators')

module.exports = (log, config, oauthdb) => {
  const routes = [
    {
      method: 'GET',
      path: '/oauth/client/{client_id}',
      options: {
        validate: {
          params: {
            client_id: validators.clientId.required()
          }
        },
        response: {
          schema: {
            id: validators.clientId.required(),
            name: Joi.string().max(255).regex(validators.DISPLAY_SAFE_UNICODE).required(),
            trusted: Joi.boolean().required(),
            image_uri: Joi.string().optional().allow(''),
            redirect_uri: Joi.string().required().allow('')
          }
        }
      },
      handler: async function (request) {
        return oauthdb.getClientInfo(request.params.client_id)
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
          payload: {
            client_id: validators.clientId.required(),
            scope: validators.scope.required()
          }
        },
        response: {
          schema: Joi.object().pattern(Joi.any(), Joi.object({
            identifier: validators.scope.required(),
            keyRotationSecret: validators.hexString.length(64).required(),
            keyRotationTimestamp: Joi.number().required(),
          }))
        }
      },
      handler: async function (request) {
        const sessionToken = request.auth.credentials
        return oauthdb.getScopedKeyData(sessionToken, request.payload)
      }
    },
  ]
  return routes
}
