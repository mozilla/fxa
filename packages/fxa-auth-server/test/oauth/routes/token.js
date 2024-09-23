/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';

import { hex as buf } from 'buf';
import hexModule from "buf";
const hex = hexModule.to.hex;
import proxyquire from 'proxyquire';
import sinon from 'sinon';

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
const tokenRoutes = proxyquire('../../../lib/routes/oauth/token', {
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
})({
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
});

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

describe('/oauth/token POST', function () {
  describe('update session last access time', async () => {
    it('updates last access time of a session when fetching a refresh token', async () => {
      const sessionToken = { uid: 'abc' };
      const request = {
        auth: { credentials: sessionToken },
        headers: {},
        payload: {
          client_id: CLIENT_ID,
          grant_type: 'fxa-credentials',
          access_type: 'offline',
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
  });
});
