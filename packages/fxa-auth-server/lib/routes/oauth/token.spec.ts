/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const crypto = require('crypto');
const Joi = require('joi');
const { Container } = require('typedi');
const { AppError: AuthError, OAUTH_ERRNO } = require('@fxa/accounts/errors');
const ScopeSet = require('fxa-shared').oauth.scopes;

const {
  OAUTH_SCOPE_OLD_SYNC,
  OAUTH_SCOPE_RELAY,
  OAUTH_SCOPE_SESSION_TOKEN,
} = require('fxa-shared/oauth/constants');
const encrypt = require('fxa-shared/auth/encrypt');
const { OAuthNativeClients } = require('@fxa/accounts/oauth');
const {
  excludeDauCacheKey,
} = require('../../oauth/desktop-sync-dau-authorization-bandaid');

function buf(v: any) {
  return Buffer.isBuffer(v) ? v : Buffer.from(v, 'hex');
}

function hex(v: any) {
  return Buffer.isBuffer(v) ? v.toString('hex') : v;
}

const UID = 'eaf0';
const CLIENT_SECRET =
  'b93ef8a8f3e553a430d7e5b904c6132b2722633af9f03128029201d24a97f2a8';
const CLIENT_ID = '98e6508e88680e1b';
const CODE = 'df6dcfe7bf6b54a65db5742cbcdce5c0a84a5da81a0bb6bdf5fc793eef041fc6';
const REFRESH_TOKEN = CODE;
const PKCE_CODE_VERIFIER = 'au3dqDz2dOB0_vSikXCUf4S8Gc-37dL-F7sGxtxpR3R';
const CODE_WITH_KEYS = 'afafaf';
const CODE_WITHOUT_KEYS = 'f0f0f0';
const GRANT_TOKEN_EXCHANGE = 'urn:ietf:params:oauth:grant-type:token-exchange';
const SUBJECT_TOKEN_TYPE_REFRESH =
  'urn:ietf:params:oauth:token-type:refresh_token';
const FIREFOX_IOS_CLIENT_ID = '1b1a3e44c54fbb58';
const FIREFOX_DESKTOP_CLIENT_ID = OAuthNativeClients.FirefoxDesktop;
// Mirrors encrypt.hash(), used by the route to key the rate limit.
const SUBJECT_TOKEN_HASH = crypto
  .createHash('sha256')
  .update(Buffer.from(REFRESH_TOKEN, 'hex'))
  .digest('hex');

const noop = () => {};
const mockLog = { debug: noop, warn: noop, info: noop, error: noop };
const mockDb = { touchSessionToken: jest.fn() };
const mockStatsD = { increment: jest.fn() };
const mockGlean = {
  oauth: { tokenCreated: jest.fn() },
};
const mockCustoms = { checkToken: jest.fn().mockResolvedValue(undefined) };

const tokenRoutesDepMocks = {
  '../../oauth/assertion': async () => true,
  '../../oauth/client': {
    authenticateClient: (_: any, params: any) => ({
      id: buf(params.client_id),
      canGrant: true,
      publicClient: true,
    }),
    clientAuthValidators: {
      headers: Joi.object({
        authorization: Joi.string().optional(),
      }).options({ allowUnknown: true, stripUnknown: false }),
      clientId: Joi.string().hex().required().when('$headers.authorization', {
        is: Joi.string().required(),
        then: Joi.forbidden(),
      }),
      clientSecret: Joi.string()
        .hex()
        .required()
        .when('$headers.authorization', {
          is: Joi.string().required(),
          then: Joi.forbidden(),
        }),
    },
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
  '../utils/oauth': {
    newTokenNotification: async () => {},
  },
};
const tokenRoutesArgMocks = {
  log: mockLog,
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
    // Default unit-test stub: every exchanged scope falls through to
    // clients.allowedScopes. Tests that need a different decision (deny,
    // bypass, allowed) override on the per-test mock.
    async hasConsentForExchange() {
      return { result: 'fall-through' };
    },
    // Permissive subject_token client used by the fall-through gate.
    // Tests that need a restrictive client override on the per-test mock.
    async getClient() {
      return {
        allowedScopes:
          'profile https://identity.mozilla.com/apps/relay https://identity.mozilla.com/apps/oldsync',
      };
    },
    recordAccountActivity: jest.fn().mockResolvedValue({ missingScopes: [] }),
  },
  db: mockDb,
  mailer: {},
  devices: {},
  statsd: mockStatsD,
  glean: mockGlean,
  customs: mockCustoms,
};

let tokenRoutes: any;

function joiRequired(err: any, param: string) {
  expect(err.isJoi).toBe(true);
  expect(err.name).toBe('ValidationError');
  expect(err.details[0].message).toBe(`"${param}" is required`);
}

function joiNotAllowed(err: any, param: string) {
  expect(err.isJoi).toBe(true);
  expect(err.name).toBe('ValidationError');
  expect(err.details[0].message).toBe(`"${param}" is not allowed`);
}

// The /oauth/token payload is a Joi.alternatives(), so a rejection always
// surfaces the generic "does not match any of the allowed types" at the top
// level. authorization_code is the first alternative; its own failure reason is
// nested, and that is what these tests need to assert on.
function authorizationCodeAlternativeError(err: any) {
  expect(err.isJoi).toBe(true);
  expect(err.details[0].type).toBe('alternatives.match');
  return err.details[0].context.details[0];
}

function resetAndMockDeps() {
  jest.resetModules();
  for (const [key, value] of Object.entries(tokenRoutesDepMocks)) {
    jest.doMock(key, () => value);
  }
}

beforeAll(() => {
  Container.set('OAuthClientInfo', {
    async fetch() {
      return 'sync';
    },
  });

  resetAndMockDeps();
  const tokenRouteFactory = require('./token');
  tokenRoutes = tokenRouteFactory(tokenRoutesArgMocks);
});

