/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../../..';

const sinon = require('sinon');
const Joi = require('joi');
const assert = { ...sinon.assert, ...require('chai').assert };
const uuid = require('uuid');
const getRoute = require('../../routes_helpers').getRoute;
const mocks = require('../../mocks');
const error = require('../../../lib/error');

const MOCK_CLIENT_ID = '0123456789ABCDEF';
const MOCK_SCOPES = 'mock-scope another-scope';
const MOCK_AUTHORIZATION_CODE =
  'aaaaaabbbbbbccccccddddddeeeeeeffaaaaaabbbbbbccccccddddddeeeeeeff';
const MOCK_TOKEN_RESPONSE = {
  access_token: 'ACCESS',
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
      request.payload = await Joi.validate(
        request.payload,
        route.options.validate.payload
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
      uid: uuid.v4('binary').toString('hex'),
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
      assert.deepEqual(resp, MOCK_TOKEN_RESPONSE);
    });

    it('calls oauthdb.grantTokensFromAuthorizationCode when `code` input is provided', async () => {
      mockOAuthDB = mocks.mockOAuthDB({
        grantTokensFromAuthorizationCode: sinon.spy(async () => {
          return MOCK_TOKEN_RESPONSE;
        }),
      });
      const mockRequest = mocks.mockRequest({
        payload: {
          client_id: MOCK_CLIENT_ID,
          client_secret: 'ABCDEF',
          code: MOCK_AUTHORIZATION_CODE,
        },
      });
      const resp = await loadAndCallRoute('/oauth/token', mockRequest);
      assert.calledOnce(mockOAuthDB.grantTokensFromAuthorizationCode);
      assert.calledWithExactly(mockOAuthDB.grantTokensFromAuthorizationCode, {
        client_id: MOCK_CLIENT_ID,
        client_secret: 'ABCDEF',
        code: MOCK_AUTHORIZATION_CODE,
        grant_type: 'authorization_code',
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
        payload: {
          client_id: MOCK_CLIENT_ID,
          client_secret: 'ABCDEF',
          code: MOCK_AUTHORIZATION_CODE,
          grant_type: 'authorization_code',
        },
      });
      const resp = await loadAndCallRoute('/oauth/token', mockRequest);
      assert.calledOnce(mockOAuthDB.grantTokensFromAuthorizationCode);
      assert.calledWithExactly(mockOAuthDB.grantTokensFromAuthorizationCode, {
        client_id: MOCK_CLIENT_ID,
        client_secret: 'ABCDEF',
        code: MOCK_AUTHORIZATION_CODE,
        grant_type: 'authorization_code',
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
        payload: {
          client_id: MOCK_CLIENT_ID,
          client_secret: 'ABCDEF',
          refresh_token: MOCK_AUTHORIZATION_CODE,
          grant_type: 'refresh_token',
        },
      });
      const resp = await loadAndCallRoute('/oauth/token', mockRequest);
      assert.calledOnce(mockOAuthDB.grantTokensFromRefreshToken);
      assert.calledWithExactly(mockOAuthDB.grantTokensFromRefreshToken, {
        client_id: MOCK_CLIENT_ID,
        client_secret: 'ABCDEF',
        refresh_token: MOCK_AUTHORIZATION_CODE,
        grant_type: 'refresh_token',
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
      try {
        await loadAndCallRoute('/oauth/token', mockRequest);
        throw new Error('should have thrown');
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.INVALID_TOKEN);
      }
      assert.equal(mockOAuthDB.grantTokensFromSessionToken.callCount, 0);
    });
  });
});
