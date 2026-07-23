/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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

const mockDb = { touchSessionToken: jest.fn() };
const mockStatsD = { increment: jest.fn() };
const mockGlean = { oauth: { tokenCreated: jest.fn() } };
const mockAuthServerCacheRedis = { get: jest.fn(), set: jest.fn() };
// The vpn-dau helper's own decision logic is unit-tested in
// lib/oauth/vpn-dau.spec.ts; here we mock it at the module boundary to verify
// token.js applies its result to the Glean event and still returns the token.
const mockShouldExcludeFromDau = jest.fn();

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
    validateRequestedGrant: () => ({
      offline: true,
      scope: 'testo',
      userId: buf(UID),
      clientId: buf(CLIENT_ID),
    }),
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
  authServerCacheRedis: mockAuthServerCacheRedis,
};

// Captured at module scope so beforeAll's set and afterAll's remove use the
// same Container instance; beforeAll calls jest.resetModules() after the set,
// and a fresh require would otherwise hand back a different Container.
const { Container } = require('typedi');

let tokenRoutes: any;

beforeAll(() => {
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
  jest.doMock('../../lib/oauth/vpn-dau', () => ({
    shouldExcludeFromDau: mockShouldExcludeFromDau,
  }));
  const tokenRouteFactory = require('../../lib/routes/oauth/token');
  tokenRoutes = tokenRouteFactory(tokenRoutesArgMocks);
});

afterAll(() => {
  Container.remove('OAuthClientInfo');
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

  describe('VPN-in-Desktop DAU bandaid', () => {
    function fxaCredentialsRequest(overrides: any = {}) {
      return {
        headers: {},
        emitMetricsEvent: jest.fn(),
        payload: {
          client_id: NON_DISABLED_CLIENT_ID,
          grant_type: 'fxa-credentials',
          assertion: 'unused-mocked-assertion',
          ...overrides,
        },
      };
    }

    it('tags the Glean event with excludeDau when the helper says to exclude', async () => {
      mockShouldExcludeFromDau.mockResolvedValue(true);
      const request = fxaCredentialsRequest();
      await route.config.handler(request);
      expect(mockShouldExcludeFromDau).toHaveBeenCalledTimes(1);
      expect(mockGlean.oauth.tokenCreated).toHaveBeenCalledWith(request, {
        uid: UID,
        oauthClientId: CLIENT_ID,
        reason: 'fxa-credentials',
        scopes: 'testo',
        excludeDau: true,
      });
    });

    it('leaves excludeDau false when the helper says to count', async () => {
      mockShouldExcludeFromDau.mockResolvedValue(false);
      const request = fxaCredentialsRequest();
      await route.config.handler(request);
      expect(mockShouldExcludeFromDau).toHaveBeenCalledTimes(1);
      expect(mockGlean.oauth.tokenCreated).toHaveBeenCalledWith(
        request,
        expect.objectContaining({ excludeDau: false })
      );
    });

    it('still returns the granted token when the helper excludes it from DAU', async () => {
      mockShouldExcludeFromDau.mockResolvedValue(true);
      const result = await route.config.handler(fxaCredentialsRequest());
      expect(result).toMatchObject({ refresh_token: '00ff' });
    });

    it('does not consult the helper when the client already supplied exclude_dau=true', async () => {
      mockShouldExcludeFromDau.mockResolvedValue(false);
      const request = fxaCredentialsRequest({ exclude_dau: true });
      await route.config.handler(request);
      expect(mockShouldExcludeFromDau).not.toHaveBeenCalled();
      expect(mockGlean.oauth.tokenCreated).toHaveBeenCalledWith(
        request,
        expect.objectContaining({ excludeDau: true })
      );
    });
  });
});