describe('/token POST', () => {
  let route: any;

  beforeAll(() => {
    route = tokenRoutes[0];
  });

  describe('input validation', () => {
    function v(req: any, ctx?: any) {
      const validationSchema = route.config.validate.payload;
      return validationSchema.validate(req, { context: ctx });
    }

    it('fails with no client_id', () => {
      const res = v({
        client_secret: CLIENT_SECRET,
        code: CODE,
      });
      joiRequired(res.error, 'client_id');
    });

    it('valid client_secret scheme', () => {
      const res = v({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: CODE,
      });

      expect(res.error).toBeUndefined();
    });

    it('requires client_secret', () => {
      const res = v({
        client_id: CLIENT_ID,
        code: CODE,
      });

      joiRequired(res.error, 'client_secret');
    });

    it('forbids client_id when authz header provided', () => {
      const res = v(
        {
          client_id: CLIENT_ID,
        },
        {
          headers: {
            authorization: 'Basic ABCDEF',
          },
        }
      );

      joiNotAllowed(res.error, 'client_id');
    });

    it('forbids client_secret when authz header provided', () => {
      const res = v(
        {
          client_secret: CLIENT_SECRET,
          code: CODE,
        },
        {
          headers: {
            authorization: 'Basic ABCDEF',
          },
        }
      );

      joiNotAllowed(res.error, 'client_secret');
    });

    describe('pkce', () => {
      it('accepts pkce code_verifier instead of client_secret', () => {
        const res = v({
          client_id: CLIENT_ID,
          code_verifier: PKCE_CODE_VERIFIER,
          code: CODE,
        });

        expect(res.error).toBeUndefined();
      });

      it('rejects pkce code_verifier that is too small', () => {
        const bad_code_verifier = PKCE_CODE_VERIFIER.substring(0, 32);
        const res = v({
          client_id: CLIENT_ID,
          code_verifier: bad_code_verifier,
          code: CODE,
        });

        expect(res.error.isJoi).toBe(true);
        expect(res.error.name).toBe('ValidationError');
        expect(res.error.details[0].message).toBe(
          `"code_verifier" length must be at least 43 characters long`
        );
      });

      it('rejects pkce code_verifier that is too big', () => {
        const bad_code_verifier =
          PKCE_CODE_VERIFIER +
          PKCE_CODE_VERIFIER +
          PKCE_CODE_VERIFIER +
          PKCE_CODE_VERIFIER;

        const res = v({
          client_id: CLIENT_ID,
          code_verifier: bad_code_verifier,
          code: CODE,
        });

        expect(res.error.isJoi).toBe(true);
        expect(res.error.name).toBe('ValidationError');
        expect(res.error.details[0].message).toBe(
          `"code_verifier" length must be less than or equal to 128 characters long`
        );
      });

      it('rejects pkce code_verifier that contains invalid characters', () => {
        const bad_code_verifier = PKCE_CODE_VERIFIER + ' :.';
        const res = v({
          client_id: CLIENT_ID,
          code_verifier: bad_code_verifier,
          code: CODE,
        });

        expect(res.error.isJoi).toBe(true);
        expect(res.error.name).toBe('ValidationError');
        expect(res.error.details[0].message).toBe(
          `"code_verifier" with value "${bad_code_verifier}" fails to match the required pattern: /^[A-Za-z0-9-_]+$/`
        );
      });
    });
  });

  describe('statsd metrics', () => {
    beforeEach(() => {
      mockStatsD.increment.mockClear();
    });

    it('increments count on scope keys usage', async () => {
      const request = {
        app: {},
        payload: {
          client_id: CLIENT_ID,
          grant_type: 'authorization_code',
          code: CODE_WITH_KEYS,
        },
        emitMetricsEvent: () => {},
      };
      await route.config.handler(request);
      expect(mockStatsD.increment).toHaveBeenCalledWith('oauth.rp.keys-jwe', {
        clientId: CLIENT_ID,
      });
    });

    it('does not emit keys-jwe statsd when scope keys are absent', async () => {
      const request = {
        app: {},
        payload: {
          client_id: CLIENT_ID,
          grant_type: 'authorization_code',
          code: CODE_WITHOUT_KEYS,
        },
        emitMetricsEvent: () => {},
      };
      await route.config.handler(request);
      expect(mockStatsD.increment).not.toHaveBeenCalledWith(
        'oauth.rp.keys-jwe',
        expect.anything()
      );
    });
  });

  describe('Glean metrics', () => {
    it('logs the token created event', async () => {
      const request = {
        app: {},
        payload: {
          client_id: CLIENT_ID,
          grant_type: 'authorization_code',
          code: CODE_WITH_KEYS,
        },
        emitMetricsEvent: () => {},
      };
      await route.config.handler(request);
      expect(mockGlean.oauth.tokenCreated).toHaveBeenCalledTimes(1);
      expect(mockGlean.oauth.tokenCreated).toHaveBeenCalledWith(request, {
        uid: UID,
        oauthClientId: CLIENT_ID,
        reason: 'authorization_code',
        scopes: '',
        excludeDau: false,
      });
    });

    it('logs space-separated scopes from ScopeSet for the token created event', async () => {
      const SMARTWINDOW_SCOPES =
        'https://identity.mozilla.com/apps/smartwindow profile:uid';
      resetAndMockDeps();
      jest.doMock('../../oauth/grant', () => ({
        generateTokens: tokenRoutesDepMocks['../../oauth/grant'].generateTokens,
        validateRequestedGrant: () => ({
          offline: true,
          userId: buf(UID),
          clientId: buf(CLIENT_ID),
          scope: ScopeSet.fromString(SMARTWINDOW_SCOPES),
        }),
      }));
      const mockGleanLocal = {
        oauth: { tokenCreated: jest.fn() },
      };
      const routes = require('./token')({
        ...tokenRoutesArgMocks,
        glean: mockGleanLocal,
      });
      const request = {
        app: {},
        payload: {
          client_id: CLIENT_ID,
          grant_type: 'fxa-credentials',
        },
        emitMetricsEvent: () => {},
      };
      await routes[0].config.handler(request);
      expect(mockGleanLocal.oauth.tokenCreated).toHaveBeenCalledTimes(1);
      expect(mockGleanLocal.oauth.tokenCreated).toHaveBeenCalledWith(request, {
        uid: UID,
        oauthClientId: CLIENT_ID,
        reason: 'fxa-credentials',
        scopes: SMARTWINDOW_SCOPES,
        excludeDau: false,
      });
    });
  });

  describe('accountActivity recording', () => {
    // The sampleRate gate at the route handler defaults to 0 (off), so the
    // default-config tests above never invoke recordAccountActivity. Force
    // sampleRate = 1 here so the wiring is actually exercised and assert on
    // the args passed through to oauthDB.recordAccountActivity.
    function buildRouteWithSampleRate(sampleRate: number) {
      const realConfig = require('../../../config').config;
      jest.resetModules();
      jest.doMock('../../../config', () => ({
        config: {
          ...realConfig,
          get: (key: string) => {
            if (key === 'oauthServer.accountActivity.sampleRate') {
              return sampleRate;
            }
            return realConfig.get(key);
          },
        },
      }));
      for (const [key, value] of Object.entries(tokenRoutesDepMocks)) {
        jest.doMock(key, () => value);
      }
      const mockRecordAccountActivity = jest
        .fn()
        .mockResolvedValue({ missingScopes: [] });
      const oauthDB = {
        ...tokenRoutesArgMocks.oauthDB,
        recordAccountActivity: mockRecordAccountActivity,
      };
      const routes = require('./token')({
        ...tokenRoutesArgMocks,
        oauthDB,
      });
      return { route: routes[0], mockRecordAccountActivity };
    }

    it('invokes oauthDB.recordAccountActivity with the grant userId, clientId, and scopes', async () => {
      const { route, mockRecordAccountActivity } = buildRouteWithSampleRate(1);
      const request = {
        app: {},
        payload: {
          client_id: CLIENT_ID,
          grant_type: 'authorization_code',
          code: CODE_WITH_KEYS,
        },
        emitMetricsEvent: () => {},
      };
      await route.config.handler(request);

      expect(mockRecordAccountActivity).toHaveBeenCalledTimes(1);
      const [userId, clientId, scopes] =
        mockRecordAccountActivity.mock.calls[0];
      expect(userId).toEqual(buf(UID));
      expect(clientId).toEqual(buf(CLIENT_ID));
      expect(Array.isArray(scopes)).toBe(true);
    });

    it('does not invoke recordAccountActivity when sampleRate is 0', async () => {
      const { route, mockRecordAccountActivity } = buildRouteWithSampleRate(0);
      const request = {
        app: {},
        payload: {
          client_id: CLIENT_ID,
          grant_type: 'authorization_code',
          code: CODE_WITH_KEYS,
        },
        emitMetricsEvent: () => {},
      };
      await route.config.handler(request);

      expect(mockRecordAccountActivity).not.toHaveBeenCalled();
    });
  });
});

