/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../../..';

const sinon = require('sinon');
const Joi = require('@hapi/joi');
const assert = { ...sinon.assert, ...require('chai').assert };
const getRoute = require('../../routes_helpers').getRoute;
const mocks = require('../../mocks');
const error = require('../../../lib/error');
const JWTIdToken = require(`${ROOT_DIR}/lib/oauth/jwt_id_token`);

const MOCK_CLIENT_ID = '0123456789abcdef';
const MOCK_USER_ID = '0123456789abcdef0123456789abcdef';
const MOCK_SCOPES = 'profile https://identity.mozilla.com/apps/scoped-example';
const MOCK_UNIX_TIMESTAMP = Math.round(Date.now() / 1000);
const MOCK_TOKEN =
  '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff';
const MOCK_JWT =
  '001122334455.66778899aabbccddeeff00112233445566778899.aabbccddeeff';
const MOCK_AUTHORIZATION_CODE =
  'aaaaaabbbbbbccccccddddddeeeeeeffaaaaaabbbbbbccccccddddddeeeeeeff';
const MOCK_TOKEN_RESPONSE = {
  access_token: MOCK_TOKEN,
  scope: MOCK_SCOPES,
  token_type: 'bearer',
  expires_in: 500,
  auth_at: 123456,
};

describe('/oauth/ routes', () => {
  let mockOAuthDB, mockLog, mockConfig, sessionToken;

  async function loadAndCallRoute(path, request) {
    const routes = require('../../../lib/routes/oauth')(
      mockLog,
      mockConfig,
      mockOAuthDB
    );
    const route = await getRoute(routes, path);
    if (route.options.validate.payload) {
      // eslint-disable-next-line require-atomic-updates
      request.payload = await Joi.validate(
        request.payload,
        route.options.validate.payload,
        {
          context: {
            headers: request.headers || {},
          },
        }
      );
    }
    const response = await route.handler(request);
    if (response instanceof Error) {
      throw response;
    }
    return response;
  }

  async function mockSessionToken(props = {}) {
    const Token = require(`${ROOT_DIR}/lib/tokens/token`)(mockLog);
    const SessionToken = require(`${ROOT_DIR}/lib/tokens/session_token`)(
      mockLog,
      Token,
      {
        tokenLifetimes: {
          sessionTokenWithoutDevice: 2419200000,
        },
      }
    );
    return await SessionToken.create({
      uid: MOCK_USER_ID,
      email: 'foo@example.com',
      emailVerified: true,
      ...props,
    });
  }

  beforeEach(() => {
    mockLog = mocks.mockLog();
    mockConfig = {
      oauth: {},
    };
  });

  describe('/oauth/client/{client_id}', () => {
    it('calls oauthdb.getClientInfo', async () => {
      mockOAuthDB = mocks.mockOAuthDB({
        getClientInfo: sinon.spy(async () => {
          return { id: MOCK_CLIENT_ID, name: 'mock client' };
        }),
      });
      const mockRequest = mocks.mockRequest({
        params: {
          client_id: MOCK_CLIENT_ID,
        },
      });
      const resp = await loadAndCallRoute(
        '/oauth/client/{client_id}',
        mockRequest
      );
      assert.calledOnce(mockOAuthDB.getClientInfo);
      assert.calledWithExactly(mockOAuthDB.getClientInfo, MOCK_CLIENT_ID);
      assert.equal(resp.id, MOCK_CLIENT_ID);
      assert.equal(resp.name, 'mock client');
    });
  });

  describe('/oauth/id-token-verify', () => {
    let MOCK_ID_TOKEN_CLAIMS, mockVerify;

    beforeEach(() => {
      MOCK_ID_TOKEN_CLAIMS = {
        iss: 'http://127.0.0.1:9000',
        alg: 'RS256',
        aud: MOCK_CLIENT_ID,
        sub: MOCK_USER_ID,
        exp: MOCK_UNIX_TIMESTAMP + 100,
        iat: MOCK_UNIX_TIMESTAMP,
        amr: ['pwd', 'otp'],
        at_hash: '47DEQpj8HBSa-_TImW-5JA',
        acr: 'AAL2',
        'fxa-aal': 2,
      };
      mockVerify = sinon.stub(JWTIdToken, 'verify');
    });

    const _testRequest = async (claims, gracePeriod) => {
      mockVerify.returns(claims);
      const payload = {
        client_id: MOCK_CLIENT_ID,
        id_token: MOCK_JWT,
      };
      if (gracePeriod) {
        payload.expiry_grace_period = gracePeriod;
      }
      const mockRequest = mocks.mockRequest({ payload });

      return await loadAndCallRoute('/oauth/id-token-verify', mockRequest);
    };

    afterEach(() => {
      mockVerify.restore();
    });

    it('calls JWTIdToken.verify', async () => {
      const resp = await _testRequest(MOCK_ID_TOKEN_CLAIMS);

      assert.calledOnce(mockVerify);
      assert.deepEqual(resp, MOCK_ID_TOKEN_CLAIMS);
      mockVerify.restore();
    });

    it('supports expiryGracePeriod option', async () => {
      const resp = await _testRequest(MOCK_ID_TOKEN_CLAIMS, 600);

      assert.calledOnce(mockVerify);
      assert.deepEqual(resp, MOCK_ID_TOKEN_CLAIMS);
      mockVerify.restore();
    });

    it('allows extra claims', async () => {
      MOCK_ID_TOKEN_CLAIMS.foo = 'bar';

      const resp = await _testRequest(MOCK_ID_TOKEN_CLAIMS);

      assert.calledOnce(mockVerify);
      assert.deepEqual(resp, MOCK_ID_TOKEN_CLAIMS);
      mockVerify.restore();
    });

    it('allows missing claims', async () => {
      delete MOCK_ID_TOKEN_CLAIMS.acr;

      const resp = await _testRequest(MOCK_ID_TOKEN_CLAIMS);

      assert.calledOnce(mockVerify);
      assert.deepEqual(resp, MOCK_ID_TOKEN_CLAIMS);
      mockVerify.restore();
    });
  });

  describe('/account/scoped-key-data', () => {
    it('calls oauthdb.getScopedKeyData', async () => {
      mockOAuthDB = mocks.mockOAuthDB({
        getScopedKeyData: sinon.spy(async () => {
          return { key: 'data' };
        }),
      });
      sessionToken = await mockSessionToken();
      const mockRequest = mocks.mockRequest({
        credentials: sessionToken,
        payload: {
          client_id: MOCK_CLIENT_ID,
          scope: MOCK_SCOPES,
        },
      });
      const resp = await loadAndCallRoute(
        '/account/scoped-key-data',
        mockRequest
      );
      assert.calledOnce(mockOAuthDB.getScopedKeyData);
      assert.calledWithExactly(mockOAuthDB.getScopedKeyData, sessionToken, {
        client_id: MOCK_CLIENT_ID,
        scope: MOCK_SCOPES,
      });
      assert.deepEqual(resp, { key: 'data' });
    });

    it('can refuse to return scoped-key data for selected OAuth clients', async () => {
      mockOAuthDB = mocks.mockOAuthDB();
      mockConfig.oauth.disableNewConnectionsForClients = [MOCK_CLIENT_ID];
      sessionToken = await mockSessionToken();
      const mockRequest = mocks.mockRequest({
        credentials: sessionToken,
        payload: {
          client_id: MOCK_CLIENT_ID,
          scope: MOCK_SCOPES,
        },
      });
      try {
        await loadAndCallRoute('/account/scoped-key-data', mockRequest);
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.output.statusCode, 503);
        assert.equal(err.output.headers['retry-after'], '30');
        assert.equal(err.errno, error.ERRNO.DISABLED_CLIENT_ID);
      }
      assert.notCalled(mockOAuthDB.getScopedKeyData);
    });
  });

  describe('/oauth/authorization', () => {
    it('calls oauthdb.createAuthorizationCode', async () => {
      mockOAuthDB = mocks.mockOAuthDB({
        createAuthorizationCode: sinon.spy(async () => {
          return {
            redirect: 'bogus',
            code: 'aaabbbccc',
            state: 'xyz',
          };
        }),
      });
      sessionToken = await mockSessionToken();
      const mockRequest = mocks.mockRequest({
        credentials: sessionToken,
        payload: {
          client_id: MOCK_CLIENT_ID,
          scope: MOCK_SCOPES,
          state: 'xyz',
        },
      });
      const resp = await loadAndCallRoute('/oauth/authorization', mockRequest);
      assert.calledOnce(mockLog.notifyAttachedServices);
      const notifyCall = mockLog.notifyAttachedServices.args[0];
      assert.equal(notifyCall[0], 'login');
      const notification = notifyCall[2];
      assert.equal(notification.clientId, MOCK_CLIENT_ID);
      assert.equal(notification.service, MOCK_CLIENT_ID);
      assert.calledOnce(mockOAuthDB.createAuthorizationCode);
      assert.calledWithExactly(
        mockOAuthDB.createAuthorizationCode,
        sessionToken,
        {
          client_id: MOCK_CLIENT_ID,
          scope: MOCK_SCOPES,
          state: 'xyz',
          access_type: 'online',
          response_type: 'code',
        }
      );
      assert.deepEqual(resp, {
        redirect: 'bogus',
        code: 'aaabbbccc',
        state: 'xyz',
      });
    });

    it('can refuse to authorize new grants for selected OAuth clients', async () => {
      mockOAuthDB = mocks.mockOAuthDB();
      mockConfig.oauth.disableNewConnectionsForClients = [MOCK_CLIENT_ID];
      sessionToken = await mockSessionToken();
      const mockRequest = mocks.mockRequest({
        credentials: sessionToken,
        payload: {
          client_id: MOCK_CLIENT_ID,
          scope: MOCK_SCOPES,
          state: 'xyz',
        },
      });
      try {
        await loadAndCallRoute('/oauth/authorization', mockRequest);
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.output.statusCode, 503);
        assert.equal(err.output.headers['retry-after'], '30');
        assert.equal(err.errno, error.ERRNO.DISABLED_CLIENT_ID);
      }
      assert.notCalled(mockOAuthDB.createAuthorizationCode);
    });
  });

  describe('/oauth/token', () => {
    it('calls oauthdb.grantTokensFromSessionToken when told nothing else about the grant type', async () => {
      mockOAuthDB = mocks.mockOAuthDB({
        grantTokensFromSessionToken: sinon.spy(async () => {
          return MOCK_TOKEN_RESPONSE;
        }),
      });
      sessionToken = await mockSessionToken();
      const mockRequest = mocks.mockRequest({
        credentials: sessionToken,
        payload: {
          client_id: MOCK_CLIENT_ID,
          scope: MOCK_SCOPES,
        },
      });
      const mockEmitMetricsEvent = sinon.stub(mockRequest, 'emitMetricsEvent');
      const resp = await loadAndCallRoute('/oauth/token', mockRequest);
      assert.calledOnce(mockOAuthDB.grantTokensFromSessionToken);
      assert.calledWithExactly(
        mockOAuthDB.grantTokensFromSessionToken,
        sessionToken,
        {
          client_id: MOCK_CLIENT_ID,
          scope: MOCK_SCOPES,
          grant_type: 'fxa-credentials',
          access_type: 'online',
        }
      );
      assert.calledOnce(mockEmitMetricsEvent);
      assert.calledWithExactly(mockEmitMetricsEvent, 'oauth.token.created', {
        grantType: 'fxa-credentials',
        uid: MOCK_USER_ID,
      });
      assert.deepEqual(resp, MOCK_TOKEN_RESPONSE);
    });

    it('calls oauthdb.grantTokensFromAuthorizationCode when `code` input is provided', async () => {
      mockOAuthDB = mocks.mockOAuthDB({
        grantTokensFromAuthorizationCode: sinon.spy(async () => {
          return MOCK_TOKEN_RESPONSE;
        }),
      });
      const mockRequest = mocks.mockRequest({
        credentials: sessionToken,
        payload: {
          client_id: MOCK_CLIENT_ID,
          client_secret: 'ABCDEF',
          code: MOCK_AUTHORIZATION_CODE,
        },
      });
      const mockEmitMetricsEvent = sinon.stub(mockRequest, 'emitMetricsEvent');
      const resp = await loadAndCallRoute('/oauth/token', mockRequest);
      assert.calledOnce(mockOAuthDB.grantTokensFromAuthorizationCode);
      assert.calledWithExactly(mockOAuthDB.grantTokensFromAuthorizationCode, {
        client_id: MOCK_CLIENT_ID,
        client_secret: 'ABCDEF',
        code: MOCK_AUTHORIZATION_CODE,
        grant_type: 'authorization_code',
      });
      assert.calledOnce(mockEmitMetricsEvent);
      assert.calledWithExactly(mockEmitMetricsEvent, 'oauth.token.created', {
        grantType: 'authorization_code',
        uid: MOCK_USER_ID,
      });
      assert.deepEqual(resp, MOCK_TOKEN_RESPONSE);
    });

    it('calls oauthdb.grantTokensFromAuthorizationCode when `grant_type=authorization_code`', async () => {
      mockOAuthDB = mocks.mockOAuthDB({
        grantTokensFromAuthorizationCode: sinon.spy(async () => {
          return MOCK_TOKEN_RESPONSE;
        }),
      });
      const mockRequest = mocks.mockRequest({
        credentials: sessionToken,
        payload: {
          client_id: MOCK_CLIENT_ID,
          client_secret: 'ABCDEF',
          code: MOCK_AUTHORIZATION_CODE,
          grant_type: 'authorization_code',
        },
      });
      const mockEmitMetricsEvent = sinon.stub(mockRequest, 'emitMetricsEvent');
      const resp = await loadAndCallRoute('/oauth/token', mockRequest);
      assert.calledOnce(mockOAuthDB.grantTokensFromAuthorizationCode);
      assert.calledWithExactly(mockOAuthDB.grantTokensFromAuthorizationCode, {
        client_id: MOCK_CLIENT_ID,
        client_secret: 'ABCDEF',
        code: MOCK_AUTHORIZATION_CODE,
        grant_type: 'authorization_code',
      });
      assert.calledOnce(mockEmitMetricsEvent);
      assert.calledWithExactly(mockEmitMetricsEvent, 'oauth.token.created', {
        grantType: 'authorization_code',
        uid: MOCK_USER_ID,
      });
      assert.deepEqual(resp, MOCK_TOKEN_RESPONSE);
    });

    it('calls oauthdb.grantTokensFromRefreshToken when `grant_type=refresh_token`', async () => {
      mockOAuthDB = mocks.mockOAuthDB({
        grantTokensFromRefreshToken: sinon.spy(async () => {
          return MOCK_TOKEN_RESPONSE;
        }),
      });
      const mockRequest = mocks.mockRequest({
        credentials: sessionToken,
        payload: {
          client_id: MOCK_CLIENT_ID,
          client_secret: 'ABCDEF',
          refresh_token: MOCK_AUTHORIZATION_CODE,
          grant_type: 'refresh_token',
        },
      });
      const mockEmitMetricsEvent = sinon.stub(mockRequest, 'emitMetricsEvent');
      const resp = await loadAndCallRoute('/oauth/token', mockRequest);
      assert.calledOnce(mockOAuthDB.grantTokensFromRefreshToken);
      assert.calledWithExactly(mockOAuthDB.grantTokensFromRefreshToken, {
        client_id: MOCK_CLIENT_ID,
        client_secret: 'ABCDEF',
        refresh_token: MOCK_AUTHORIZATION_CODE,
        grant_type: 'refresh_token',
      });
      assert.calledOnce(mockEmitMetricsEvent);
      assert.calledWithExactly(mockEmitMetricsEvent, 'oauth.token.created', {
        grantType: 'refresh_token',
        uid: MOCK_USER_ID,
      });
      assert.deepEqual(resp, MOCK_TOKEN_RESPONSE);
    });

    it('calls oauthdb.grantTokensFromSessionToken when `grant_type=fxa-credentials`', async () => {
      mockOAuthDB = mocks.mockOAuthDB({
        grantTokensFromSessionToken: sinon.spy(async () => {
          return MOCK_TOKEN_RESPONSE;
        }),
      });
      sessionToken = await mockSessionToken();
      const mockRequest = mocks.mockRequest({
        credentials: sessionToken,
        payload: {
          client_id: MOCK_CLIENT_ID,
          scope: MOCK_SCOPES,
          grant_type: 'fxa-credentials',
        },
      });
      const mockEmitMetricsEvent = sinon.stub(mockRequest, 'emitMetricsEvent');
      const resp = await loadAndCallRoute('/oauth/token', mockRequest);
      assert.calledOnce(mockOAuthDB.grantTokensFromSessionToken);
      assert.calledWithExactly(
        mockOAuthDB.grantTokensFromSessionToken,
        sessionToken,
        {
          client_id: MOCK_CLIENT_ID,
          scope: MOCK_SCOPES,
          grant_type: 'fxa-credentials',
          access_type: 'online',
        }
      );
      assert.calledOnce(mockEmitMetricsEvent);
      assert.calledWithExactly(mockEmitMetricsEvent, 'oauth.token.created', {
        grantType: 'fxa-credentials',
        uid: MOCK_USER_ID,
      });
      assert.deepEqual(resp, MOCK_TOKEN_RESPONSE);
    });

    it('refuses to call oauthdb.grantTokensFromSessionToken without a valid sessionToken', async () => {
      mockOAuthDB = mocks.mockOAuthDB({
        grantTokensFromSessionToken: sinon.spy(async () => {
          return MOCK_TOKEN_RESPONSE;
        }),
      });
      const mockRequest = mocks.mockRequest({
        credentials: null,
        payload: {
          client_id: MOCK_CLIENT_ID,
          scope: MOCK_SCOPES,
          grant_type: 'fxa-credentials',
        },
      });
      const mockEmitMetricsEvent = sinon.stub(mockRequest, 'emitMetricsEvent');
      try {
        await loadAndCallRoute('/oauth/token', mockRequest);
        throw new Error('should have thrown');
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.INVALID_TOKEN);
      }
      assert.equal(mockEmitMetricsEvent.callCount, 0);
      assert.equal(mockOAuthDB.grantTokensFromSessionToken.callCount, 0);
    });
  });

  describe('/oauth/destroy', () => {
    const SUCCESS = async () => {
      return {};
    };
    const NOTFOUND = async () => {
      throw error.invalidToken();
    };

    it('tries oauthdb.revokeAccessToken then oauthdb.revokeRefreshToken when told nothing about the token', async () => {
      mockOAuthDB = mocks.mockOAuthDB({
        revokeAccessToken: sinon.spy(NOTFOUND),
        revokeRefreshToken: sinon.spy(NOTFOUND),
      });
      const mockRequest = mocks.mockRequest({
        payload: {
          client_id: MOCK_CLIENT_ID,
          token: MOCK_TOKEN,
        },
      });
      await loadAndCallRoute('/oauth/destroy', mockRequest);
      assert.calledOnce(mockOAuthDB.revokeAccessToken);
      assert.calledOnce(mockOAuthDB.revokeRefreshToken);
      assert.ok(
        mockOAuthDB.revokeAccessToken.calledBefore(
          mockOAuthDB.revokeRefreshToken
        )
      );
      assert.calledWithExactly(mockOAuthDB.revokeAccessToken, MOCK_TOKEN, {
        client_id: MOCK_CLIENT_ID,
      });
      assert.calledWithExactly(mockOAuthDB.revokeRefreshToken, MOCK_TOKEN, {
        client_id: MOCK_CLIENT_ID,
      });
    });

    it('does not try revokeRefreshToken if revokeAccessToken succeeded', async () => {
      mockOAuthDB = mocks.mockOAuthDB({
        revokeAccessToken: sinon.spy(SUCCESS),
        revokeRefreshToken: sinon.spy(NOTFOUND),
      });
      const mockRequest = mocks.mockRequest({
        payload: {
          client_id: MOCK_CLIENT_ID,
          token: MOCK_TOKEN,
        },
      });
      await loadAndCallRoute('/oauth/destroy', mockRequest);
      assert.calledOnce(mockOAuthDB.revokeAccessToken);
      assert.notCalled(mockOAuthDB.revokeRefreshToken);
    });

    it('does not try revokeRefreshToken if the given token looks like a JWT', async () => {
      mockOAuthDB = mocks.mockOAuthDB({
        revokeAccessToken: sinon.spy(NOTFOUND),
        revokeRefreshToken: sinon.spy(NOTFOUND),
      });
      const mockRequest = mocks.mockRequest({
        payload: {
          client_id: MOCK_CLIENT_ID,
          token: MOCK_JWT,
        },
      });
      await loadAndCallRoute('/oauth/destroy', mockRequest);
      assert.calledOnce(mockOAuthDB.revokeAccessToken);
      assert.notCalled(mockOAuthDB.revokeRefreshToken);
    });

    it('tries oauthdb.revokeAccessToken then oauthdb.revokeRefreshToken when told this is an access token', async () => {
      mockOAuthDB = mocks.mockOAuthDB({
        revokeAccessToken: sinon.spy(NOTFOUND),
        revokeRefreshToken: sinon.spy(NOTFOUND),
      });
      const mockRequest = mocks.mockRequest({
        payload: {
          client_id: MOCK_CLIENT_ID,
          token: MOCK_TOKEN,
          token_type_hint: 'access_token',
        },
      });
      await loadAndCallRoute('/oauth/destroy', mockRequest);
      assert.calledOnce(mockOAuthDB.revokeAccessToken);
      assert.calledOnce(mockOAuthDB.revokeRefreshToken);
      assert.ok(
        mockOAuthDB.revokeAccessToken.calledBefore(
          mockOAuthDB.revokeRefreshToken
        )
      );
    });

    it('tries oauthdb.revokeAccessToken then oauthdb.revokeRefreshToken when given an unknown token-type hint', async () => {
      mockOAuthDB = mocks.mockOAuthDB({
        revokeAccessToken: sinon.spy(NOTFOUND),
        revokeRefreshToken: sinon.spy(NOTFOUND),
      });
      const mockRequest = mocks.mockRequest({
        payload: {
          client_id: MOCK_CLIENT_ID,
          token: MOCK_TOKEN,
          token_type_hint: 'amazing_new_token_type_we_have_never_heard_of',
        },
      });
      await loadAndCallRoute('/oauth/destroy', mockRequest);
      assert.calledOnce(mockOAuthDB.revokeAccessToken);
      assert.calledOnce(mockOAuthDB.revokeRefreshToken);
      assert.ok(
        mockOAuthDB.revokeAccessToken.calledBefore(
          mockOAuthDB.revokeRefreshToken
        )
      );
    });

    it('tries oauthdb.revokeRefreshToken then oauthdb.revokeAccessToken when told this is a refresh token', async () => {
      mockOAuthDB = mocks.mockOAuthDB({
        revokeAccessToken: sinon.spy(NOTFOUND),
        revokeRefreshToken: sinon.spy(NOTFOUND),
      });
      const mockRequest = mocks.mockRequest({
        payload: {
          client_id: MOCK_CLIENT_ID,
          token: MOCK_TOKEN,
          token_type_hint: 'refresh_token',
        },
      });
      await loadAndCallRoute('/oauth/destroy', mockRequest);
      assert.calledOnce(mockOAuthDB.revokeRefreshToken);
      assert.calledOnce(mockOAuthDB.revokeAccessToken);
      assert.ok(
        mockOAuthDB.revokeRefreshToken.calledBefore(
          mockOAuthDB.revokeAccessToken
        )
      );
      assert.calledWithExactly(mockOAuthDB.revokeRefreshToken, MOCK_TOKEN, {
        client_id: MOCK_CLIENT_ID,
      });
      assert.calledWithExactly(mockOAuthDB.revokeAccessToken, MOCK_TOKEN, {
        client_id: MOCK_CLIENT_ID,
      });
    });

    it('accepts client credentials in request header', async () => {
      mockOAuthDB = mocks.mockOAuthDB({
        revokeAccessToken: sinon.spy(SUCCESS),
      });
      const mockRequest = mocks.mockRequest({
        headers: {
          authorization:
            'Basic ' +
            Buffer.from(MOCK_CLIENT_ID + ':' + MOCK_TOKEN).toString('base64'),
        },
        payload: {
          token: MOCK_TOKEN,
        },
      });
      await loadAndCallRoute('/oauth/destroy', mockRequest);
      assert.calledOnce(mockOAuthDB.revokeAccessToken);
      assert.calledWithExactly(mockOAuthDB.revokeAccessToken, MOCK_TOKEN, {
        client_id: MOCK_CLIENT_ID,
        client_secret: MOCK_TOKEN,
      });
    });

    it('errors if no client_id is provided', async () => {
      const mockRequest = mocks.mockRequest({
        payload: {
          token: MOCK_TOKEN,
        },
      });
      try {
        await loadAndCallRoute('/oauth/destroy', mockRequest);
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.details[0].message, '"client_id" is required');
      }
    });

    it('does not try more token types if client credentials are invalid', async () => {
      mockOAuthDB = mocks.mockOAuthDB({
        revokeAccessToken: sinon.spy(async () => {
          throw error.unknownClientId(MOCK_CLIENT_ID);
        }),
        revokeRefreshToken: sinon.spy(SUCCESS),
      });
      const mockRequest = mocks.mockRequest({
        payload: {
          client_id: MOCK_CLIENT_ID,
          token: MOCK_TOKEN,
        },
      });
      try {
        await loadAndCallRoute('/oauth/destroy', mockRequest);
        assert.fail('should have thrown');
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.UNKNOWN_CLIENT_ID);
      }
      assert.calledOnce(mockOAuthDB.revokeAccessToken);
      assert.notCalled(mockOAuthDB.revokeRefreshToken);
    });
  });
});
