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

const { mapOAuthError, makeAssertionJWT } = require('./utils');
const ScopeSet = require('fxa-shared').oauth.scopes;

module.exports = (log, config) => {
  const oauthRoutes = require('../routes/oauth')(log);

  const routes = new Map(
    oauthRoutes.map((route) => [route.path, route.config.handler])
  );

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
    async revokeAccessToken(accessToken, clientCredentials = {}) {
      return callRoute('/destroy', {
        payload: {
          access_token: accessToken,
          ...clientCredentials,
        },
      });
    },

    async revokeRefreshToken(refreshToken, clientCredentials = {}) {
      return callRoute('/destroy', {
        payload: {
          refresh_token: refreshToken,
          ...clientCredentials,
        },
      });
    },

    async revokeRefreshTokenById(refreshTokenId, clientCredentials = {}) {
      return callRoute('/destroy', {
        payload: {
          refresh_token_id: refreshTokenId,
          ...clientCredentials,
        },
      });
    },

    async getScopedKeyData(sessionToken, oauthParams) {
      oauthParams.assertion = await makeAssertionJWT(config, sessionToken);
      oauthParams.scope = ScopeSet.fromString(oauthParams.scope || '');
      return callRoute('/key-data', {
        payload: oauthParams,
      });
    },

    async createAuthorizationCode(sessionToken, oauthParams) {
      oauthParams.assertion = await makeAssertionJWT(config, sessionToken);
      if (oauthParams.scope) {
        oauthParams.scope = ScopeSet.fromString(oauthParams.scope || '');
      }
      return callRoute('/authorization', {
        payload: oauthParams,
      });
    },

    async grantTokensFromAuthorizationCode(oauthParams) {
      return callRoute('/token', {
        payload: oauthParams,
      });
    },

    async grantTokensFromRefreshToken(oauthParams) {
      if (oauthParams.scope) {
        oauthParams.scope = ScopeSet.fromString(oauthParams.scope || '');
      }
      return callRoute('/token', {
        payload: oauthParams,
      });
    },

    async grantTokensFromSessionToken(sessionToken, oauthParams) {
      oauthParams.assertion = await makeAssertionJWT(config, sessionToken);
      if (oauthParams.scope) {
        oauthParams.scope = ScopeSet.fromString(oauthParams.scope || '');
      }
      return callRoute('/token', {
        payload: oauthParams,
      });
    },

    async listAuthorizedClients(sessionToken) {
      const oauthParams = {
        assertion: await makeAssertionJWT(config, sessionToken),
      };
      return callRoute('/authorized-clients', {
        payload: oauthParams,
      });
    },

    async revokeAuthorizedClient(sessionToken, oauthParams) {
      oauthParams.assertion = await makeAssertionJWT(config, sessionToken);
      return callRoute('/authorized-clients/destroy', {
        payload: oauthParams,
      });
    },
  };
};