describe('token exchange grant_type', () => {
  let route: any;

  beforeAll(() => {
    route = tokenRoutes[0];
  });

  describe('input validation', () => {
    function v(req: any) {
      const validationSchema = route.config.validate.payload;
      return validationSchema.validate(req);
    }

    it('requires subject_token when grant_type is token-exchange', () => {
      const res = v({
        client_id: CLIENT_ID,
        grant_type: GRANT_TOKEN_EXCHANGE,
        subject_token_type: SUBJECT_TOKEN_TYPE_REFRESH,
        scope: OAUTH_SCOPE_RELAY,
      });
      joiRequired(res.error, 'subject_token');
    });

    it('requires subject_token_type when grant_type is token-exchange', () => {
      const res = v({
        client_id: CLIENT_ID,
        grant_type: GRANT_TOKEN_EXCHANGE,
        subject_token: REFRESH_TOKEN,
        scope: OAUTH_SCOPE_RELAY,
      });
      joiRequired(res.error, 'subject_token_type');
    });

    it('requires scope when grant_type is token-exchange', () => {
      const res = v({
        client_id: CLIENT_ID,
        grant_type: GRANT_TOKEN_EXCHANGE,
        subject_token: REFRESH_TOKEN,
        subject_token_type: SUBJECT_TOKEN_TYPE_REFRESH,
      });
      joiRequired(res.error, 'scope');
    });

    it('forbids subject_token for other grant types', () => {
      const res = v({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: CODE,
        subject_token: REFRESH_TOKEN,
      });
      joiNotAllowed(res.error, 'subject_token');
    });

    it('forbids subject_token_type for other grant types', () => {
      const res = v({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: CODE,
        subject_token_type: SUBJECT_TOKEN_TYPE_REFRESH,
      });
      joiNotAllowed(res.error, 'subject_token_type');
    });

    it('forbids client_secret for token-exchange', () => {
      const res = v({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: GRANT_TOKEN_EXCHANGE,
        subject_token: REFRESH_TOKEN,
        subject_token_type: SUBJECT_TOKEN_TYPE_REFRESH,
        scope: OAUTH_SCOPE_RELAY,
      });
      joiNotAllowed(res.error, 'client_secret');
    });

    it('accepts valid token exchange request', () => {
      const res = v({
        client_id: CLIENT_ID,
        grant_type: GRANT_TOKEN_EXCHANGE,
        subject_token: REFRESH_TOKEN,
        subject_token_type: SUBJECT_TOKEN_TYPE_REFRESH,
        scope: OAUTH_SCOPE_RELAY,
      });
      expect(res.error).toBeUndefined();
    });
  });

  describe('validateTokenExchangeGrant', () => {
    it('rejects non-existent subject_token', async () => {
      resetAndMockDeps();
      const routes = require('./token')({
        ...tokenRoutesArgMocks,
        oauthDB: {
          ...tokenRoutesArgMocks.oauthDB,
          async getRefreshToken() {
            return null;
          },
        },
      });
      const request = {
        app: {},
        headers: {},
        payload: {
          grant_type: GRANT_TOKEN_EXCHANGE,
          subject_token: REFRESH_TOKEN,
          subject_token_type: SUBJECT_TOKEN_TYPE_REFRESH,
          scope: OAUTH_SCOPE_RELAY,
        },
        emitMetricsEvent: () => {},
      };
      await expect(routes[0].config.handler(request)).rejects.toMatchObject({
        errno: 108, // Invalid token
      });
    });

    it('rejects tokens from non-Firefox clients', async () => {
      const NON_FIREFOX_CLIENT_ID = '123456789a';
      resetAndMockDeps();
      const routes = require('./token')({
        ...tokenRoutesArgMocks,
        oauthDB: {
          ...tokenRoutesArgMocks.oauthDB,
          async getRefreshToken() {
            return {
              userId: buf(UID),
              clientId: buf(NON_FIREFOX_CLIENT_ID),
              tokenId: buf('1234567890abcdef'),
              scope: ScopeSet.fromString(OAUTH_SCOPE_OLD_SYNC),
              profileChangedAt: Date.now(),
            };
          },
        },
      });
      const request = {
        app: {},
        headers: {},
        payload: {
          grant_type: GRANT_TOKEN_EXCHANGE,
          subject_token: REFRESH_TOKEN,
          subject_token_type: SUBJECT_TOKEN_TYPE_REFRESH,
          scope: OAUTH_SCOPE_RELAY,
        },
        emitMetricsEvent: () => {},
      };
      await expect(routes[0].config.handler(request)).rejects.toMatchObject({
        errno: 111, // Unauthorized
        message: expect.stringContaining('not authorized for token exchange'),
      });
    });

    it('returns combined scopes on success', async () => {
      jest.resetModules();
      jest.doMock('../../oauth/assertion', () => async () => true);
      jest.doMock('../../oauth/client', () => ({
        authenticateClient: (_: any, params: any) => ({
          id: buf(params.client_id),
          canGrant: true,
          publicClient: true,
        }),
        clientAuthValidators:
          tokenRoutesDepMocks['../../oauth/client'].clientAuthValidators,
      }));
      jest.doMock('../../oauth/grant', () => ({
        generateTokens: (grant: any) => {
          expect(grant.scope.contains(OAUTH_SCOPE_OLD_SYNC)).toBe(true);
          expect(grant.scope.contains(OAUTH_SCOPE_RELAY)).toBe(true);
          return {
            access_token: 'new_access_token',
            token_type: 'bearer',
            scope: grant.scope.toString(),
            expires_in: 3600,
            refresh_token: 'new_refresh_token',
          };
        },
        validateRequestedGrant: () => ({ offline: true, scope: 'testo' }),
      }));
      jest.doMock('../../oauth/util', () => ({
        makeAssertionJWT: async () => ({}),
      }));
      const routes = require('./token')({
        ...tokenRoutesArgMocks,
        db: {
          ...tokenRoutesArgMocks.db,
          async deviceFromRefreshTokenId() {
            return null;
          },
        },
        oauthDB: {
          ...tokenRoutesArgMocks.oauthDB,
          async getRefreshToken() {
            return {
              userId: buf(UID),
              clientId: buf(FIREFOX_IOS_CLIENT_ID),
              tokenId: buf('1234567890abcdef'),
              scope: ScopeSet.fromString(OAUTH_SCOPE_OLD_SYNC),
              profileChangedAt: Date.now(),
            };
          },
          async removeRefreshToken() {},
        },
      });

      const request: any = {
        app: {},
        headers: {},
        payload: {
          grant_type: GRANT_TOKEN_EXCHANGE,
          subject_token: REFRESH_TOKEN,
          subject_token_type: SUBJECT_TOKEN_TYPE_REFRESH,
          scope: OAUTH_SCOPE_RELAY,
        },
        emitMetricsEvent: () => {},
      };

      const result = await routes[0].config.handler(request);

      expect(result.access_token).toBe('new_access_token');
      expect(result.refresh_token).toBe('new_refresh_token');
      expect(result.scope).toContain(OAUTH_SCOPE_OLD_SYNC);
      expect(result.scope).toContain(OAUTH_SCOPE_RELAY);
    });

    // The subject token has to outlive the handler: it is only retired once the
    // response has passed validation, by the 'response' hook in lib/server.js.
    // Revoking inline strands the client when anything downstream fails.
    it('stashes the subject token for deferred revocation rather than revoking inline', async () => {
      let removeRefreshTokenCalls = 0;
      jest.resetModules();
      jest.doMock('../../oauth/assertion', () => async () => true);
      jest.doMock('../../oauth/client', () => ({
        authenticateClient: (_: any, params: any) => ({
          id: buf(params.client_id),
          canGrant: true,
          publicClient: true,
        }),
        clientAuthValidators:
          tokenRoutesDepMocks['../../oauth/client'].clientAuthValidators,
      }));
      jest.doMock('../../oauth/grant', () => ({
        generateTokens: (grant: any) => ({
          access_token: 'new_access_token',
          token_type: 'bearer',
          scope: grant.scope.toString(),
          expires_in: 3600,
          refresh_token: 'new_refresh_token',
        }),
        validateRequestedGrant: () => ({ offline: true, scope: 'testo' }),
      }));
      jest.doMock('../../oauth/util', () => ({
        makeAssertionJWT: async () => ({}),
      }));
      const routes = require('./token')({
        ...tokenRoutesArgMocks,
        db: {
          ...tokenRoutesArgMocks.db,
          async deviceFromRefreshTokenId() {
            return null;
          },
        },
        oauthDB: {
          ...tokenRoutesArgMocks.oauthDB,
          async getRefreshToken() {
            return {
              userId: buf(UID),
              clientId: buf(FIREFOX_IOS_CLIENT_ID),
              tokenId: buf('1234567890abcdef'),
              scope: ScopeSet.fromString(OAUTH_SCOPE_OLD_SYNC),
              profileChangedAt: Date.now(),
            };
          },
          async removeRefreshToken() {
            removeRefreshTokenCalls += 1;
          },
        },
      });

      const request: any = {
        app: {},
        headers: {},
        payload: {
          grant_type: GRANT_TOKEN_EXCHANGE,
          subject_token: REFRESH_TOKEN,
          subject_token_type: SUBJECT_TOKEN_TYPE_REFRESH,
          scope: OAUTH_SCOPE_RELAY,
        },
        emitMetricsEvent: () => {},
      };

      await routes[0].config.handler(request);

      expect(removeRefreshTokenCalls).toBe(0);
      expect(hex(request.app.pendingRefreshTokenRevocation.tokenId)).toBe(
        '1234567890abcdef'
      );
    });
  });

  describe('rate limiting', () => {
    function exchangeRequest() {
      return {
        app: {},
        headers: {},
        payload: {
          grant_type: GRANT_TOKEN_EXCHANGE,
          subject_token: REFRESH_TOKEN,
          subject_token_type: SUBJECT_TOKEN_TYPE_REFRESH,
          scope: OAUTH_SCOPE_RELAY,
        },
        emitMetricsEvent: () => {},
      };
    }

    it('throttles on the hash of the subject_token', async () => {
      resetAndMockDeps();
      const routes = require('./token')(tokenRoutesArgMocks);
      const request = exchangeRequest();

      await expect(routes[0].config.handler(request)).rejects.toMatchObject({
        errno: 108, // the stub subject_token does not resolve
      });

      expect(mockCustoms.checkToken).toHaveBeenCalledWith(
        request,
        'tokenExchange',
        SUBJECT_TOKEN_HASH
      );
    });

    it('rejects a throttled exchange without reading the oauth db', async () => {
      resetAndMockDeps();
      const getRefreshToken = jest.fn();
      const routes = require('./token')({
        ...tokenRoutesArgMocks,
        customs: {
          checkToken: jest
            .fn()
            .mockRejectedValue(
              AuthError.tooManyRequests(900_000, 'in 15 minutes')
            ),
        },
        oauthDB: { ...tokenRoutesArgMocks.oauthDB, getRefreshToken },
      });

      await expect(
        routes[0].config.handler(exchangeRequest())
      ).rejects.toMatchObject({ errno: 114 });

      expect(getRefreshToken).not.toHaveBeenCalled();
    });
  });
});

