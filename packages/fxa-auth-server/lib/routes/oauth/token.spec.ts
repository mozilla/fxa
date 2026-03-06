export {};

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon from 'sinon';
const Joi = require('joi');
const { Container } = require('typedi');

const {
  OAUTH_SCOPE_OLD_SYNC,
  OAUTH_SCOPE_RELAY,
  OAUTH_SCOPE_SESSION_TOKEN,
} = require('fxa-shared/oauth/constants');

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
const CODE =
  'df6dcfe7bf6b54a65db5742cbcdce5c0a84a5da81a0bb6bdf5fc793eef041fc6';
const REFRESH_TOKEN = CODE;
const PKCE_CODE_VERIFIER = 'au3dqDz2dOB0_vSikXCUf4S8Gc-37dL-F7sGxtxpR3R';
const CODE_WITH_KEYS = 'afafaf';
const CODE_WITHOUT_KEYS = 'f0f0f0';
const GRANT_TOKEN_EXCHANGE =
  'urn:ietf:params:oauth:grant-type:token-exchange';
const SUBJECT_TOKEN_TYPE_REFRESH =
  'urn:ietf:params:oauth:token-type:refresh_token';
const FIREFOX_IOS_CLIENT_ID = '1b1a3e44c54fbb58';

const noop = () => {};
const mockLog = { debug: noop, warn: noop, info: noop };
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
    clientAuthValidators: {
      headers: Joi.object({
        authorization: Joi.string().optional(),
      }).options({ allowUnknown: true, stripUnknown: false }),
      clientId: Joi.string().hex().required().when('$headers.authorization', {
        is: Joi.string().required(),
        then: Joi.forbidden(),
      }),
      clientSecret: Joi.string().hex().required().when('$headers.authorization', {
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
  },
  db: mockDb,
  mailer: {},
  devices: {},
  statsd: mockStatsD,
  glean: mockGlean,
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
      mockStatsD.increment.resetHistory();
    });

    it('increments count on scope keys usage', async () => {
      const request = {
        payload: {
          client_id: CLIENT_ID,
          grant_type: 'authorization_code',
          code: CODE_WITH_KEYS,
        },
        emitMetricsEvent: () => {},
      };
      await route.config.handler(request);
      sinon.assert.calledOnceWithExactly(
        mockStatsD.increment,
        'oauth.rp.keys-jwe',
        { clientId: CLIENT_ID }
      );
    });

    it('does not call statsd', async () => {
      const request = {
        payload: {
          client_id: CLIENT_ID,
          grant_type: 'authorization_code',
          code: CODE_WITHOUT_KEYS,
        },
        emitMetricsEvent: () => {},
      };
      await route.config.handler(request);
      sinon.assert.notCalled(mockStatsD.increment);
    });
  });

  describe('Glean metrics', () => {
    beforeEach(() => {
      mockGlean.oauth.tokenCreated.reset();
    });

    it('logs the token created event', async () => {
      const request = {
        payload: {
          client_id: CLIENT_ID,
          grant_type: 'authorization_code',
          code: CODE_WITH_KEYS,
        },
        emitMetricsEvent: () => {},
      };
      await route.config.handler(request);
      sinon.assert.calledOnceWithExactly(
        mockGlean.oauth.tokenCreated,
        request,
        { uid: UID, oauthClientId: CLIENT_ID, reason: 'authorization_code' }
      );
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
    const ScopeSet = require('fxa-shared').oauth.scopes;

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

    it('rejects unauthorized scopes', async () => {
      const UNAUTHORIZED_SCOPE =
        'https://identity.mozilla.com/apps/unauthorized';
      resetAndMockDeps();
      const routes = require('./token')({
        ...tokenRoutesArgMocks,
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
        },
      });
      const request = {
        headers: {},
        payload: {
          grant_type: GRANT_TOKEN_EXCHANGE,
          subject_token: REFRESH_TOKEN,
          subject_token_type: SUBJECT_TOKEN_TYPE_REFRESH,
          scope: UNAUTHORIZED_SCOPE,
        },
        emitMetricsEvent: () => {},
      };
      await expect(routes[0].config.handler(request)).rejects.toMatchObject({
        errno: 112, // Forbidden
      });
    });

    it('returns combined scopes on success', async () => {
      let removedTokenId: any = null;
      jest.resetModules();
      jest.doMock('../../oauth/assertion', () => async () => true);
      jest.doMock('../../oauth/client', () => ({
        authenticateClient: (_: any, params: any) => ({
          id: buf(params.client_id),
          canGrant: true,
          publicClient: true,
        }),
        clientAuthValidators: tokenRoutesDepMocks['../../oauth/client'].clientAuthValidators,
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
          async removeRefreshToken({ tokenId }: any) {
            removedTokenId = tokenId;
          },
        },
      });

      const request = {
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
      expect(hex(removedTokenId)).toBe('1234567890abcdef');
    });
  });
});

