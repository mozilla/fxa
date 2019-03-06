/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

/* Operations on OAuth database state.
 *
 * Currently this is not actually talking to a database,
 * it's making JWT-authenticated calls to the fxa-oauth-server API
 * to interrogate and manipulate its state, essentially treating
 * fxa-oauth-server as a kind of backend micro-service.
 *
 * We want to work towards merging the fxa-oauth-server code
 * directly into the main fxa-auth-server process, at which point
 * this abstraction will convert into more direct db access.
 *
 * Ref: https://docs.google.com/document/d/1CnTv0Eamy7Lnbmf1ALH00oTKMPhGu70elRivJYjx5v0/
 */

const createBackendServiceAPI = require('../backendService')
const { mapOAuthError, makeAssertionJWT } = require('./utils')

module.exports = (log, config) => {

  const OAuthAPI = createBackendServiceAPI(log, config, 'oauth', {
    getClientInfo: require('./client-info')(config),
    getScopedKeyData: require('./scoped-key-data')(config)
  })

  const api = new OAuthAPI(config.oauth.url, config.oauth.poolee)

  return {

    api,

    close() {
      api.close()
    },

    async getClientInfo(clientId) {
      try {
        return await api.getClientInfo(clientId)
      } catch (err) {
        throw mapOAuthError(log, err)
      }
    },

    async getScopedKeyData(sessionToken, oauthParams) {
      oauthParams.assertion = await makeAssertionJWT(config, sessionToken)
      try {
        return await api.getScopedKeyData(oauthParams)
      } catch (err) {
        throw mapOAuthError(log, err)
      }
    },

    /* As we work through the process of merging oauth-server
     * into auth-server, future methods we might want to include
     * here will be things like the following:

    async getClientInstances(account) {
    },

    async createAuthorizationCode(account, params) {
    }

    async redeemAuthorizationCode(account, params) {
    }

    async checkAccessToken(token) {
    }

    async revokeAccessToken(token) {
    }

    async checkRefreshToken(token) {
    }

    async revokeRefreshToken(token) {
    }

     * But in the interests of landing small manageable changes,
     * let's only add those as we need them.
     *
     */

  }
}
