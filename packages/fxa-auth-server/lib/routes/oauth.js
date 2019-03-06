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
          payload: Joi.object(oauthdb.api.getScopedKeyData.opts.validate.payload).keys({
            assertion: Joi.forbidden()
          })
        },
        response: {
          schema: oauthdb.api.getScopedKeyData.opts.validate.response
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
