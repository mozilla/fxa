/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

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

const createBackendServiceAPI = require('../backendService');
const { mapOAuthError, makeAssertionJWT } = require('./utils');
const ScopeSet = require('../../../fxa-shared').oauth.scopes;
const oauthRoutes = require('../oauth/routes').routes;

const routes = new Map(
  oauthRoutes.map(route => [route.path, route.config.handler])
);

module.exports = (log, config, statsd) => {
  const OAuthAPI = createBackendServiceAPI(
    log,
    config,
    'oauth',
    {
      checkRefreshToken: require('./check-refresh-token')(config),
      revokeAccessToken: require('./revoke-access-token')(config),
      revokeRefreshToken: require('./revoke-refresh-token')(config),
      revokeRefreshTokenById: require('./revoke-refresh-token-by-id')(config),
      getClientInfo: require('./client-info')(config),
      getScopedKeyData: require('./scoped-key-data')(config),
      createAuthorizationCode: require('./create-authorization-code')(config),
      grantTokensFromAuthorizationCode: require('./grant-tokens-from-authorization-code')(
        config
      ),
      grantTokensFromRefreshToken: require('./grant-tokens-from-refresh-token')(
        config
      ),
      grantTokensFromCredentials: require('./grant-tokens-from-credentials')(
        config
      ),
      checkAccessToken: require('./check-access-token')(config),
      listAuthorizedClients: require('./list-authorized-clients')(config),
      revokeAuthorizedClient: require('./revoke-authorized-client')(config),
    },
    statsd
  );

  const api = new OAuthAPI(config.oauth.url, config.oauth.poolee);

  async function callRoute(path, request) {
    try {
      request.headers = request.headers || {};
      const handler = routes.get(path);
      const response = await handler(request);
      return response;
    } catch (err) {
      throw mapOAuthError(log, err);
    }
  }

  return {
    api,

    close() {
      api.close();
    },

    async checkRefreshToken(token) {
      return callRoute('/v1/introspect', {
        payload: {
          token,
        },
      });
    },

    async revokeAccessToken(accessToken, clientCredentials = {}) {
      return callRoute('/v1/destroy', {
        payload: {
          access_token: accessToken,
          ...clientCredentials,
        },
      });
    },

    async revokeRefreshToken(refreshToken, clientCredentials = {}) {
      return callRoute('/v1/destroy', {
        payload: {
          refresh_token: refreshToken,
          ...clientCredentials,
        },
      });
    },

    async revokeRefreshTokenById(refreshTokenId, clientCredentials = {}) {
      return callRoute('/v1/destroy', {
        payload: {
          refresh_token_id: refreshTokenId,
          ...clientCredentials,
        },
      });
    },

    async getClientInfo(clientId) {
      return callRoute('/v1/client/{client_id}', {
        params: {
          client_id: clientId,
        },
      });
    },

    async getScopedKeyData(sessionToken, oauthParams) {
      oauthParams.assertion = await makeAssertionJWT(config, sessionToken);
      oauthParams.scope = ScopeSet.fromString(oauthParams.scope || '');
      return callRoute('/v1/key-data', {
        payload: oauthParams,
      });
    },

    async createAuthorizationCode(sessionToken, oauthParams) {
      oauthParams.assertion = await makeAssertionJWT(config, sessionToken);
      if (oauthParams.scope) {
        oauthParams.scope = ScopeSet.fromString(oauthParams.scope || '');
      }
      return callRoute('/v1/authorization', {
        payload: oauthParams,
      });
    },

    async grantTokensFromAuthorizationCode(oauthParams) {
      return callRoute('/v1/token', {
        payload: oauthParams,
      });
    },

    async grantTokensFromRefreshToken(oauthParams) {
      if (oauthParams.scope) {
        oauthParams.scope = ScopeSet.fromString(oauthParams.scope || '');
      }
      return callRoute('/v1/token', {
        payload: oauthParams,
      });
    },

    async grantTokensFromSessionToken(sessionToken, oauthParams) {
      oauthParams.assertion = await makeAssertionJWT(config, sessionToken);
      if (oauthParams.scope) {
        oauthParams.scope = ScopeSet.fromString(oauthParams.scope || '');
      }
      return callRoute('/v1/token', {
        payload: oauthParams,
      });
    },

    async checkAccessToken(token) {
      return callRoute('/v1/verify', {
        payload: { token },
      });
    },

    async listAuthorizedClients(sessionToken) {
      const oauthParams = {
        assertion: await makeAssertionJWT(config, sessionToken),
      };
      return callRoute('/v1/authorized-clients', {
        payload: oauthParams,
      });
    },

    async revokeAuthorizedClient(sessionToken, oauthParams) {
      oauthParams.assertion = await makeAssertionJWT(config, sessionToken);
      return callRoute('/v1/authorized-clients/destroy', {
        payload: oauthParams,
      });
    },
  };
};