describe('/oauth/token POST', () => {
  describe('update session last access time', () => {
    beforeEach(() => {
      mockDb.touchSessionToken.reset();
    });

    it('updates last access time of a session', async () => {
      const sessionToken = { uid: 'abc' };
      const request = {
        auth: { credentials: sessionToken },
        headers: {},
        payload: {
          client_id: CLIENT_ID,
          grant_type: 'fxa-credentials',
        },
        emitMetricsEvent: async () => {},
      };
      await tokenRoutes[1].handler(request);
      sinon.assert.calledOnceWithExactly(
        mockDb.touchSessionToken,
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
        auth: { credentials: sessionToken },
        headers: {},
        payload: {
          client_id: CLIENT_ID,
          grant_type: 'fxa-credentials',
        },
        emitMetricsEvent: async () => {},
      };
      await routes[1].handler(request);
      sinon.assert.notCalled(mockDb.touchSessionToken);
    });
  });

  describe('token exchange via /oauth/token', () => {
    const ScopeSet = require('fxa-shared').oauth.scopes;
    const MOCK_DEVICE_ID = 'device1234567890abcdef';

    it('handles token exchange and passes existingDeviceId to newTokenNotification', async () => {
      const PROFILE_SCOPE = 'profile';
      const newTokenNotificationStub = sinon.stub().resolves();
      const sessionTokenStub = sinon
        .stub()
        .rejects(new Error('should not be called'));
      jest.resetModules();
      jest.doMock('../../oauth/assertion', () => async () => true);
      jest.doMock('../../oauth/client', () =>
        tokenRoutesDepMocks['../../oauth/client']
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
      jest.doMock('../../oauth/util', () =>
        tokenRoutesDepMocks['../../oauth/util']
      );
      jest.doMock('../utils/oauth', () => ({
        newTokenNotification: newTokenNotificationStub,
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
      sinon.assert.calledOnce(newTokenNotificationStub);
      const callArgs = newTokenNotificationStub.firstCall.args;
      expect(callArgs[5]).toEqual({
        skipEmail: true,
        existingDeviceId: MOCK_DEVICE_ID,
        clientId: FIREFOX_IOS_CLIENT_ID,
      });
      sinon.assert.notCalled(sessionTokenStub);
    });

    it('handles token exchange when no existing device is found (existingDeviceId is undefined)', async () => {
      const PROFILE_SCOPE = 'profile';
      const newTokenNotificationStub = sinon.stub().resolves();
      jest.resetModules();
      jest.doMock('../../oauth/assertion', () => async () => true);
      jest.doMock('../../oauth/client', () =>
        tokenRoutesDepMocks['../../oauth/client']
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
      jest.doMock('../../oauth/util', () =>
        tokenRoutesDepMocks['../../oauth/util']
      );
      jest.doMock('../utils/oauth', () => ({
        newTokenNotification: newTokenNotificationStub,
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
      sinon.assert.calledOnce(newTokenNotificationStub);
      const callArgs = newTokenNotificationStub.firstCall.args;
      expect(callArgs[5]).toEqual({
        skipEmail: true,
        existingDeviceId: undefined,
        clientId: FIREFOX_IOS_CLIENT_ID,
      });
    });
  });

  describe('fxa-credentials with reason=token_migration', () => {
    it('calls newTokenNotification with skipEmail: true when reason is token_migration', async () => {
      const newTokenNotificationStub = sinon.stub().resolves();
      const sessionTokenStub = sinon
        .stub()
        .rejects(new Error('should not be called'));
      jest.resetModules();
      jest.doMock('../../oauth/assertion', () => async () => true);
      jest.doMock('../../oauth/client', () =>
        tokenRoutesDepMocks['../../oauth/client']
      );
      jest.doMock('../../oauth/grant', () => ({
        generateTokens:
          tokenRoutesDepMocks['../../oauth/grant'].generateTokens,
        validateRequestedGrant: () => ({
          offline: true,
          scope: OAUTH_SCOPE_SESSION_TOKEN,
          clientId: buf(CLIENT_ID),
        }),
      }));
      jest.doMock('../../oauth/util', () =>
        tokenRoutesDepMocks['../../oauth/util']
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
      sinon.assert.calledOnce(newTokenNotificationStub);
      const callArgs = newTokenNotificationStub.firstCall.args;
      expect(callArgs[5]).toEqual({
        skipEmail: true,
        existingDeviceId: undefined,
        clientId: CLIENT_ID,
      });
      sinon.assert.notCalled(sessionTokenStub);
    });

    it('calls newTokenNotification with skipEmail: false when reason is not provided', async () => {
      const newTokenNotificationStub = sinon.stub().resolves();
      jest.resetModules();
      jest.doMock('../../oauth/assertion', () => async () => true);
      jest.doMock('../../oauth/client', () =>
        tokenRoutesDepMocks['../../oauth/client']
      );
      jest.doMock('../../oauth/grant', () => ({
        generateTokens:
          tokenRoutesDepMocks['../../oauth/grant'].generateTokens,
        validateRequestedGrant: () => ({
          offline: true,
          scope: 'testo',
          clientId: buf(CLIENT_ID),
        }),
      }));
      jest.doMock('../../oauth/util', () =>
        tokenRoutesDepMocks['../../oauth/util']
      );
      jest.doMock('../utils/oauth', () => ({
        newTokenNotification: newTokenNotificationStub,
      }));
      const routes = require('./token')(tokenRoutesArgMocks);

      const request = {
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
      sinon.assert.calledOnce(newTokenNotificationStub);
      const callArgs = newTokenNotificationStub.firstCall.args;
      expect(callArgs[5]).toEqual({
        skipEmail: false,
        existingDeviceId: undefined,
        clientId: CLIENT_ID,
      });
    });
  });
});
