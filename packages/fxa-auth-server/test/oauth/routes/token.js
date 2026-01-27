/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { assert } = require('chai');
const buf = (v) => (Buffer.isBuffer(v) ? v : Buffer.from(v, 'hex'));
const hex = (v) => (Buffer.isBuffer(v) ? v.toString('hex') : v);
const sinon = require('sinon');
const path = require('path');
const { Container } = require('typedi');

const proxyquire = require('proxyquire');

const UID = 'eaf0';
const CLIENT_SECRET =
  'b93ef8a8f3e553a430d7e5b904c6132b2722633af9f03128029201d24a97f2a8';
const CLIENT_ID = '98e6508e88680e1b';
const CODE = 'df6dcfe7bf6b54a65db5742cbcdce5c0a84a5da81a0bb6bdf5fc793eef041fc6';
const REFRESH_TOKEN = CODE;
const PKCE_CODE_VERIFIER = 'au3dqDz2dOB0_vSikXCUf4S8Gc-37dL-F7sGxtxpR3R';
const DISABLED_CLIENT_ID = 'd15ab1edd15ab1ed';
const NON_DISABLED_CLIENT_ID = '98e6508e88680e1a';
const CODE_WITH_KEYS = 'afafaf';
const CODE_WITHOUT_KEYS = 'f0f0f0';