describe('/oauth/token POST', () => {
  // tokenRoutes[1] is the POST /oauth/token route (tokenRoutes[0] is /token).
  function v(req: any) {
    const oauthTokenRoute = tokenRoutes[1];
    return oauthTokenRoute.config.validate.payload.validate(req);
  }

  describe('exclude_dau input validation', () => {
    it('accepts exclude_dau=true for the authorization_code grant', () => {
      const res = v({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: CODE,
        exclude_dau: true,
      });
      expect(res.error).toBeUndefined();
      expect(res.value.exclude_dau).toBe(true);
    });

    it('accepts exclude_dau=true for the fxa-credentials grant', () => {
      const res = v({
        client_id: CLIENT_ID,
        grant_type: 'fxa-credentials',
        exclude_dau: true,
      });
      expect(res.error).toBeUndefined();
      expect(res.value.exclude_dau).toBe(true);
    });

    it('defaults exclude_dau to false when omitted', () => {
      const res = v({
        client_id: CLIENT_ID,
        grant_type: 'fxa-credentials',
      });
      expect(res.error).toBeUndefined();
      expect(res.value.exclude_dau).toBe(false);
    });
  });

  // Firefox redeems a pairing/sign-in code here, sending
  // {grant_type, code, client_id, code_verifier} (FxAccountsClient.oauthToken).
  // It holds the verifier in the parent process and never gives it to the web
  // page, so the xor on this alternative is what makes a redemption without a
  // known verifier fail: a public client cannot substitute a client_secret.
  describe('authorization_code grant requires exactly one client credential', () => {
    it('accepts a code_verifier alone, the shape Firefox sends', () => {
      const res = v({
        client_id: CLIENT_ID,
        grant_type: 'authorization_code',
        code: CODE,
        code_verifier: PKCE_CODE_VERIFIER,
      });
      expect(res.error).toBeUndefined();
      expect(res.value.code_verifier).toBe(PKCE_CODE_VERIFIER);
    });

    it('rejects a code redemption carrying neither code_verifier nor client_secret', () => {
      const res = v({
        client_id: CLIENT_ID,
        grant_type: 'authorization_code',
        code: CODE,
      });
      const detail = authorizationCodeAlternativeError(res.error);
      expect(detail.type).toBe('object.missing');
      expect(detail.context.peers).toEqual(['client_secret', 'code_verifier']);
    });

    it('rejects a code redemption carrying both code_verifier and client_secret', () => {
      const res = v({
        client_id: CLIENT_ID,
        grant_type: 'authorization_code',
        code: CODE,
        code_verifier: PKCE_CODE_VERIFIER,
        client_secret: CLIENT_SECRET,
      });
      const detail = authorizationCodeAlternativeError(res.error);
      expect(detail.type).toBe('object.xor');
      expect(detail.context.present).toEqual([
        'client_secret',
        'code_verifier',
      ]);
    });
  });

  describe('Glean metrics', () => {
    it('fires the token created event with exclude_dau false by default', async () => {
      const request = {
        app: {},
        auth: { credentials: { uid: 'abc' } },
        headers: {},
        payload: {
          client_id: CLIENT_ID,
          grant_type: 'fxa-credentials',
          access_type: 'offline',
        },
        emitMetricsEvent: async () => {},
      };
      await tokenRoutes[1].handler(request);
      expect(mockGlean.oauth.tokenCreated).toHaveBeenCalledTimes(1);
      expect(mockGlean.oauth.tokenCreated).toHaveBeenCalledWith(
        request,
        expect.objectContaining({
          reason: 'fxa-credentials',
          scopes: 'testo',
          excludeDau: false,
        })
      );
    });

    it('tags the token created event with excludeDau when exclude_dau is set', async () => {
      const request = {
        app: {},
        auth: { credentials: { uid: 'abc' } },
        headers: {},
        payload: {
          client_id: CLIENT_ID,
          grant_type: 'fxa-credentials',
          access_type: 'offline',
          exclude_dau: true,
        },
        emitMetricsEvent: async () => {},
      };
      await tokenRoutes[1].handler(request);
      expect(mockGlean.oauth.tokenCreated).toHaveBeenCalledTimes(1);
      expect(mockGlean.oauth.tokenCreated).toHaveBeenCalledWith(
        request,
        expect.objectContaining({
          reason: 'fxa-credentials',
          scopes: 'testo',
          excludeDau: true,
        })
      );
    });
  });

  describe('update session last access time', () => {
    beforeEach(() => {
      mockDb.touchSessionToken.mockClear();
    });

    it('updates last access time of a session', async () => {
      const sessionToken = { uid: 'abc' };
      const request = {
        app: {},
        auth: { credentials: sessionToken },
        headers: {},
        payload: {
          client_id: CLIENT_ID,
          grant_type: 'fxa-credentials',
        },
        emitMetricsEvent: async () => {},
      };
      await tokenRoutes[1].handler(request);
      expect(mockDb.touchSessionToken).toHaveBeenCalledTimes(1);
      expect(mockDb.touchSessionToken).toHaveBeenCalledWith(
        sessionToken,
        {},
        true
      );
    });

    it('does not update when configured so', async () => {
      const realConfig = require('../../../config').config;
      jest.resetModules();
      jest.doMock('../../../config', () => ({
        config: {
          ...realConfig,
          get: (key: string) => {
            if (key === 'lastAccessTimeUpdates.onOAuthTokenCreation') {
              return false;
            }
            return realConfig.get(key);
          },
        },
      }));
      for (const [key, value] of Object.entries(tokenRoutesDepMocks)) {
        jest.doMock(key, () => value);
      }
      const routes = require('./token')(tokenRoutesArgMocks);
      const sessionToken = { uid: 'abc' };
      const request = {
        app: {},
        auth: { credentials: sessionToken },
        headers: {},
        payload: {
          client_id: CLIENT_ID,
          grant_type: 'fxa-credentials',
        },
        emitMetricsEvent: async () => {},
      };
      await routes[1].handler(request);
      expect(mockDb.touchSessionToken).not.toHaveBeenCalled();
    });
  });

  describe('token exchange via /oauth/token', () => {
    const ScopeSet = require('fxa-shared').oauth.scopes;
    const MOCK_DEVICE_ID = 'device1234567890abcdef';

    it('handles token exchange and passes existingDeviceId to newTokenNotification', async () => {
      const PROFILE_SCOPE = 'profile';
      const newTokenNotificationStub = jest.fn().mockResolvedValue(undefined);
      const sessionTokenStub = jest
        .fn()
        .mockRejectedValue(new Error('should not be called'));
      jest.resetModules();
      jest.doMock('../../oauth/assertion', () => async () => true);
      jest.doMock(
        '../../oauth/client',
        () => tokenRoutesDepMocks['../../oauth/client']
      );
      jest.doMock('../../oauth/grant', () => ({
        generateTokens: (grant: any) => ({
          access_token: 'new_access_token',
          token_type: 'bearer',
          scope: grant.scope.toString(),
          expires_in: 3600,
          refresh_token: 'new_refresh_token',
        }),
        validateRequestedGrant: () => ({ offline: true, scope: 'testo' }),
      }));
      jest.doMock(
        '../../oauth/util',
        () => tokenRoutesDepMocks['../../oauth/util']
      );
      jest.doMock('../utils/oauth', () => ({
        newTokenNotification: newTokenNotificationStub,
      }));
      jest.doMock('../../oauth/token', () => ({
        verify: jest.fn().mockResolvedValue({ user: UID }),
      }));
      const routes = require('./token')({
        ...tokenRoutesArgMocks,
        db: {
          ...tokenRoutesArgMocks.db,
          sessionToken: sessionTokenStub,
          async deviceFromRefreshTokenId() {
            return { id: MOCK_DEVICE_ID };
          },
        },
        oauthDB: {
          ...tokenRoutesArgMocks.oauthDB,
          async getRefreshToken() {
            return {
              userId: buf(UID),
              clientId: buf(FIREFOX_IOS_CLIENT_ID),
              tokenId: buf('1234567890abcdef'),
              scope: ScopeSet.fromString(
                `${OAUTH_SCOPE_OLD_SYNC} ${PROFILE_SCOPE} ${OAUTH_SCOPE_SESSION_TOKEN}`
              ),
              profileChangedAt: Date.now(),
            };
          },
          async removeRefreshToken() {},
        },
      });

      const request = {
        app: {},
        auth: { credentials: null },
        headers: {},
        payload: {
          grant_type: GRANT_TOKEN_EXCHANGE,
          subject_token: REFRESH_TOKEN,
          subject_token_type: SUBJECT_TOKEN_TYPE_REFRESH,
          scope: OAUTH_SCOPE_RELAY,
        },
        emitMetricsEvent: async () => {},
      };

      const result = await routes[1].handler(request);

      expect(result.access_token).toBe('new_access_token');
      expect(result.refresh_token).toBe('new_refresh_token');
      expect(result.scope).toContain(OAUTH_SCOPE_OLD_SYNC);
      expect(result.scope).toContain(PROFILE_SCOPE);
      expect(result.scope).toContain(OAUTH_SCOPE_RELAY);
      expect(result._clientId).toBeUndefined();
      expect(result._existingDeviceId).toBeUndefined();
      expect(newTokenNotificationStub).toHaveBeenCalledTimes(1);
      expect(newTokenNotificationStub).toHaveBeenNthCalledWith(
        1,
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        {
          skipEmail: true,
          existingDeviceId: MOCK_DEVICE_ID,
          clientId: FIREFOX_IOS_CLIENT_ID,
          uid: 'eaf0',
        }
      );
      expect(sessionTokenStub).not.toHaveBeenCalled();
    });

    it('handles token exchange when no existing device is found (existingDeviceId is undefined)', async () => {
      const PROFILE_SCOPE = 'profile';
      const newTokenNotificationStub = jest.fn().mockResolvedValue(undefined);
      jest.resetModules();
      jest.doMock('../../oauth/assertion', () => async () => true);
      jest.doMock(
        '../../oauth/client',
        () => tokenRoutesDepMocks['../../oauth/client']
      );
      jest.doMock('../../oauth/grant', () => ({
        generateTokens: (grant: any) => ({
          access_token: 'new_access_token',
          token_type: 'bearer',
          scope: grant.scope.toString(),
          expires_in: 3600,
          refresh_token: 'new_refresh_token',
        }),
        validateRequestedGrant: () => ({ offline: true, scope: 'testo' }),
      }));
      jest.doMock(
        '../../oauth/util',
        () => tokenRoutesDepMocks['../../oauth/util']
      );
      jest.doMock('../utils/oauth', () => ({
        newTokenNotification: newTokenNotificationStub,
      }));
      jest.doMock('../../oauth/token', () => ({
        verify: jest.fn().mockResolvedValue({ user: UID }),
      }));
      const routes = require('./token')({
        ...tokenRoutesArgMocks,
        db: {
          ...tokenRoutesArgMocks.db,
          async deviceFromRefreshTokenId() {
            return null;
          },
        },
        oauthDB: {
          ...tokenRoutesArgMocks.oauthDB,
          async getRefreshToken() {
            return {
              userId: buf(UID),
              clientId: buf(FIREFOX_IOS_CLIENT_ID),
              tokenId: buf('1234567890abcdef'),
              scope: ScopeSet.fromString(
                `${OAUTH_SCOPE_OLD_SYNC} ${PROFILE_SCOPE}`
              ),
              profileChangedAt: Date.now(),
            };
          },
          async removeRefreshToken() {},
        },
      });

      const request = {
        app: {},
        auth: { credentials: null },
        headers: {},
        payload: {
          grant_type: GRANT_TOKEN_EXCHANGE,
          subject_token: REFRESH_TOKEN,
          subject_token_type: SUBJECT_TOKEN_TYPE_REFRESH,
          scope: OAUTH_SCOPE_RELAY,
        },
        emitMetricsEvent: async () => {},
      };

      const result = await routes[1].handler(request);

      expect(result.access_token).toBe('new_access_token');
      expect(result.refresh_token).toBe('new_refresh_token');
      expect(result._clientId).toBeUndefined();
      expect(result._existingDeviceId).toBeUndefined();
      expect(newTokenNotificationStub).toHaveBeenCalledTimes(1);
      expect(newTokenNotificationStub).toHaveBeenNthCalledWith(
        1,
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        {
          skipEmail: true,
          existingDeviceId: undefined,
          clientId: FIREFOX_IOS_CLIENT_ID,
          uid: 'eaf0',
        }
      );
    });
  });

  describe('validateTokenExchangeGrant decision matrix', () => {
    // Builds a token-exchange route whose oauthDB.hasConsentForExchange
    // returns a caller-provided decision per scope value, then invokes the
    // POST handler. The subject refresh token is a Firefox iOS client so
    // TOKEN_EXCHANGE_ALLOWED_CLIENT_IDS lets the request past the
    // pre-check and into the decision loop.
    async function runExchange(decisions: Record<string, any>, scope: string) {
      mockStatsD.increment.mockClear();
      jest.resetModules();
      jest.doMock('../../oauth/assertion', () => async () => true);
      jest.doMock(
        '../../oauth/client',
        () => tokenRoutesDepMocks['../../oauth/client']
      );
      jest.doMock('../../oauth/grant', () => ({
        generateTokens: (grant: any) => ({
          access_token: 'at',
          token_type: 'bearer',
          scope: grant.scope.toString(),
          expires_in: 3600,
          refresh_token: 'rt',
        }),
        validateRequestedGrant: () => ({ offline: true, scope: 'testo' }),
      }));
      jest.doMock(
        '../../oauth/util',
        () => tokenRoutesDepMocks['../../oauth/util']
      );
      jest.doMock('../utils/oauth', () => ({
        newTokenNotification: async () => {},
      }));
      jest.doMock('../../oauth/token', () => ({
        verify: jest.fn().mockResolvedValue({ user: UID }),
      }));

      const routes = require('./token')({
        ...tokenRoutesArgMocks,
        db: {
          ...tokenRoutesArgMocks.db,
          async deviceFromRefreshTokenId() {
            return null;
          },
        },
        oauthDB: {
          ...tokenRoutesArgMocks.oauthDB,
          async getRefreshToken() {
            return {
              userId: buf(UID),
              clientId: buf(FIREFOX_IOS_CLIENT_ID),
              tokenId: buf('1234567890abcdef'),
              scope: ScopeSet.fromString(scope),
              profileChangedAt: Date.now(),
            };
          },
          async removeRefreshToken() {},
          async hasConsentForExchange(_uid: any, value: string) {
            return decisions[value] ?? { result: 'fall-through' };
          },
        },
      });

      const request = {
        app: {},
        auth: { credentials: null },
        headers: {},
        payload: {
          grant_type: GRANT_TOKEN_EXCHANGE,
          subject_token: REFRESH_TOKEN,
          subject_token_type: SUBJECT_TOKEN_TYPE_REFRESH,
          scope,
        },
        emitMetricsEvent: async () => {},
      };
      return routes[1].handler(request);
    }

    function resolutionTagsFor(service: string) {
      return mockStatsD.increment.mock.calls.filter(
        ([metric, tags]: any) =>
          metric === 'oauth.token_exchange.resolution' &&
          tags?.service === service
      );
    }

    it('grants and records "granted" when decision is allowed', async () => {
      const result = await runExchange(
        { [OAUTH_SCOPE_RELAY]: { result: 'allowed', service: 'relay' } },
        OAUTH_SCOPE_RELAY
      );
      expect(result.access_token).toBe('at');
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'oauth.token_exchange.resolution',
        { service: 'relay', outcome: 'granted' }
      );
    });

    it('grants and records "granted_relay_bypass" when decision is bypass', async () => {
      const result = await runExchange(
        { [OAUTH_SCOPE_RELAY]: { result: 'bypass', service: 'relay' } },
        OAUTH_SCOPE_RELAY
      );
      expect(result.access_token).toBe('at');
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'oauth.token_exchange.resolution',
        { service: 'relay', outcome: 'granted_relay_bypass' }
      );
    });

    it('rejects with "rejected_silent_disallowed" when service is deny-listed', async () => {
      await expect(
        runExchange(
          {
            [OAUTH_SCOPE_OLD_SYNC]: {
              result: 'denied',
              service: 'sync',
              reason: 'silent-disallowed',
            },
          },
          OAUTH_SCOPE_OLD_SYNC
        )
      ).rejects.toMatchObject({ output: { statusCode: 403 } });
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'oauth.token_exchange.resolution',
        { service: 'sync', outcome: 'rejected_silent_disallowed' }
      );
    });

    it('rejects with "rejected_no_consent" when mapped service has no consent row', async () => {
      const SMARTWINDOW = 'https://identity.mozilla.com/apps/smartwindow';
      await expect(
        runExchange(
          {
            [SMARTWINDOW]: {
              result: 'denied',
              service: 'smartwindow',
              reason: 'no-consent',
            },
          },
          SMARTWINDOW
        )
      ).rejects.toMatchObject({ output: { statusCode: 403 } });
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'oauth.token_exchange.resolution',
        { service: 'smartwindow', outcome: 'rejected_no_consent' }
      );
    });

    it('grants and records "granted_fall_through" when scope is unmapped', async () => {
      const PROFILE_SCOPE = 'profile';
      const result = await runExchange(
        { [PROFILE_SCOPE]: { result: 'fall-through' } },
        PROFILE_SCOPE
      );
      expect(result.access_token).toBe('at');
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'oauth.token_exchange.resolution',
        { service: 'legacy', outcome: 'granted_fall_through' }
      );
    });

    it('rejects fall-through scopes that are not in the subject_token client allowedScopes', async () => {
      const UNCONFIGURED = 'https://identity.mozilla.com/apps/never-seen';
      mockStatsD.increment.mockClear();
      jest.resetModules();
      jest.doMock('../../oauth/assertion', () => async () => true);
      jest.doMock(
        '../../oauth/client',
        () => tokenRoutesDepMocks['../../oauth/client']
      );
      jest.doMock('../../oauth/grant', () => ({
        generateTokens: (grant: any) => ({
          access_token: 'at',
          scope: grant.scope.toString(),
        }),
        validateRequestedGrant: () => ({ offline: true, scope: 'testo' }),
      }));
      jest.doMock(
        '../../oauth/util',
        () => tokenRoutesDepMocks['../../oauth/util']
      );
      jest.doMock('../utils/oauth', () => ({
        newTokenNotification: async () => {},
      }));
      jest.doMock('../../oauth/token', () => ({
        verify: jest.fn().mockResolvedValue({ user: UID }),
      }));

      const routes = require('./token')({
        ...tokenRoutesArgMocks,
        db: {
          ...tokenRoutesArgMocks.db,
          async deviceFromRefreshTokenId() {
            return null;
          },
        },
        oauthDB: {
          ...tokenRoutesArgMocks.oauthDB,
          async getRefreshToken() {
            return {
              userId: buf(UID),
              clientId: buf(FIREFOX_IOS_CLIENT_ID),
              tokenId: buf('1234567890abcdef'),
              scope: ScopeSet.fromString(UNCONFIGURED),
              profileChangedAt: Date.now(),
            };
          },
          async removeRefreshToken() {},
          async hasConsentForExchange() {
            return { result: 'fall-through' };
          },
          // Restrictive client: only oldsync is permitted.
          async getClient() {
            return {
              allowedScopes: 'https://identity.mozilla.com/apps/oldsync',
            };
          },
        },
      });

      await expect(
        routes[1].handler({
          app: {},
          auth: { credentials: null },
          headers: {},
          payload: {
            grant_type: GRANT_TOKEN_EXCHANGE,
            subject_token: REFRESH_TOKEN,
            subject_token_type: SUBJECT_TOKEN_TYPE_REFRESH,
            scope: UNCONFIGURED,
          },
          emitMetricsEvent: async () => {},
        })
      ).rejects.toMatchObject({ output: { statusCode: 403 } });

      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'oauth.token_exchange.resolution',
        { service: 'legacy', outcome: 'rejected_not_in_allowed_scopes' }
      );
    });

    it('fails closed with "rejected_unknown_decision" on an unknown result shape', async () => {
      await expect(
        runExchange(
          { [OAUTH_SCOPE_RELAY]: { result: 'wat', service: 'relay' } },
          OAUTH_SCOPE_RELAY
        )
      ).rejects.toMatchObject({ output: { statusCode: 403 } });
      expect(mockStatsD.increment).toHaveBeenCalledWith(
        'oauth.token_exchange.resolution',
        { service: 'relay', outcome: 'rejected_unknown_decision' }
      );
    });

    it('emits one resolution metric per service even when several scopes share it', async () => {
      // Two unrelated mozilla.com scopes that the test stub claims both
      // resolve to the same service. payload.scope is passed as a
      // ScopeSet here because validateTokenExchangeGrant calls
      // subjectToken.scope.union(requestedScope) directly, and the
      // ScopeSet coerce path does not split a raw whitespace-separated
      // string. In production the route's Joi schema does the coercion.
      const scopeSet = ScopeSet.fromString(
        `${OAUTH_SCOPE_RELAY} ${OAUTH_SCOPE_OLD_SYNC}`
      );
      mockStatsD.increment.mockClear();
      jest.resetModules();
      jest.doMock('../../oauth/assertion', () => async () => true);
      jest.doMock(
        '../../oauth/client',
        () => tokenRoutesDepMocks['../../oauth/client']
      );
      jest.doMock('../../oauth/grant', () => ({
        generateTokens: (grant: any) => ({
          access_token: 'at',
          token_type: 'bearer',
          scope: grant.scope.toString(),
        }),
        validateRequestedGrant: () => ({ offline: true, scope: 'testo' }),
      }));
      jest.doMock(
        '../../oauth/util',
        () => tokenRoutesDepMocks['../../oauth/util']
      );
      jest.doMock('../utils/oauth', () => ({
        newTokenNotification: async () => {},
      }));
      jest.doMock('../../oauth/token', () => ({
        verify: jest.fn().mockResolvedValue({ user: UID }),
      }));

      const routes = require('./token')({
        ...tokenRoutesArgMocks,
        db: {
          ...tokenRoutesArgMocks.db,
          async deviceFromRefreshTokenId() {
            return null;
          },
        },
        oauthDB: {
          ...tokenRoutesArgMocks.oauthDB,
          async getRefreshToken() {
            return {
              userId: buf(UID),
              clientId: buf(FIREFOX_IOS_CLIENT_ID),
              tokenId: buf('1234567890abcdef'),
              scope: scopeSet,
              profileChangedAt: Date.now(),
            };
          },
          async removeRefreshToken() {},
          async hasConsentForExchange() {
            return { result: 'allowed', service: 'relay' };
          },
        },
      });

      await routes[1].handler({
        app: {},
        auth: { credentials: null },
        headers: {},
        payload: {
          grant_type: GRANT_TOKEN_EXCHANGE,
          subject_token: REFRESH_TOKEN,
          subject_token_type: SUBJECT_TOKEN_TYPE_REFRESH,
          scope: scopeSet,
        },
        emitMetricsEvent: async () => {},
      });

      expect(resolutionTagsFor('relay')).toHaveLength(1);
    });

    it('passes through to the rest of the handler when all scopes are granted', async () => {
      // fall-through for an unmapped scope must not short-circuit; the
      // request still returns a real token from generateTokens.
      const result = await runExchange(
        { [OAUTH_SCOPE_RELAY]: { result: 'fall-through' } },
        OAUTH_SCOPE_RELAY
      );
      expect(result.refresh_token).toBe('rt');
    });
  });

  describe('fxa-credentials with reason=token_migration', () => {
    it('calls newTokenNotification with skipEmail: true when reason is token_migration', async () => {
      const newTokenNotificationStub = jest.fn().mockResolvedValue(undefined);
      const sessionTokenStub = jest
        .fn()
        .mockRejectedValue(new Error('should not be called'));
      jest.resetModules();
      jest.doMock('../../oauth/assertion', () => async () => true);
      jest.doMock(
        '../../oauth/client',
        () => tokenRoutesDepMocks['../../oauth/client']
      );
      jest.doMock('../../oauth/grant', () => ({
        generateTokens: tokenRoutesDepMocks['../../oauth/grant'].generateTokens,
        validateRequestedGrant: () => ({
          offline: true,
          scope: OAUTH_SCOPE_SESSION_TOKEN,
          clientId: buf(CLIENT_ID),
        }),
      }));
      jest.doMock(
        '../../oauth/util',
        () => tokenRoutesDepMocks['../../oauth/util']
      );
      jest.doMock('../utils/oauth', () => ({
        newTokenNotification: newTokenNotificationStub,
      }));
      const routes = require('./token')({
        ...tokenRoutesArgMocks,
        db: {
          ...tokenRoutesArgMocks.db,
          sessionToken: sessionTokenStub,
        },
      });

      const request = {
        app: {},
        auth: { credentials: { uid: UID } },
        headers: {},
        payload: {
          grant_type: 'fxa-credentials',
          client_id: CLIENT_ID,
          scope: 'profile',
          access_type: 'offline',
          reason: 'token_migration',
        },
        emitMetricsEvent: async () => {},
      };

      await routes[1].handler(request);
      expect(newTokenNotificationStub).toHaveBeenCalledTimes(1);
      expect(newTokenNotificationStub).toHaveBeenNthCalledWith(
        1,
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        {
          skipEmail: true,
          existingDeviceId: undefined,
          clientId: CLIENT_ID,
        }
      );
      expect(sessionTokenStub).not.toHaveBeenCalled();
    });

    it('calls newTokenNotification with skipEmail: false when reason is not provided', async () => {
      const newTokenNotificationStub = jest.fn().mockResolvedValue(undefined);
      jest.resetModules();
      jest.doMock('../../oauth/assertion', () => async () => true);
      jest.doMock(
        '../../oauth/client',
        () => tokenRoutesDepMocks['../../oauth/client']
      );
      jest.doMock('../../oauth/grant', () => ({
        generateTokens: tokenRoutesDepMocks['../../oauth/grant'].generateTokens,
        validateRequestedGrant: () => ({
          offline: true,
          scope: 'testo',
          clientId: buf(CLIENT_ID),
        }),
      }));
      jest.doMock(
        '../../oauth/util',
        () => tokenRoutesDepMocks['../../oauth/util']
      );
      jest.doMock('../utils/oauth', () => ({
        newTokenNotification: newTokenNotificationStub,
      }));
      const routes = require('./token')(tokenRoutesArgMocks);

      const request = {
        app: {},
        auth: { credentials: { uid: UID } },
        headers: {},
        payload: {
          grant_type: 'fxa-credentials',
          client_id: CLIENT_ID,
          scope: 'profile',
          access_type: 'offline',
        },
        emitMetricsEvent: async () => {},
      };

      await routes[1].handler(request);
      expect(newTokenNotificationStub).toHaveBeenCalledTimes(1);
      expect(newTokenNotificationStub).toHaveBeenNthCalledWith(
        1,
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        {
          skipEmail: false,
          existingDeviceId: undefined,
          clientId: CLIENT_ID,
        }
      );
    });
  });
});

