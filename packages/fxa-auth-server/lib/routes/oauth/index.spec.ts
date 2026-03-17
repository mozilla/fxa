/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon from 'sinon';

// Mock the OAuth DB to prevent real MySQL connections
jest.mock('../../oauth/db', () => ({
  getClient: jest.fn().mockResolvedValue(null),
  getAccessToken: jest.fn().mockResolvedValue(null),
  getRefreshToken: jest.fn().mockResolvedValue(null),
  removeAccessToken: jest.fn().mockResolvedValue(null),
  removeRefreshToken: jest.fn().mockResolvedValue(null),
}));

const mocks = require('../../../test/mocks');
const { getRoute } = require('../../../test/routes_helpers');
const { AppError: error } = require('@fxa/accounts/errors');
const JWTIdToken = require('../../oauth/jwt_id_token');

const { OAUTH_SCOPE_OLD_SYNC } = require('fxa-shared/oauth/constants');
const MOCK_CLIENT_ID = '0123456789abcdef';
const MOCK_USER_ID = '0123456789abcdef0123456789abcdef';
const MOCK_SCOPES = `profile https://identity.mozilla.com/apps/scoped-example ${OAUTH_SCOPE_OLD_SYNC}`;
const MOCK_UNIX_TIMESTAMP = Math.round(Date.now() / 1000);
const MOCK_TOKEN =
  '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff';
const MOCK_JWT =
  '001122334455.66778899aabbccddeeff00112233445566778899.aabbccddeeff';

describe('/oauth/ routes', () => {
  let mockDB: any, mockLog: any, mockConfig: any, sessionToken: any, mockStatsD: any;

  async function loadAndCallRoute(path: string, request: any) {
    const routes = require('./index')(
      mockLog,
      mockConfig,
      mockDB,
      {},
      {},
      mockStatsD
    );
    const route = await getRoute(routes, path);
    if (route.config.validate.payload) {
      const validationSchema = route.config.validate.payload;
      request.payload = await validationSchema.validateAsync(request.payload, {
        context: {
          headers: request.headers || {},
        },
      });
    }
    const response = await route.handler(request);
    if (response instanceof Error) {
      throw response;
    }
    return response;
  }

  async function mockSessionToken(props: any = {}) {
    const Token = require(`../../tokens/token`)(mockLog);
    const SessionToken = require(`../../tokens/session_token`)(
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
      oauthServer: {
        expiration: {
          accessToken: 999,
        },
        disabledClients: [],
        contentUrl: 'http://localhost:3030',
      },
    };
  });

  describe('/oauth/id-token-verify', () => {
    let MOCK_ID_TOKEN_CLAIMS: any, mockVerify: sinon.SinonStub;

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

    const _testRequest = async (claims: any, gracePeriod?: number) => {
      mockVerify.returns(claims);
      const payload: any = {
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

      sinon.assert.calledOnce(mockVerify);
      expect(resp).toEqual(MOCK_ID_TOKEN_CLAIMS);
      mockVerify.restore();
    });

    it('supports expiryGracePeriod option', async () => {
      const resp = await _testRequest(MOCK_ID_TOKEN_CLAIMS, 600);

      sinon.assert.calledOnce(mockVerify);
      expect(resp).toEqual(MOCK_ID_TOKEN_CLAIMS);
      mockVerify.restore();
    });

    it('allows extra claims', async () => {
      MOCK_ID_TOKEN_CLAIMS.foo = 'bar';

      const resp = await _testRequest(MOCK_ID_TOKEN_CLAIMS);

      sinon.assert.calledOnce(mockVerify);
      expect(resp).toEqual(MOCK_ID_TOKEN_CLAIMS);
      mockVerify.restore();
    });

    it('allows missing claims', async () => {
      delete MOCK_ID_TOKEN_CLAIMS.acr;

      const resp = await _testRequest(MOCK_ID_TOKEN_CLAIMS);

      sinon.assert.calledOnce(mockVerify);
      expect(resp).toEqual(MOCK_ID_TOKEN_CLAIMS);
      mockVerify.restore();
    });
  });

  describe('/oauth/authorization', () => {
    it('can refuse to authorize new grants for selected OAuth clients', async () => {
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
      await expect(
        loadAndCallRoute('/oauth/authorization', mockRequest)
      ).rejects.toMatchObject({
        output: { statusCode: 503 },
        errno: error.ERRNO.DISABLED_CLIENT_ID,
      });
    });
  });

  describe('/oauth/destroy', () => {
    it('errors if no client_id is provided', async () => {
      const mockRequest = mocks.mockRequest({
        payload: {
          token: MOCK_TOKEN,
        },
      });
      await expect(
        loadAndCallRoute('/oauth/destroy', mockRequest)
      ).rejects.toMatchObject({
        details: [{ message: '"client_id" is required' }],
      });
    });

    it('does not try more token types if client credentials are invalid', async () => {
      const mockRequest = mocks.mockRequest({
        payload: {
          client_id: '0000000000000000',
          token: MOCK_TOKEN,
        },
      });
      await expect(
        loadAndCallRoute('/oauth/destroy', mockRequest)
      ).rejects.toMatchObject({
        errno: error.ERRNO.UNKNOWN_CLIENT_ID,
      });
    });
  });

  describe('/account/scoped-key-data', () => {
    it('increments statsd count', async () => {
      mockStatsD = { increment: jest.fn() };
      sessionToken = await mockSessionToken({ verifierSetAt: 123 });
      const mockRequest = mocks.mockRequest({
        credentials: sessionToken,
        payload: {
          client_id: MOCK_CLIENT_ID,
          scope: 'testo profile',
        },
      });
      try {
        await loadAndCallRoute('/account/scoped-key-data', mockRequest);
      } catch (err) {
        // no op the statsd call happens before key handler
      }
      expect(mockStatsD.increment).toHaveBeenCalledTimes(1);
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'oauth.rp.scoped-keys-metadata',
        { clientId: MOCK_CLIENT_ID }
      );
    });
  });
});