const mockDb = { touchSessionToken: sinon.stub() };
const mockStatsD = { increment: sinon.stub() };
const mockGlean = { oauth: { tokenCreated: sinon.stub() } };
const tokenRoutePath = path.join(__dirname, '../../../lib/routes/oauth/token');
const realConfig = require('../../../config').config;
const tokenRoutesDepMocks = {
  '../../oauth/assertion': async () => true,
  '../../oauth/client': {
    authenticateClient: (_, params) => ({
      id: buf(params.client_id),
      canGrant: true,
      publicClient: true,
    }),
  },
  '../../oauth/grant': {
    generateTokens: (grant) => {
      const t = { ...grant, keys_jwe: grant.keysJwe };
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
    async getCode(x) {
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
const tokenRoutes = proxyquire(
  tokenRoutePath,
  tokenRoutesDepMocks
)(tokenRoutesArgMocks);

function joiRequired(err, param) {
  assert.isTrue(err.isJoi);
  assert.equal(err.name, 'ValidationError');
  assert.equal(err.details[0].message, `"${param}" is required`);
}

function joiNotAllowed(err, param) {
  assert.isTrue(err.isJoi);
  assert.equal(err.name, 'ValidationError');
  assert.equal(err.details[0].message, `"${param}" is not allowed`);
}

before(() => {
  Container.set('OAuthClientInfo', {
    async fetch() {
      return 'sync';
    },
  });
});

describe('/token POST', function () {
  const route = tokenRoutes[0];

  describe('input validation', () => {
    // route validation function
    function v(req, ctx, cb) {
      if (typeof ctx === 'function' && !cb) {
        cb = ctx;
        ctx = undefined;
      }
      const validationSchema = route.config.validate.payload;
      return validationSchema.validate(req, { context: ctx }, cb);
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

      assert.equal(res.error, undefined);
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
          code: CODE, // If we don't send `code`, then the missing `code` will fail validation first.
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

        assert.equal(res.error, undefined);
      });

      it('rejects pkce code_verifier that is too small', () => {
        const bad_code_verifier = PKCE_CODE_VERIFIER.substring(0, 32);
        const res = v({
          client_id: CLIENT_ID,
          code_verifier: bad_code_verifier,
          code: CODE,
        });

        assert.isTrue(res.error.isJoi);
        assert.equal(res.error.name, 'ValidationError');
        assert.equal(
          res.error.details[0].message,
          // eslint-disable-next-line quotes
          `"code_verifier" length must be at least 43 characters long`
        ); // eslint-disable-line quotes
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

        assert.isTrue(res.error.isJoi);
        assert.equal(res.error.name, 'ValidationError');
        assert.equal(
          res.error.details[0].message,
          // eslint-disable-next-line quotes
          `"code_verifier" length must be less than or equal to 128 characters long`
        ); // eslint-disable-line quotes
      });

      it('rejects pkce code_verifier that contains invalid characters', () => {
        const bad_code_verifier = PKCE_CODE_VERIFIER + ' :.';
        const res = v({
          client_id: CLIENT_ID,
          code_verifier: bad_code_verifier,
          code: CODE,
        });

        assert.isTrue(res.error.isJoi);
        assert.equal(res.error.name, 'ValidationError');
        assert.equal(
          res.error.details[0].message,
          `"code_verifier" with value "${bad_code_verifier}" fails to match the required pattern: /^[A-Za-z0-9-_]+$/`
        );
      });
    });
  });

  describe('#integration - config handling', () => {
    const request = {
      headers: {},
      payload: {
        client_id: CLIENT_ID,
      },
    };

    it('allows clients that have not been disabled via config', async () => {
      request.payload.client_id = NON_DISABLED_CLIENT_ID;
      request.payload.grant_type = 'refresh_token';
      request.payload.refresh_token = REFRESH_TOKEN;
      try {
        await route.config.handler(request);
        assert.fail('should have errored');
      } catch (err) {
        // The request still fails, but it fails at the point where we check the token,
        // meaning that the client_id was allowed through the disabled filter.
        assert.equal(err.errno, 108); // Invalid token.
      }
    });

    it('allows code grants for clients that have been disabled via config', async () => {
      request.payload.client_id = DISABLED_CLIENT_ID;
      request.payload.grant_type = 'authorization_code';
      request.payload.code = CODE;
      try {
        await route.config.handler(request);
        assert.fail('should have errored');
      } catch (err) {
        // The request still fails, but it fails at the point where we check the code,
        // meaning that the client_id was allowed through the disabled filter.
        assert.equal(err.errno, 105);
      }
    });

    it('returns an error on refresh_token grants for clients that have been disabled via config', async () => {
      request.payload.client_id = DISABLED_CLIENT_ID;
      request.payload.grant_type = 'refresh_token';
      request.payload.refresh_token = REFRESH_TOKEN;
      try {
        await route.config.handler(request);
        assert.fail('should have errored');
      } catch (err) {
        assert.equal(err.output.statusCode, 503);
        assert.equal(err.errno, 202); // Disabled client.
      }
    });

    it('returns an error on fxa-credentials grants for clients that have been disabled via config', async () => {
      request.payload.client_id = DISABLED_CLIENT_ID;
      request.payload.grant_type = 'fxa-credentials';
      try {
        await route.config.handler(request);
        assert.fail('should have errored');
      } catch (err) {
        assert.equal(err.output.statusCode, 503);
        assert.equal(err.errno, 202); // Disabled client.
      }
    });
  });

  describe('statsd metrics', async () => {
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

  describe('Glean metrics', async () => {
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

const GRANT_TOKEN_EXCHANGE = 'urn:ietf:params:oauth:grant-type:token-exchange';
const SUBJECT_TOKEN_TYPE_REFRESH =
  'urn:ietf:params:oauth:token-type:refresh_token';
const FIREFOX_IOS_CLIENT_ID = '1b1a3e44c54fbb58';
const RELAY_SCOPE = 'https://identity.mozilla.com/apps/relay';
const SYNC_SCOPE = 'https://identity.mozilla.com/apps/oldsync';

describe('token exchange grant_type', function () {
  const route = tokenRoutes[0];

  describe('input validation', () => {
    function v(req) {
      const validationSchema = route.config.validate.payload;
      return validationSchema.validate(req);
    }

    it('requires subject_token when grant_type is token-exchange', () => {
      const res = v({
        client_id: CLIENT_ID,
        grant_type: GRANT_TOKEN_EXCHANGE,
        subject_token_type: SUBJECT_TOKEN_TYPE_REFRESH,
        scope: RELAY_SCOPE,
      });
      joiRequired(res.error, 'subject_token');
    });

    it('requires subject_token_type when grant_type is token-exchange', () => {
      const res = v({
        client_id: CLIENT_ID,
        grant_type: GRANT_TOKEN_EXCHANGE,
        subject_token: REFRESH_TOKEN,
        scope: RELAY_SCOPE,
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
        scope: RELAY_SCOPE,
      });
      joiNotAllowed(res.error, 'client_secret');
    });

    it('accepts valid token exchange request', () => {
      const res = v({
        client_id: CLIENT_ID,
        grant_type: GRANT_TOKEN_EXCHANGE,
        subject_token: REFRESH_TOKEN,
        subject_token_type: SUBJECT_TOKEN_TYPE_REFRESH,
        scope: RELAY_SCOPE,
      });
      assert.equal(res.error, undefined);
    });
  });

  describe('validateTokenExchangeGrant', () => {
    const ScopeSet = require('fxa-shared').oauth.scopes;

    it('rejects non-existent subject_token', async () => {
      const routes = proxyquire(tokenRoutePath, {
        ...tokenRoutesDepMocks,
      })({
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
          scope: RELAY_SCOPE,
        },
        emitMetricsEvent: () => {},
      };
      try {
        await routes[0].config.handler(request);
        assert.fail('should have errored');
      } catch (err) {
        assert.equal(err.errno, 108); // Invalid token
      }
    });

    it('rejects tokens from non-Firefox clients', async () => {
      const NON_FIREFOX_CLIENT_ID = '123456789a';
      const routes = proxyquire(tokenRoutePath, {
        ...tokenRoutesDepMocks,
      })({
        ...tokenRoutesArgMocks,
        oauthDB: {
          ...tokenRoutesArgMocks.oauthDB,
          async getRefreshToken() {
            return {
              userId: buf(UID),
              clientId: buf(NON_FIREFOX_CLIENT_ID),
              tokenId: buf('1234567890abcdef'),
              scope: ScopeSet.fromString(SYNC_SCOPE),
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
          scope: RELAY_SCOPE,
        },
        emitMetricsEvent: () => {},
      };
      try {
        await routes[0].config.handler(request);
        assert.fail('should have errored');
      } catch (err) {
        assert.equal(err.errno, 111); // Unauthorized
        assert.include(err.message, 'not authorized for token exchange');
      }
    });

    it('rejects unauthorized scopes', async () => {
      const UNAUTHORIZED_SCOPE =
        'https://identity.mozilla.com/apps/unauthorized';
      const routes = proxyquire(tokenRoutePath, {
        ...tokenRoutesDepMocks,
      })({
        ...tokenRoutesArgMocks,
        oauthDB: {
          ...tokenRoutesArgMocks.oauthDB,
          async getRefreshToken() {
            return {
              userId: buf(UID),
              clientId: buf(FIREFOX_IOS_CLIENT_ID),
              tokenId: buf('1234567890abcdef'),
              scope: ScopeSet.fromString(SYNC_SCOPE),
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
      try {
        await routes[0].config.handler(request);
        assert.fail('should have errored');
      } catch (err) {
        assert.equal(err.errno, 112); // Forbidden
      }
    });

    it('returns combined scopes on success', async () => {
      let removedTokenId = null;
      const routes = proxyquire(tokenRoutePath, {
        ...tokenRoutesDepMocks,
        '../../oauth/grant': {
          generateTokens: (grant) => {
            // Verify combined scope is passed to token generation
            assert.isTrue(grant.scope.contains(SYNC_SCOPE));
            assert.isTrue(grant.scope.contains(RELAY_SCOPE));
            return {
              access_token: 'new_access_token',
              token_type: 'bearer',
              scope: grant.scope.toString(),
              expires_in: 3600,
              refresh_token: 'new_refresh_token',
            };
          },
          validateRequestedGrant: () => ({ offline: true, scope: 'testo' }),
        },
      })({
        ...tokenRoutesArgMocks,
        log: {
          debug: () => {},
          warn: () => {},
          info: () => {},
        },
        oauthDB: {
          ...tokenRoutesArgMocks.oauthDB,
          async getRefreshToken() {
            return {
              userId: buf(UID),
              clientId: buf(FIREFOX_IOS_CLIENT_ID),
              tokenId: buf('1234567890abcdef'),
              scope: ScopeSet.fromString(SYNC_SCOPE),
              profileChangedAt: Date.now(),
            };
          },
          async removeRefreshToken({ tokenId }) {
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
          scope: RELAY_SCOPE,
        },
        emitMetricsEvent: () => {},
      };

      const result = await routes[0].config.handler(request);

      assert.equal(result.access_token, 'new_access_token');
      assert.equal(result.refresh_token, 'new_refresh_token');
      assert.include(result.scope, SYNC_SCOPE);
      assert.include(result.scope, RELAY_SCOPE);
      // Verify original token was revoked with correct ID
      assert.equal(hex(removedTokenId), '1234567890abcdef');
    });
  });
});

describe('/oauth/token POST', function () {
  describe('update session last access time', async () => {
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
      const routes = proxyquire(tokenRoutePath, {
        '../../../config': {
          config: {
            ...realConfig,
            get: (key) => {
              if (key === 'lastAccessTimeUpdates.onOAuthTokenCreation') {
                return false;
              }
              return realConfig.get(key);
            },
          },
        },
        ...tokenRoutesDepMocks,
      })(tokenRoutesArgMocks);
      await routes[1].handler(request);
      sinon.assert.notCalled(mockDb.touchSessionToken);
    });
  });

  describe('token exchange via /oauth/token', () => {
    const ScopeSet = require('fxa-shared').oauth.scopes;

    it('handles token exchange with multiple existing scopes (sync + profile)', async () => {
      const PROFILE_SCOPE = 'profile';
      const routes = proxyquire(tokenRoutePath, {
        ...tokenRoutesDepMocks,
        '../../oauth/grant': {
          generateTokens: (grant) => ({
            access_token: 'new_access_token',
            token_type: 'bearer',
            scope: grant.scope.toString(),
            expires_in: 3600,
            refresh_token: 'new_refresh_token',
          }),
          validateRequestedGrant: () => ({ offline: true, scope: 'testo' }),
        },
        '../utils/oauth': {
          newTokenNotification: async () => {},
        },
      })({
        ...tokenRoutesArgMocks,
        log: {
          debug: () => {},
          warn: () => {},
          info: () => {},
        },
        oauthDB: {
          ...tokenRoutesArgMocks.oauthDB,
          async getRefreshToken() {
            // Original token has both sync and profile scopes
            return {
              userId: buf(UID),
              clientId: buf(FIREFOX_IOS_CLIENT_ID),
              tokenId: buf('1234567890abcdef'),
              scope: ScopeSet.fromString(`${SYNC_SCOPE} ${PROFILE_SCOPE}`),
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
          scope: RELAY_SCOPE,
        },
        emitMetricsEvent: async () => {},
      };

      const result = await routes[1].handler(request);

      assert.equal(result.access_token, 'new_access_token');
      assert.equal(result.refresh_token, 'new_refresh_token');
      // Should have all three scopes: sync, profile, and relay
      assert.include(result.scope, SYNC_SCOPE);
      assert.include(result.scope, PROFILE_SCOPE);
      assert.include(result.scope, RELAY_SCOPE);
    });
  });
});