// FXA-14263: /oauth/authorization is the only request that sees `service=`, so
// it decides whether a Desktop sign-in counts toward Sync DAU and leaves the
// answer in Redis against the code's hash. Here we assert the read side.
// Read side of the FXA-14263 carry: /oauth/authorization decides, leaves the
// answer in Redis against the code's hash, and the redemption picks it up.
describe('exclude_dau carried on the authorization code', () => {
  const EXPECTED_KEY = excludeDauCacheKey(
    encrypt.hash(CODE_WITH_KEYS).toString('hex')
  );

  function codeRequest(payloadOverrides: Record<string, unknown> = {}) {
    return {
      app: {},
      // Code redemption is client-authenticated; no session token rides along.
      auth: { credentials: undefined },
      headers: {},
      payload: {
        client_id: FIREFOX_DESKTOP_CLIENT_ID,
        grant_type: 'authorization_code',
        code: CODE_WITH_KEYS,
        ...payloadOverrides,
      },
      emitMetricsEvent: () => {},
    };
  }

  // The route short-circuits before Redis unless the code is a Firefox Desktop
  // one carrying the Sync scope, so the default code fixture has to be that.
  function buildOauthDB(codeOverrides: Record<string, unknown> = {}) {
    return {
      ...tokenRoutesArgMocks.oauthDB,
      async getCode() {
        return {
          userId: buf(UID),
          clientId: buf(FIREFOX_DESKTOP_CLIENT_ID),
          createdAt: Date.now(),
          scope: ScopeSet.fromArray([OAUTH_SCOPE_OLD_SYNC, 'profile']),
          ...codeOverrides,
        };
      },
      getCanonicalScopeForService: (service: string) =>
        service === 'sync' ? OAUTH_SCOPE_OLD_SYNC : undefined,
    };
  }

  async function run({
    redis,
    oauthDB = buildOauthDB(),
    payload,
  }: {
    redis?: { get: jest.Mock };
    oauthDB?: Record<string, any>;
    payload?: Record<string, unknown>;
  }) {
    resetAndMockDeps();
    // The shared generateTokens stub passes `scope` through untouched, but the
    // real one emits `access.scope.toString()`. These tests carry a real
    // ScopeSet on the code, so match production or the route throws.
    jest.doMock('../../oauth/grant', () => ({
      ...tokenRoutesDepMocks['../../oauth/grant'],
      generateTokens: (grant: any) => {
        const t = { ...grant, scope: grant.scope.toString() } as any;
        if (grant.offline) {
          t.refresh_token = '00ff';
        }
        return t;
      },
    }));
    const glean = { oauth: { tokenCreated: jest.fn() } };
    const routes = require('./token')({
      ...tokenRoutesArgMocks,
      oauthDB,
      glean,
      authServerCacheRedis: redis,
    });
    const request = codeRequest(payload);
    await routes[1].handler(request);
    return { glean, request };
  }

  it('tags the token created event when the code was flagged', async () => {
    const redis = { get: jest.fn().mockResolvedValue('1') };

    const { glean, request } = await run({ redis });

    expect(redis.get).toHaveBeenCalledWith(EXPECTED_KEY);
    expect(glean.oauth.tokenCreated).toHaveBeenCalledWith(
      request,
      expect.objectContaining({
        reason: 'authorization_code',
        scopes: ScopeSet.fromArray([
          OAUTH_SCOPE_OLD_SYNC,
          'profile',
        ]).toString(),
        excludeDau: true,
      })
    );
  });

  it('does not tag the event when no flag was recorded for the code', async () => {
    const redis = { get: jest.fn().mockResolvedValue(null) };

    const { glean, request } = await run({ redis });

    expect(redis.get).toHaveBeenCalledWith(EXPECTED_KEY);
    expect(glean.oauth.tokenCreated).toHaveBeenCalledWith(
      request,
      expect.objectContaining({ excludeDau: false })
    );
  });

  it('counts the token and reports the failure when Redis is unavailable', async () => {
    const redis = { get: jest.fn().mockRejectedValue(new Error('no redis')) };

    const { glean, request } = await run({ redis });

    expect(glean.oauth.tokenCreated).toHaveBeenCalledWith(
      request,
      expect.objectContaining({ excludeDau: false })
    );
    // The only signal that the bandaid has silently stopped working.
    expect(mockStatsD.increment).toHaveBeenCalledWith(
      'oauth.excludeDau.readFailed'
    );
  });

  it('counts the token when no cache is wired up', async () => {
    const { glean, request } = await run({ redis: undefined });

    expect(glean.oauth.tokenCreated).toHaveBeenCalledWith(
      request,
      expect.objectContaining({ excludeDau: false })
    );
  });

  it('keeps a client-supplied exclude_dau even when nothing was cached', async () => {
    const redis = { get: jest.fn().mockResolvedValue(null) };

    const { glean, request } = await run({
      redis,
      payload: { exclude_dau: true },
    });

    expect(redis.get).toHaveBeenCalled();
    expect(glean.oauth.tokenCreated).toHaveBeenCalledWith(
      request,
      expect.objectContaining({ excludeDau: true })
    );
  });

  describe('skips Redis when the code cannot carry a flag', () => {
    it('does not read for a code without the Sync scope', async () => {
      const redis = { get: jest.fn() };

      await run({
        redis,
        oauthDB: buildOauthDB({ scope: ScopeSet.fromArray(['profile']) }),
      });

      expect(redis.get).not.toHaveBeenCalled();
    });

    it('does not read for a non-Desktop client', async () => {
      const redis = { get: jest.fn() };

      await run({
        redis,
        oauthDB: buildOauthDB({ clientId: buf(FIREFOX_IOS_CLIENT_ID) }),
        payload: { client_id: FIREFOX_IOS_CLIENT_ID },
      });

      expect(redis.get).not.toHaveBeenCalled();
    });
  });
});

