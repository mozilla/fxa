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

module.exports = (log, config) => {
  const OAuthAPI = createBackendServiceAPI(log, config, 'oauth', {
    checkRefreshToken: require('./check-refresh-token')(config),
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
  });

  const api = new OAuthAPI(config.oauth.url, config.oauth.poolee);

  return {
    api,

    close() {
      api.close();
    },

    async checkRefreshToken(token) {
      try {
        return await api.checkRefreshToken({
          token: token,
        });
      } catch (err) {
        throw mapOAuthError(log, err);
      }
    },

    async revokeRefreshTokenById(refreshTokenId) {
      try {
        return await api.revokeRefreshTokenById({
          refresh_token_id: refreshTokenId,
        });
      } catch (err) {
        throw mapOAuthError(log, err);
      }
    },

    async getClientInfo(clientId) {
      try {
        return await api.getClientInfo(clientId);
      } catch (err) {
        throw mapOAuthError(log, err);
      }
    },

    async getScopedKeyData(sessionToken, oauthParams) {
      oauthParams.assertion = await makeAssertionJWT(config, sessionToken);
      try {
        return await api.getScopedKeyData(oauthParams);
      } catch (err) {
        throw mapOAuthError(log, err);
      }
    },

    async createAuthorizationCode(sessionToken, oauthParams) {
      oauthParams.assertion = await makeAssertionJWT(config, sessionToken);
      try {
        return await api.createAuthorizationCode(oauthParams);
      } catch (err) {
        throw mapOAuthError(log, err);
      }
    },

    async grantTokensFromAuthorizationCode(oauthParams) {
      try {
        return await api.grantTokensFromAuthorizationCode(oauthParams);
      } catch (err) {
        throw mapOAuthError(log, err);
      }
    },

    async grantTokensFromRefreshToken(oauthParams) {
      try {
        return await api.grantTokensFromRefreshToken(oauthParams);
      } catch (err) {
        throw mapOAuthError(log, err);
      }
    },

    async grantTokensFromSessionToken(sessionToken, oauthParams) {
      oauthParams.assertion = await makeAssertionJWT(config, sessionToken);
      try {
        return await api.grantTokensFromCredentials(oauthParams);
      } catch (err) {
        throw mapOAuthError(log, err);
      }
    },

    async checkAccessToken(token) {
      try {
        return await api.checkAccessToken(token);
      } catch (err) {
        throw mapOAuthError(log, err);
      }
    },

    async listAuthorizedClients(sessionToken) {
      const oauthParams = {
        assertion: await makeAssertionJWT(config, sessionToken),
      };
      try {
        return await api.listAuthorizedClients(oauthParams);
      } catch (err) {
        throw mapOAuthError(log, err);
      }
    },

    async revokeAuthorizedClient(sessionToken, oauthParams) {
      oauthParams.assertion = await makeAssertionJWT(config, sessionToken);
      try {
        return await api.revokeAuthorizedClient(oauthParams);
      } catch (err) {
        throw mapOAuthError(log, err);
      }
    },
  };
};
