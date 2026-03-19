/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon from 'sinon';

const buf = (v: any) => (Buffer.isBuffer(v) ? v : Buffer.from(v, 'hex'));
const hex = (v: any) => (Buffer.isBuffer(v) ? v.toString('hex') : v);

const UID = 'eaf0';
const CLIENT_ID = '98e6508e88680e1b';
const CODE = 'df6dcfe7bf6b54a65db5742cbcdce5c0a84a5da81a0bb6bdf5fc793eef041fc6';
const REFRESH_TOKEN = CODE;
const DISABLED_CLIENT_ID = 'd15ab1edd15ab1ed';
const NON_DISABLED_CLIENT_ID = '98e6508e88680e1a';
const CODE_WITH_KEYS = 'afafaf';
const CODE_WITHOUT_KEYS = 'f0f0f0';

const mockDb = { touchSessionToken: sinon.stub() };
const mockStatsD = { increment: sinon.stub() };
const mockGlean = { oauth: { tokenCreated: sinon.stub() } };

const tokenRoutesDepMocks = {
  '../../oauth/assertion': async () => true,
  '../../oauth/client': {
    authenticateClient: (_: any, params: any) => ({
      id: buf(params.client_id),
      canGrant: true,
      publicClient: true,
    }),
  },
  '../../oauth/grant': {
    generateTokens: (grant: any) => {
      const t = { ...grant, keys_jwe: grant.keysJwe } as any;
      if (grant.offline) {
        t.refresh_token = '00ff';
      }
      return t;
    },
    validateRequestedGrant: () => ({ offline: true, scope: 'testo' }),
  },
  '../../oauth/util': {
    makeAssertionJWT: async () => ({}),
  },
};
const tokenRoutesArgMocks = {
  log: {
    debug: () => {},
    warn: () => {},
  },
  oauthDB: {
    async getRefreshToken() {
      return null;
    },
    async getCode(x: any) {
      if (hex(x) === CODE_WITH_KEYS) {
        return {
          userId: buf(UID),
          clientId: buf(CLIENT_ID),
          createdAt: Date.now(),
          keysJwe: 'mykeys',
        };
      }
      if (hex(x) === CODE_WITHOUT_KEYS) {
        return {
          clientId: buf(CLIENT_ID),
          createdAt: Date.now(),
        };
      }
      return null;
    },
    async removeCode() {
      return null;
    },
  },
  db: mockDb,
  mailer: {},
  devices: {},
  statsd: mockStatsD,
  glean: mockGlean,
};

let tokenRoutes: any;

beforeAll(() => {
  const { Container } = require('typedi');
  Container.set('OAuthClientInfo', {
    async fetch() {
      return 'sync';
    },
  });

  // Load the real client module first to get clientAuthValidators (needed at
  // module-definition time for Joi schema), then reset and mock selectively.
  const realClient = require('../../lib/oauth/client');
  jest.resetModules();
  // Mock the modules at their resolved paths (relative to this test file).
  // token.js at lib/routes/oauth/token.js requires('../../oauth/...') which
  // resolves to lib/oauth/..., so from test/remote/ that's ../../lib/oauth/...
  jest.doMock(
    '../../lib/oauth/assertion',
    () => tokenRoutesDepMocks['../../oauth/assertion']
  );
  jest.doMock('../../lib/oauth/client', () => ({
    ...tokenRoutesDepMocks['../../oauth/client'],
    clientAuthValidators: realClient.clientAuthValidators,
  }));
  jest.doMock(
    '../../lib/oauth/grant',
    () => tokenRoutesDepMocks['../../oauth/grant']
  );
  jest.doMock(
    '../../lib/oauth/util',
    () => tokenRoutesDepMocks['../../oauth/util']
  );
  const tokenRouteFactory = require('../../lib/routes/oauth/token');
  tokenRoutes = tokenRouteFactory(tokenRoutesArgMocks);
});

describe('/token POST (integration)', () => {
  let route: any;

  beforeAll(() => {
    route = tokenRoutes[0];
  });

  describe('config handling', () => {
    const request: any = {
      headers: {},
      payload: {
        client_id: CLIENT_ID,
      },
    };

    it('allows clients that have not been disabled via config', async () => {
      request.payload.client_id = NON_DISABLED_CLIENT_ID;
      request.payload.grant_type = 'refresh_token';
      request.payload.refresh_token = REFRESH_TOKEN;
      // The request still fails, but it fails at the point where we check the token,
      // meaning that the client_id was allowed through the disabled filter.
      await expect(route.config.handler(request)).rejects.toMatchObject({
        errno: 108, // Invalid token
      });
    });

    it('allows code grants for clients that have been disabled via config', async () => {
      request.payload.client_id = DISABLED_CLIENT_ID;
      request.payload.grant_type = 'authorization_code';
      request.payload.code = CODE;
      // The request still fails, but it fails at the point where we check the code,
      // meaning that the client_id was allowed through the disabled filter.
      await expect(route.config.handler(request)).rejects.toMatchObject({
        errno: 105,
      });
    });

    it('returns an error on refresh_token grants for clients that have been disabled via config', async () => {
      request.payload.client_id = DISABLED_CLIENT_ID;
      request.payload.grant_type = 'refresh_token';
      request.payload.refresh_token = REFRESH_TOKEN;
      await expect(route.config.handler(request)).rejects.toMatchObject({
        output: { statusCode: 503 },
        errno: 202, // Disabled client
      });
    });

    it('returns an error on fxa-credentials grants for clients that have been disabled via config', async () => {
      request.payload.client_id = DISABLED_CLIENT_ID;
      request.payload.grant_type = 'fxa-credentials';
      await expect(route.config.handler(request)).rejects.toMatchObject({
        output: { statusCode: 503 },
        errno: 202, // Disabled client
      });
    });
  });
});