// The handler is the last thing between a code and a token, so the gate is
// covered by driving it directly. Two of its branches are left out on purpose:
// a stored method other than S256, and a verifier for a challenge-less code.
// Neither can arrive over HTTP, because /authorization pins the method to S256
// and writes a challenge if and only if the client is public.
describe('PKCE gate on the authorization_code grant', () => {
  // Matches the route's pkceHash(): sha256 of the verifier, URL-safe base64,
  // unpadded. oauth/util's base64URLEncode is a Buffer.toString('base64url').
  const CODE_CHALLENGE = crypto
    .createHash('sha256')
    .update(PKCE_CODE_VERIFIER)
    .digest('base64url');

  const CHALLENGED_CODE = {
    codeChallenge: CODE_CHALLENGE,
    codeChallengeMethod: 'S256',
  };

  async function redeem(
    codeOverrides: Record<string, unknown>,
    payloadOverrides: Record<string, unknown> = {}
  ) {
    resetAndMockDeps();
    // The shared oauth/util stub only carries makeAssertionJWT, but computing a
    // pkceHash needs the real base64URLEncode.
    jest.doMock('../../oauth/util', () => ({
      ...jest.requireActual('../../oauth/util'),
      makeAssertionJWT: async () => ({}),
    }));
    // The code row carries a real ScopeSet, so match what production's
    // generateTokens emits or the route throws while building the response.
    jest.doMock('../../oauth/grant', () => ({
      ...tokenRoutesDepMocks['../../oauth/grant'],
      generateTokens: (grant: any) => ({
        ...grant,
        scope: grant.scope.toString(),
      }),
    }));
    // The gate throws before the code is consumed, so removeCode having been
    // called is the observable signal that a redemption cleared it.
    const removeCode = jest.fn().mockResolvedValue(null);
    const routes = require('./token')({
      ...tokenRoutesArgMocks,
      oauthDB: {
        ...tokenRoutesArgMocks.oauthDB,
        removeCode,
        async getCode() {
          return {
            userId: buf(UID),
            clientId: buf(CLIENT_ID),
            createdAt: Date.now(),
            scope: ScopeSet.fromArray(['profile']),
            ...codeOverrides,
          };
        },
      },
    });
    await routes[1].handler({
      app: {},
      auth: { credentials: undefined },
      headers: {},
      payload: {
        client_id: CLIENT_ID,
        grant_type: 'authorization_code',
        code: CODE,
        ...payloadOverrides,
      },
      emitMetricsEvent: () => {},
    });
    return { removeCode };
  }

  it('consumes the code when the verifier matches the stored challenge', async () => {
    const { removeCode } = await redeem(CHALLENGED_CODE, {
      code_verifier: PKCE_CODE_VERIFIER,
    });

    expect(removeCode).toHaveBeenCalledTimes(1);
  });

  it('rejects a redemption with no verifier when the code carries a challenge', async () => {
    await expect(redeem(CHALLENGED_CODE)).rejects.toMatchObject({
      errno: OAUTH_ERRNO.MISSING_PKCE_PARAMETERS,
    });
  });

  it('rejects a verifier that does not hash to the stored challenge', async () => {
    await expect(
      redeem(CHALLENGED_CODE, {
        code_verifier: 'w'.repeat(PKCE_CODE_VERIFIER.length),
      })
    ).rejects.toMatchObject({ errno: OAUTH_ERRNO.INCORRECT_CODE_CHALLENGE });
  });
});
