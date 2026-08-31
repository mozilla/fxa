/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createMock } from '@golevelup/ts-jest';
import { OAuthNativeClients } from '@fxa/accounts/oauth';
import { AuthLogger } from '../../types';

const Joi = require('joi');
const ScopeSet = require('fxa-shared').oauth.scopes;

const CLIENT_ID = '98e6508e88680e1b';
const BASE64URL_STRING =
  'TG9yZW0gSXBzdW0gaXMgc2ltcGx5IGR1bW15IHRleHQgb2YgdGhlIHByaW50aW5nIGFuZCB0eXBlc2V0dGluZyBpbmR1c3RyeS4gTG9yZW0gSXBzdW0gaGFzIGJlZW4gdGhlIGluZHVzdHJ5J3Mgc3RhbmRhcmQgZHVtbXkgdGV4dCBldmVyIHNpbmNlIHRoZSAxNTAwcywgd2hlbiBhbiB1bmtub3duIHByaW50ZXIgdG9vayBhIGdhbGxleSBvZiB0eXBlIGFuZCBzY3JhbWJsZWQgaXQgdG8gbWFrZSBhIHR5cGUgc3BlY2ltZW4gYm9v';
const PKCE_CODE_CHALLENGE = 'iyW5ScKr22v_QL-rcW_EGlJrDSOymJvrlXlw4j7JBiQ';
const PKCE_CODE_CHALLENGE_METHOD = 'S256';
const DISABLED_CLIENT_ID = 'd15ab1edd15ab1ed';

const SERVICES_WITH_EMAIL_VERIFICATION_CLIENT = '32aaeb6f1c21316a';

const mockLog = createMock<AuthLogger>();
const mockGlean = { pairing: { success: jest.fn() } };

const baseConfig = {
  oauthServer: {
    expiration: { accessToken: 3600000, code: 900000 },
    disabledClients: [DISABLED_CLIENT_ID],
    allowHttpRedirects: false,
    contentUrl: 'http://localhost',
  },
  oauth: {
    disableNewConnectionsForClients: [],
  },
  servicesWithEmailVerification: [] as string[],
};

const route = require('./authorization')({
  glean: mockGlean,
  log: mockLog,
  oauthDB: {},
})[1];

const configuredRoute = require('./authorization')({
  glean: mockGlean,
  log: mockLog,
  oauthDB: {},
  config: baseConfig,
})[1];

const sessionTokenRoute = require('./authorization')({
  glean: mockGlean,
  log: mockLog,
  oauthDB: {},
  config: {
    ...baseConfig,
    servicesWithEmailVerification: [SERVICES_WITH_EMAIL_VERIFICATION_CLIENT],
  },
})[2];

describe('/authorization POST', () => {
  describe('input validation', () => {
    const validation = route.config.validate.payload;

    function joiAssertFail(
      req: any,
      param: string,
      messagePostfix = 'is required'
    ) {
      expect(() => Joi.assert(req, validation)).toThrow(
        expect.objectContaining({
          name: 'ValidationError',
          details: expect.arrayContaining([
            expect.objectContaining({
              message: `"${param}" ${messagePostfix}`,
            }),
          ]),
        })
      );
    }

    it('fails with no client_id', () => {
      joiAssertFail(
        {
          foo: 1,
        },
        'client_id'
      );
    });

    it('fails with no assertion', () => {
      joiAssertFail(
        {
          client_id: CLIENT_ID,
        },
        'assertion'
      );
    });

    it('fails with no scope', () => {
      joiAssertFail(
        {
          client_id: CLIENT_ID,
          assertion: BASE64URL_STRING,
        },
        'scope'
      );
    });

    it('fails with no state', () => {
      joiAssertFail(
        {
          client_id: CLIENT_ID,
          assertion: BASE64URL_STRING,
          scope: 'bar',
        },
        'state'
      );
    });

    it('accepts state parameter', () => {
      Joi.assert(
        {
          client_id: CLIENT_ID,
          assertion: BASE64URL_STRING,
          scope: 'bar',
          state: 'foo',
        },
        validation
      );
    });

    it('accepts TTL larger than the maximum supported', () => {
      const ONE_YEAR_IN_SECONDS = 31536000;
      Joi.assert(
        {
          client_id: CLIENT_ID,
          assertion: BASE64URL_STRING,
          scope: 'bar',
          state: 'foo',
          response_type: 'token',
          ttl: ONE_YEAR_IN_SECONDS,
        },
        validation
      );
    });

    describe('PKCE params', () => {
      it('accepts code_challenge and code_challenge_method', () => {
        Joi.assert(
          {
            client_id: CLIENT_ID,
            assertion: BASE64URL_STRING,
            scope: 'bar',
            state: 'foo',
            code_challenge: PKCE_CODE_CHALLENGE,
            code_challenge_method: PKCE_CODE_CHALLENGE_METHOD,
          },
          validation
        );
      });

      it('validates code_challenge_method', () => {
        joiAssertFail(
          {
            client_id: CLIENT_ID,
            assertion: BASE64URL_STRING,
            scope: 'bar',
            state: 'foo',
            code_challenge: PKCE_CODE_CHALLENGE,
            code_challenge_method: 'bad_method',
          },
          'code_challenge_method',
          'must be [S256]'
        );
      });

      it('validates code_challenge', () => {
        joiAssertFail(
          {
            client_id: CLIENT_ID,
            assertion: BASE64URL_STRING,
            scope: 'bar',
            state: 'foo',
            code_challenge: 'foo',
            code_challenge_method: PKCE_CODE_CHALLENGE_METHOD,
          },
          'code_challenge',
          'length must be 43 characters long'
        );
      });

      it('works with response_type code (non-default)', () => {
        Joi.assert(
          {
            client_id: CLIENT_ID,
            assertion: BASE64URL_STRING,
            scope: 'bar',
            state: 'foo',
            code_challenge: PKCE_CODE_CHALLENGE,
            code_challenge_method: PKCE_CODE_CHALLENGE_METHOD,
            response_type: 'code',
          },
          validation
        );
      });

      it('fails with response_type token', () => {
        joiAssertFail(
          {
            client_id: CLIENT_ID,
            assertion: BASE64URL_STRING,
            scope: 'bar',
            state: 'foo',
            code_challenge: PKCE_CODE_CHALLENGE,
            code_challenge_method: PKCE_CODE_CHALLENGE_METHOD,
            response_type: 'token',
          },
          'code_challenge',
          'is not allowed'
        );
      });
    });
  });

  describe('config handling', () => {
    const request = {
      headers: {},
      payload: {
        client_id: CLIENT_ID,
      },
    };

    it('allows clients that have not been disabled via config', async () => {
      await expect(
        configuredRoute.config.handler(request)
      ).rejects.toMatchObject({
        errno: 104, // Invalid assertion
      });
    });

    it('returns an error for clients that have been disabled via config', () => {
      request.payload.client_id = DISABLED_CLIENT_ID;
      // Handler is synchronous, so it throws rather than rejecting
      expect(() => configuredRoute.config.handler(request)).toThrow(
        expect.objectContaining({
          output: expect.objectContaining({ statusCode: 503 }),
          errno: 202,
        })
      );
    });
  });
});

describe('/oauth/authorization POST', () => {
  describe('servicesWithEmailVerification enforcement', () => {
    it('rejects unverified sessions for clients in servicesWithEmailVerification', async () => {
      const request = {
        headers: {},
        auth: {
          credentials: {
            tokenVerified: false,
            uid: 'abc123',
            email: 'test@example.com',
          },
        },
        payload: {
          client_id: SERVICES_WITH_EMAIL_VERIFICATION_CLIENT,
          state: 'foo',
          scope: 'profile',
        },
      };

      await expect(sessionTokenRoute.handler(request)).rejects.toMatchObject({
        errno: 138, // Unverified session
      });
    });

    it('allows verified sessions for clients in servicesWithEmailVerification', async () => {
      const request = {
        headers: {},
        auth: {
          credentials: {
            tokenVerified: true,
            uid: 'abc123',
            email: 'test@example.com',
            emailVerified: true,
            verifierSetAt: Date.now(),
            lastAuthAt: () => Date.now(),
            authenticationMethods: new Set(['pwd']),
            authenticatorAssuranceLevel: 1,
            profileChangedAt: Date.now(),
            keysChangedAt: Date.now(),
            id: 'sessionTokenId',
          },
        },
        payload: {
          client_id: SERVICES_WITH_EMAIL_VERIFICATION_CLIENT,
          state: 'foo',
          scope: 'profile',
        },
      };

      // Should pass the servicesWithEmailVerification check and fail
      // further downstream, not at unverified session check (errno 138).
      const rejection = expect(sessionTokenRoute.handler(request)).rejects;
      await rejection.toBeDefined();
      await rejection.not.toMatchObject({ errno: 138 });
    });

    it('allows unverified sessions for clients NOT in servicesWithEmailVerification', async () => {
      const request = {
        headers: {},
        auth: {
          credentials: {
            tokenVerified: false,
            uid: 'abc123',
            email: 'test@example.com',
            emailVerified: true,
            verifierSetAt: Date.now(),
            lastAuthAt: () => Date.now(),
            authenticationMethods: new Set(['pwd']),
            authenticatorAssuranceLevel: 1,
            profileChangedAt: Date.now(),
            keysChangedAt: Date.now(),
            id: 'sessionTokenId',
            mustVerify: false,
          },
        },
        payload: {
          client_id: CLIENT_ID,
          state: 'foo',
          scope: 'profile',
        },
      };

      // Should not fail with unverified session error (errno 138),
      // but may fail further downstream for other reasons.
      const rejection = expect(sessionTokenRoute.handler(request)).rejects;
      await rejection.toBeDefined();
      await rejection.not.toMatchObject({ errno: 138 });
    });
  });
});

describe('/authorization POST consent write', () => {
  const UID_HEX = 'a'.repeat(32);
  const SYNC_SCOPE = 'https://identity.mozilla.com/apps/oldsync';
  const VPN_SCOPE = 'https://identity.mozilla.com/apps/vpn';
  const SMARTWINDOW_SCOPE = 'https://identity.mozilla.com/apps/smartwindow';
  const DESKTOP_CLIENT_ID = OAuthNativeClients.FirefoxDesktop;

  /**
   * The metric names emitted, for negative assertions. `toHaveBeenCalledWith`
   * requires an exact argument-list match, so a regression that emitted a
   * counter with no tag object — or a different arity — would slip past
   * `not.toHaveBeenCalledWith(name, expect.anything())`.
   */
  function emittedMetrics(statsd: { increment: jest.Mock }): string[] {
    return statsd.increment.mock.calls.map(
      (call: unknown[]) => call[0] as string
    );
  }

  function buildOauthDB(overrides: Record<string, any> = {}) {
    return {
      getClient: jest.fn(async () => ({
        canGrant: true,
        publicClient: false,
        redirectUri: 'https://example.com/redirect',
        id: Buffer.from(CLIENT_ID, 'hex'),
      })),
      generateCode: jest.fn(async () => 'code-xyz'),
      isKnownService: jest.fn((s: string) => s === 'sync'),
      isClientAllowedForService: jest.fn(() => true),
      getCanonicalScopeForService: jest.fn((s: string) =>
        s === 'sync' ? SYNC_SCOPE : undefined
      ),
      getServiceForCanonicalScope: jest.fn(() => undefined),
      recordSignInConsents: jest.fn().mockResolvedValue(undefined),
      hasConsentForService: jest.fn().mockResolvedValue(false),
      hasConsentForClient: jest.fn().mockResolvedValue(false),
      ...overrides,
    };
  }

  function buildPayload(extra: Record<string, any> = {}) {
    return {
      client_id: CLIENT_ID,
      assertion: BASE64URL_STRING,
      state: 'foo',
      scope: 'profile openid',
      response_type: 'code',
      redirect_uri: 'https://example.com/redirect',
      ...extra,
    };
  }

  async function runHandler(opts: {
    oauthDB: any;
    statsd?: any;
    log?: any;
    payload?: Record<string, any>;
    app?: Record<string, any>;
    /** Client id on both the payload and the resolved grant. */
    clientId?: string;
    authServerCacheRedis?: any;
  }) {
    // Real hapi requests always have `app`; recordAuthorizationRows stashes
    // service/firstAuthorization there. Returned so tests can assert on it.
    const app = opts.app ?? {};
    const clientId = opts.clientId ?? CLIENT_ID;
    let routes: any;
    await jest.isolateModulesAsync(async () => {
      jest.doMock('../../oauth/assertion', () =>
        jest.fn(async () => ({ uid: UID_HEX }))
      );
      jest.doMock('../../oauth/grant', () => ({
        validateRequestedGrant: jest.fn(async (_claims, _client, payload) => ({
          clientId: Buffer.from(clientId, 'hex'),
          userId: Buffer.from(UID_HEX, 'hex'),
          scope: ScopeSet.fromString(payload.scope as string),
          offline: payload.access_type !== 'online',
        })),
        generateTokens: jest.fn(async () => ({})),
      }));
      routes = require('./authorization')({
        glean: mockGlean,
        log: opts.log ?? mockLog,
        oauthDB: opts.oauthDB,
        config: baseConfig,
        statsd: opts.statsd,
        authServerCacheRedis: opts.authServerCacheRedis,
      });
      await routes[1].config.handler({
        headers: {},
        app,
        payload: buildPayload({ client_id: clientId, ...opts.payload }),
      });
    });
    return { app };
  }

  it('records every requested scope plus the service canonical in a single call and consults the allowlist', async () => {
    const oauthDB = buildOauthDB();
    const statsd = { increment: jest.fn() };

    await runHandler({
      oauthDB,
      statsd,
      payload: { service: 'sync', access_type: 'offline' },
    });

    expect(oauthDB.isClientAllowedForService).toHaveBeenCalledWith(
      'sync',
      CLIENT_ID
    );
    // One call for all scopes — a single DB statement/connection, not one per scope.
    expect(oauthDB.recordSignInConsents).toHaveBeenCalledTimes(1);
    const { scopes, ...rest } = (oauthDB.recordSignInConsents as jest.Mock).mock
      .calls[0][0];
    expect([...scopes].sort()).toEqual([SYNC_SCOPE, 'openid', 'profile']);
    expect(rest).toEqual({
      uid: UID_HEX,
      service: 'sync',
      clientId: CLIENT_ID,
      now: expect.any(Number),
    });
    expect(statsd.increment).toHaveBeenCalledWith(
      'accountAuthorization.recorded',
      { service: 'sync', access_type: 'offline' }
    );
  });

  it('records service="" when the URL service= is unrecognised', async () => {
    const oauthDB = buildOauthDB({
      isKnownService: jest.fn(() => false),
    });

    await runHandler({
      oauthDB,
      payload: { service: 'mystery', scope: 'profile' },
    });

    expect(oauthDB.recordSignInConsents).toHaveBeenCalledWith(
      expect.objectContaining({ scopes: ['profile'], service: '' })
    );
  });

  it('swallows recordSignInConsents failures and emits write_failed', async () => {
    const oauthDB = buildOauthDB({
      recordSignInConsents: jest.fn().mockRejectedValue(new Error('db down')),
    });
    const statsd = { increment: jest.fn() };

    await runHandler({ oauthDB, statsd, payload: { scope: 'profile' } });

    expect(mockLog.warn).toHaveBeenCalledWith(
      'accountAuthorization.write_failed',
      expect.objectContaining({ err: 'db down' })
    );
    expect(statsd.increment).toHaveBeenCalledWith(
      'accountAuthorization.write_failed'
    );
  });

  it('prompt=none skips the consent write entirely', async () => {
    const oauthDB = buildOauthDB();
    const statsd = { increment: jest.fn() };

    await runHandler({
      oauthDB,
      statsd,
      payload: { service: 'sync', prompt: 'none' },
    });

    expect(oauthDB.recordSignInConsents).not.toHaveBeenCalled();
    expect(statsd.increment).toHaveBeenCalledWith(
      'accountAuthorization.skipped',
      {
        reason: 'prompt_none',
      }
    );
    expect(statsd.increment).not.toHaveBeenCalledWith(
      'accountAuthorization.recorded',
      expect.anything()
    );
  });

  it('checks the consent ledger before writing and flags firstAuthorization for a first-time RP', async () => {
    // buildOauthDB defaults hasConsentForClient to false (no prior consent).
    const oauthDB = buildOauthDB();

    const { app } = await runHandler({
      oauthDB,
      payload: { scope: 'profile' },
    });

    expect(oauthDB.hasConsentForClient).toHaveBeenCalledWith(
      UID_HEX,
      CLIENT_ID
    );
    expect(oauthDB.recordSignInConsents).toHaveBeenCalled();
    expect(app.firstAuthorization).toBe(true);
  });

  it('does not flag firstAuthorization on a repeat authorization of the same RP', async () => {
    const oauthDB = buildOauthDB({
      hasConsentForClient: jest.fn().mockResolvedValue(true),
    });

    const { app } = await runHandler({
      oauthDB,
      payload: { scope: 'profile' },
    });

    expect(app.firstAuthorization).toBeUndefined();
  });

  it('does not flag firstAuthorization when the consent write fails', async () => {
    const oauthDB = buildOauthDB({
      recordSignInConsents: jest.fn().mockRejectedValue(new Error('db down')),
    });

    const { app } = await runHandler({
      oauthDB,
      payload: { scope: 'profile' },
    });

    expect(app.firstAuthorization).toBeUndefined();
  });

  it('still writes consent (and reports first_auth_read_failed) when the firstAuthorization check fails', async () => {
    const oauthDB = buildOauthDB({
      hasConsentForClient: jest.fn().mockRejectedValue(new Error('read down')),
    });
    const statsd = { increment: jest.fn() };

    const { app } = await runHandler({
      oauthDB,
      statsd,
      payload: { scope: 'profile' },
    });

    expect(oauthDB.recordSignInConsents).toHaveBeenCalled();
    expect(statsd.increment).toHaveBeenCalledWith(
      'accountAuthorization.first_auth_read_failed'
    );
    expect(app.firstAuthorization).toBeUndefined();
  });

  it('skips the consent write when clientId is not allowed for the service', async () => {
    const oauthDB = buildOauthDB({
      isClientAllowedForService: jest.fn(() => false),
    });
    const statsd = { increment: jest.fn() };

    await runHandler({
      oauthDB,
      statsd,
      payload: { service: 'sync' },
    });

    expect(oauthDB.recordSignInConsents).not.toHaveBeenCalled();
    expect(statsd.increment).toHaveBeenCalledWith(
      'accountAuthorization.skipped',
      {
        reason: 'client_not_allowed',
        service: 'sync',
      }
    );
  });

  it('infers service from a canonical scope when service= URL param is missing', async () => {
    // Reproduces Desktop VPN cached signin: client_id on the VPN
    // allowlist, scope=apps/vpn, no service= URL param. The writer
    // must infer service=vpn so a later token-exchange finds the row.
    const oauthDB = buildOauthDB({
      isKnownService: jest.fn(() => false),
      getServiceForCanonicalScope: jest.fn((s: string) =>
        s === VPN_SCOPE ? 'vpn' : undefined
      ),
    });

    await runHandler({ oauthDB, payload: { scope: VPN_SCOPE } });

    expect(oauthDB.isClientAllowedForService).toHaveBeenCalledWith(
      'vpn',
      CLIENT_ID
    );
    expect(oauthDB.recordSignInConsents).toHaveBeenCalledWith(
      expect.objectContaining({ scopes: [VPN_SCOPE], service: 'vpn' })
    );
  });

  it('inferred service still gates through the clientId allowlist', async () => {
    // Reproduces 123done -> apps/vpn with no service=. Inference
    // yields service=vpn; the allowlist gate rejects 123done.
    const oauthDB = buildOauthDB({
      isKnownService: jest.fn(() => false),
      isClientAllowedForService: jest.fn(() => false),
      getServiceForCanonicalScope: jest.fn((s: string) =>
        s === VPN_SCOPE ? 'vpn' : undefined
      ),
    });
    const statsd = { increment: jest.fn() };

    await runHandler({ oauthDB, statsd, payload: { scope: VPN_SCOPE } });

    expect(oauthDB.recordSignInConsents).not.toHaveBeenCalled();
    expect(statsd.increment).toHaveBeenCalledWith(
      'accountAuthorization.skipped',
      { reason: 'client_not_allowed', service: 'vpn' }
    );
  });

  // FXA-13874: today every row carries the URL `service=` value, even when
  // the grant contains a scope whose canonical owner is a different
  // service (e.g. apps/oldsync added under service=vpn via the keys_jwe
  // path, or apps/vpn added under service=sync once we ship a
  // multi-product opt-in checkbox). This test pins the current behavior
  // so a future change to key each row by its canonical service has an
  // explicit signal to update here.
  it('writes the multi-scope grant under the URL service= (incl. cross-service apps/oldsync row)', async () => {
    const oauthDB = buildOauthDB({
      isKnownService: jest.fn((s: string) => s === 'vpn'),
      getCanonicalScopeForService: jest.fn((s: string) =>
        s === 'vpn' ? VPN_SCOPE : undefined
      ),
      getServiceForCanonicalScope: jest.fn((s: string) => {
        if (s === VPN_SCOPE) return 'vpn';
        if (s === SYNC_SCOPE) return 'sync';
        return undefined;
      }),
    });

    // Simulates the gate output for `service=vpn` + keys_jwe:
    // grant.scope = [apps/vpn, profile, apps/oldsync].
    await runHandler({
      oauthDB,
      payload: {
        service: 'vpn',
        scope: `${VPN_SCOPE} profile ${SYNC_SCOPE}`,
      },
    });

    expect(oauthDB.recordSignInConsents).toHaveBeenCalledTimes(1);
    const { scopes, service } = (oauthDB.recordSignInConsents as jest.Mock).mock
      .calls[0][0];
    expect([...scopes].sort()).toEqual([SYNC_SCOPE, VPN_SCOPE, 'profile']);
    // apps/oldsync's canonical owner is 'sync', but every row in this grant
    // is currently keyed to the URL service='vpn'. FXA-13874 tracks changing
    // this so the apps/oldsync row is keyed to 'sync' instead. Note this
    // client is a web RP; on Firefox Desktop the apps/oldsync row is dropped
    // entirely by the FXA-14263 bandaid, covered below.
    expect(service).toBe('vpn');
  });

  // FXA-14263: Desktop asks for the Sync scope on every browser flow, so a
  // non-Sync sign-in would otherwise file an apps/oldsync consent row for a
  // user who never authorized Sync.
  it('drops the Sync scope from the consent write when Desktop signs into a non-Sync service', async () => {
    const oauthDB = buildOauthDB({
      isKnownService: jest.fn(
        (s: string) => s === 'sync' || s === 'smartwindow'
      ),
      getCanonicalScopeForService: jest.fn((s: string) => {
        if (s === 'sync') return SYNC_SCOPE;
        if (s === 'smartwindow') return SMARTWINDOW_SCOPE;
        return undefined;
      }),
    });
    const statsd = { increment: jest.fn() };

    await runHandler({
      oauthDB,
      statsd,
      clientId: DESKTOP_CLIENT_ID,
      payload: { service: 'smartwindow', scope: `profile ${SYNC_SCOPE}` },
    });

    expect(oauthDB.recordSignInConsents).toHaveBeenCalledTimes(1);
    const { scopes } = (oauthDB.recordSignInConsents as jest.Mock).mock
      .calls[0][0];
    expect([...scopes].sort()).toEqual([SMARTWINDOW_SCOPE, 'profile']);
    expect(statsd.increment).toHaveBeenCalledWith(
      'accountAuthorization.sync_scope_dropped',
      { service: 'smartwindow' }
    );
  });

  // The bandaid must touch the consent ledger and nothing else.
  // Granted refresh and access token scopes should be untouched.
  it('leaves the Sync scope on the grant when it drops it from the consent write', async () => {
    const oauthDB = buildOauthDB({
      isKnownService: jest.fn(
        (s: string) => s === 'sync' || s === 'smartwindow'
      ),
      getCanonicalScopeForService: jest.fn((s: string) => {
        if (s === 'sync') return SYNC_SCOPE;
        if (s === 'smartwindow') return SMARTWINDOW_SCOPE;
        return undefined;
      }),
    });

    await runHandler({
      oauthDB,
      clientId: DESKTOP_CLIENT_ID,
      payload: { service: 'smartwindow', scope: `profile ${SYNC_SCOPE}` },
    });

    // The ledger loses the Sync scope while the grant that becomes the code —
    // and from there the access and refresh tokens — keeps it.
    const { scopes } = (oauthDB.recordSignInConsents as jest.Mock).mock
      .calls[0][0];
    expect([...scopes].sort()).toEqual([SMARTWINDOW_SCOPE, 'profile']);

    const grant = (oauthDB.generateCode as jest.Mock).mock.calls[0][0];
    expect([...grant.scope.getScopeValues()].sort()).toEqual(
      [SYNC_SCOPE, 'profile'].sort()
    );
  });

  // The consent drop and the DAU tag are one decision. /oauth/token never sees
  // `service=`, so it's stashed against the code's hash here. Read side:
  // ./token.spec.ts.
  describe('carrying the decision to /oauth/token', () => {
    const CODE_HEX = 'a1'.repeat(32);
    const encrypt = require('fxa-shared/auth/encrypt');
    const {
      excludeDauCacheKey,
    } = require('../../oauth/desktop-sync-dau-authorization-bandaid');

    function buildDesktopOauthDB() {
      return buildOauthDB({
        generateCode: jest.fn(async () => CODE_HEX),
        isKnownService: jest.fn(
          (s: string) => s === 'sync' || s === 'smartwindow'
        ),
        getCanonicalScopeForService: jest.fn((s: string) => {
          if (s === 'sync') return SYNC_SCOPE;
          if (s === 'smartwindow') return SMARTWINDOW_SCOPE;
          return undefined;
        }),
      });
    }

    it('stashes the flag against the code hash, expiring with the code', async () => {
      const authServerCacheRedis = { set: jest.fn().mockResolvedValue('OK') };

      await runHandler({
        oauthDB: buildDesktopOauthDB(),
        authServerCacheRedis,
        clientId: DESKTOP_CLIENT_ID,
        payload: { service: 'smartwindow', scope: `profile ${SYNC_SCOPE}` },
      });

      expect(authServerCacheRedis.set).toHaveBeenCalledWith(
        excludeDauCacheKey(encrypt.hash(CODE_HEX).toString('hex')),
        '1',
        'EX',
        900
      );
    });

    it('writes nothing to Redis when the sign-in is Sync', async () => {
      const authServerCacheRedis = { set: jest.fn().mockResolvedValue('OK') };

      await runHandler({
        oauthDB: buildDesktopOauthDB(),
        authServerCacheRedis,
        clientId: DESKTOP_CLIENT_ID,
        payload: { service: 'sync', scope: `profile ${SYNC_SCOPE}` },
      });

      expect(authServerCacheRedis.set).not.toHaveBeenCalled();
    });

    it('still issues the code when the Redis write fails', async () => {
      const authServerCacheRedis = {
        set: jest.fn().mockRejectedValue(new Error('no redis')),
      };
      const oauthDB = buildDesktopOauthDB();
      const statsd = { increment: jest.fn() };

      await runHandler({
        oauthDB,
        statsd,
        authServerCacheRedis,
        clientId: DESKTOP_CLIENT_ID,
        payload: { service: 'smartwindow', scope: `profile ${SYNC_SCOPE}` },
      });

      expect(oauthDB.generateCode).toHaveBeenCalledTimes(1);
      expect(statsd.increment).toHaveBeenCalledWith(
        'accountAuthorization.exclude_dau_write_failed'
      );
    });
  });

  // The scope-keeping branch itself is covered by the pure spec; what is
  // route-unique here is that the counter stays silent.
  it('does not emit sync_scope_dropped when Desktop signs into Sync', async () => {
    const statsd = { increment: jest.fn() };

    await runHandler({
      oauthDB: buildOauthDB(),
      statsd,
      clientId: DESKTOP_CLIENT_ID,
      payload: { service: 'sync', scope: `profile ${SYNC_SCOPE}` },
    });

    expect(emittedMetrics(statsd)).not.toContain(
      'accountAuthorization.sync_scope_dropped'
    );
  });

  // The counter tracks rows actually kept out of the ledger, not decisions
  // made, so a failed write must not increment it.
  it('does not emit sync_scope_dropped when the consent write fails', async () => {
    const statsd = { increment: jest.fn() };

    await runHandler({
      oauthDB: buildOauthDB({
        isKnownService: jest.fn(
          (s: string) => s === 'sync' || s === 'smartwindow'
        ),
        getCanonicalScopeForService: jest.fn((s: string) => {
          if (s === 'sync') return SYNC_SCOPE;
          if (s === 'smartwindow') return SMARTWINDOW_SCOPE;
          return undefined;
        }),
        recordSignInConsents: jest.fn().mockRejectedValue(new Error('db down')),
      }),
      statsd,
      clientId: DESKTOP_CLIENT_ID,
      payload: { service: 'smartwindow', scope: `profile ${SYNC_SCOPE}` },
    });

    expect(emittedMetrics(statsd)).toContain(
      'accountAuthorization.write_failed'
    );
    expect(emittedMetrics(statsd)).not.toContain(
      'accountAuthorization.sync_scope_dropped'
    );
  });
});

// Server-side scope resolution from `service=` for OAuthNative (Firefox)
// clients. These tests assert the gating logic at the route entrypoint;
// downstream assertion verification is expected to fail and is not
// asserted here.
describe('/oauth/authorization service-driven scope resolution', () => {
  const FIREFOX_DESKTOP = '5882386c6d801776';
  const FIREFOX_IOS = '1b1a3e44c54fbb58';
  const NON_NATIVE_CLIENT = '0123456789abcdef';
  const VPN_SCOPE = 'https://identity.mozilla.com/apps/vpn';
  const OLDSYNC_SCOPE = 'https://identity.mozilla.com/apps/oldsync';
  const OAUTH_INVALID_PARAMETER_ERRNO = 109;

  function makeRoute(oauthDB: Record<string, any>) {
    return require('./authorization')({
      glean: mockGlean,
      log: mockLog,
      oauthDB,
      config: baseConfig,
    })[2];
  }

  function makeRequest(payload: Record<string, unknown>) {
    return {
      headers: {},
      auth: {
        credentials: {
          tokenVerified: true,
          uid: 'abc123',
          email: 'test@example.com',
          emailVerified: true,
          verifierSetAt: Date.now(),
          lastAuthAt: () => Date.now(),
          authenticationMethods: new Set(['pwd']),
          authenticatorAssuranceLevel: 1,
          profileChangedAt: Date.now(),
          keysChangedAt: Date.now(),
          id: 'sessionTokenId',
          mustVerify: false,
        },
      },
      payload: { state: 'foo', ...payload },
    };
  }

  it('rejects with invalid_request_parameter(scope) for a non-OAuthNative client when service is provided without scope', async () => {
    // Gate rejects before any oauthDB call, so empty mock is fine.
    const route = makeRoute({});
    await expect(
      route.handler(
        makeRequest({ client_id: NON_NATIVE_CLIENT, service: 'vpn' })
      )
    ).rejects.toMatchObject({
      errno: OAUTH_INVALID_PARAMETER_ERRNO,
      output: expect.objectContaining({
        payload: expect.objectContaining({
          validation: expect.objectContaining({ keys: ['scope'] }),
        }),
      }),
    });
  });

  it('rejects with invalid_request_parameter(service) for an OAuthNative client when service is unknown', async () => {
    const route = makeRoute({
      isClientAllowedForService: () => true,
      resolveScopesForService: () => undefined,
    });
    await expect(
      route.handler(
        makeRequest({ client_id: FIREFOX_IOS, service: 'totally-unknown' })
      )
    ).rejects.toMatchObject({
      errno: OAUTH_INVALID_PARAMETER_ERRNO,
      output: expect.objectContaining({
        payload: expect.objectContaining({
          validation: expect.objectContaining({ keys: ['service'] }),
        }),
      }),
    });
  });

  it('rejects with invalid_request_parameter(service) when an OAuthNative client is not registered for the service', async () => {
    const route = makeRoute({
      // Mobile (iOS) is not in smartwindow.clientIds.
      isClientAllowedForService: () => false,
      resolveScopesForService: () => [
        'https://identity.mozilla.com/apps/smartwindow',
        'profile:uid',
      ],
    });
    await expect(
      route.handler(
        makeRequest({ client_id: FIREFOX_IOS, service: 'smartwindow' })
      )
    ).rejects.toMatchObject({
      errno: OAUTH_INVALID_PARAMETER_ERRNO,
      output: expect.objectContaining({
        payload: expect.objectContaining({
          validation: expect.objectContaining({ keys: ['service'] }),
        }),
      }),
    });
  });

  it('passes the gate for an OAuthNative + recognised service (no scope), failing later in the pipeline', async () => {
    // The gate resolves scope and proceeds; the handler will then fail
    // downstream (assertion verification, no oauthDB.getClient stub,
    // etc.). We just confirm we did not throw an INVALID_PARAMETER
    // error citing scope or service.
    const resolveScopesForService = jest.fn((s: string) =>
      s === 'vpn' ? [VPN_SCOPE, 'profile'] : undefined
    );
    const route = makeRoute({
      isClientAllowedForService: () => true,
      resolveScopesForService,
    });
    try {
      await route.handler(
        makeRequest({ client_id: FIREFOX_DESKTOP, service: 'vpn' })
      );
    } catch (err: any) {
      if (err.errno === OAUTH_INVALID_PARAMETER_ERRNO) {
        const keys = err.output?.payload?.validation?.keys;
        expect(keys).not.toEqual(['scope']);
        expect(keys).not.toEqual(['service']);
      }
    }
    // Resolver invoked with withKeys=false when keys_jwe is absent.
    expect(resolveScopesForService).toHaveBeenCalledWith('vpn', false);
  });

  it('passes withKeys=true to the resolver when keys_jwe is in the payload', async () => {
    // Conditional Sync grant: user entered a password (client computed
    // keys_jwe), so the resolver should return the multi-scope set plus
    // the keys-conditional scope.
    const resolveScopesForService = jest.fn((s: string, withKeys: boolean) => {
      if (s !== 'vpn') return undefined;
      return withKeys
        ? [VPN_SCOPE, 'profile', OLDSYNC_SCOPE]
        : [VPN_SCOPE, 'profile'];
    });
    const route = makeRoute({
      isClientAllowedForService: () => true,
      resolveScopesForService,
    });
    try {
      await route.handler(
        makeRequest({
          client_id: FIREFOX_DESKTOP,
          service: 'vpn',
          keys_jwe: 'mock.jwe.payload',
        })
      );
    } catch (err: any) {
      if (err.errno === OAUTH_INVALID_PARAMETER_ERRNO) {
        const keys = err.output?.payload?.validation?.keys;
        expect(keys).not.toEqual(['scope']);
        expect(keys).not.toEqual(['service']);
      }
    }
    expect(resolveScopesForService).toHaveBeenCalledWith('vpn', true);
  });

  it('skips the gate when scope is explicitly provided, even with service for an OAuthNative client', async () => {
    // Explicit scope wins: the gate must not call any oauthDB service
    // method, and must not throw INVALID_PARAMETER for scope/service.
    const oauthDB = {
      isClientAllowedForService: jest.fn(),
      resolveScopesForService: jest.fn(),
    };
    const route = makeRoute(oauthDB);
    try {
      await route.handler(
        makeRequest({
          client_id: FIREFOX_DESKTOP,
          service: 'vpn',
          scope: ScopeSet.fromString('profile'),
        })
      );
    } catch (err: any) {
      if (err.errno === OAUTH_INVALID_PARAMETER_ERRNO) {
        const keys = err.output?.payload?.validation?.keys;
        expect(keys).not.toEqual(['scope']);
        expect(keys).not.toEqual(['service']);
      }
    }
    expect(oauthDB.isClientAllowedForService).not.toHaveBeenCalled();
    expect(oauthDB.resolveScopesForService).not.toHaveBeenCalled();
  });

  // Regression: "is this service known?" must come from
  // resolveScopesForService (oauthServer.authorization.serviceScopes),
  // not isKnownService (oauthServer.exchange.serviceScopes). The two
  // configs are separate and can drift.
  it('passes the gate when resolveScopesForService returns a scope, even if isKnownService says otherwise', async () => {
    const resolveScopesForService = jest.fn(() => [
      'https://identity.mozilla.com/apps/imaginary',
      'profile',
    ]);
    const isKnownService = jest.fn(() => false);
    const route = makeRoute({
      isKnownService,
      isClientAllowedForService: () => true,
      resolveScopesForService,
    });
    try {
      await route.handler(
        makeRequest({ client_id: FIREFOX_DESKTOP, service: 'imaginary' })
      );
    } catch (err: any) {
      if (err.errno === OAUTH_INVALID_PARAMETER_ERRNO) {
        const keys = err.output?.payload?.validation?.keys;
        expect(keys).not.toEqual(['scope']);
        expect(keys).not.toEqual(['service']);
      }
    }
    expect(resolveScopesForService).toHaveBeenCalledWith('imaginary', false);
    expect(isKnownService).not.toHaveBeenCalled();
  });

  it('rejects with invalid_request_parameter(scope) when both scope and service are absent', async () => {
    const route = makeRoute({});
    await expect(
      route.handler(makeRequest({ client_id: FIREFOX_DESKTOP }))
    ).rejects.toMatchObject({
      errno: OAUTH_INVALID_PARAMETER_ERRNO,
      output: expect.objectContaining({
        payload: expect.objectContaining({
          validation: expect.objectContaining({ keys: ['scope'] }),
        }),
      }),
    });
  });
});

describe('isLocalHost', () => {
  const { isLocalHost } = require('./authorization');

  it.each([
    'http://localhost',
    'http://localhost:8080',
    'http://localhost/callback',
    'http://127.0.0.1',
    'http://127.0.0.1:3030/callback',
    'http://[::1]',
    'http://[::1]:8080/callback',
    'http://localhost.', // trailing-dot FQDN form
  ])('accepts the loopback redirect %s', (uri) => {
    expect(isLocalHost(uri)).toBe(true);
  });

  it.each([
    'https://localhost.attacker.com',
    'https://127.0.0.1.attacker.com',
    'https://evil.localhost',
    'https://127.0.0.1@attacker.com', // userinfo trick resolves to attacker.com
    'https://attacker.com',
    'http://0.0.0.0', // wildcard/unspecified is not loopback
  ])('rejects the non-loopback redirect %s', (uri) => {
    expect(isLocalHost(uri)).toBe(false);
  });
});

describe('isPairingAuthorization', () => {
  const { isPairingAuthorization } = require('./authorization');
  const {
    parseToScalars,
  } = require('fxa-shared/lib/user-agent');

  // Real user agents, captured from physical devices in FXA-10427. Driven
  // through the actual parser rather than hand-built scalars, because the bug
  // this guards against was an assumption about what the parser returns.
  const UA = {
    macFirefox:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:132.0) Gecko/20100101 Firefox/132.0',
    windowsFirefox:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0',
    macSafari:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15',
    ipadFirefox:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15',
    ipadSafari:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Safari/605.1.15',
    iphoneFirefox:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/130.1 Mobile/15E148 Safari/605.1.15',
    androidFirefox:
      'Mozilla/5.0 (Android 13; Mobile; rv:133.0) Gecko/133.0 Firefox/133.0',
    androidTabletFirefox:
      'Mozilla/5.0 (Android 13; Tablet; rv:133.0) Gecko/133.0 Firefox/133.0',
  };

  const request = (userAgent: string) => ({
    app: { ua: parseToScalars(userAgent) },
  });

  describe('a code minted for a mobile client', () => {
    it.each([
      ['macOS', UA.macFirefox],
      ['Windows', UA.windowsFirefox],
    ])('counts a desktop Firefox authority on %s', (_os, userAgent) => {
      expect(
        isPairingAuthorization(request(userAgent), OAuthNativeClients.Fenix)
      ).toBe(true);
    });

    // The app signing in directly, which reaches this endpoint with the very
    // same client_id. Only the user agent tells them apart.
    it.each([
      ['Firefox on Android', UA.androidFirefox],
      ['Firefox on an Android tablet', UA.androidTabletFirefox],
      ['Firefox on iPhone', UA.iphoneFirefox],
    ])('ignores %s signing in for itself', (_name, userAgent) => {
      expect(
        isPairingAuthorization(request(userAgent), OAuthNativeClients.Fenix)
      ).toBe(false);
    });

    // The reason this is a positive test for desktop Firefox. iPad Firefox sends
    // a Mac UA with no FxiOS token, so it parses as neither mobile nor tablet
    // and is indistinguishable from MacBook Safari (FXA-10427). A "not mobile"
    // test would have counted these as pairings.
    it.each([
      ['iPad Firefox', UA.ipadFirefox],
      ['iPad Safari', UA.ipadSafari],
      ['MacBook Safari', UA.macSafari],
    ])('ignores %s, which reads as a desktop UA', (_name, userAgent) => {
      expect(
        isPairingAuthorization(request(userAgent), OAuthNativeClients.FirefoxIOS)
      ).toBe(false);
    });

    it('accepts an uppercase client id', () => {
      expect(
        isPairingAuthorization(
          request(UA.macFirefox),
          OAuthNativeClients.Fenix.toUpperCase()
        )
      ).toBe(true);
    });

    it('tolerates a missing user agent', () => {
      expect(
        isPairingAuthorization({ app: {} }, OAuthNativeClients.Fenix)
      ).toBe(false);
    });
  });

  describe('a code minted for any other client', () => {
    it.each([
      ['Firefox Desktop', OAuthNativeClients.FirefoxDesktop],
      ['Thunderbird', OAuthNativeClients.Thunderbird],
      ['a web relying party', 'dcdb5ae7add825d2'],
    ])('ignores one for %s', (_name, clientId) => {
      expect(isPairingAuthorization(request(UA.macFirefox), clientId)).toBe(
        false
      );
    });
  });
});

describe('/authorization POST redirect_uri validation', () => {
  const UID_HEX = 'a'.repeat(32);
  const REGISTERED_URI = 'https://example.com/redirect';

  async function runRedirect(opts: {
    localRedirects: boolean;
    redirect_uri: string;
  }) {
    let error: any;
    await jest.isolateModulesAsync(async () => {
      jest.doMock('../../oauth/assertion', () =>
        jest.fn(async () => ({ uid: UID_HEX }))
      );
      jest.doMock('../../oauth/grant', () => ({
        validateRequestedGrant: jest.fn(async () => ({
          clientId: Buffer.from(CLIENT_ID, 'hex'),
          userId: Buffer.from(UID_HEX, 'hex'),
          scope: { getScopeValues: () => ['profile'] },
          offline: true,
        })),
        generateTokens: jest.fn(async () => ({})),
      }));
      const routes = require('./authorization')({
        glean: mockGlean,
        log: mockLog,
        oauthDB: {
          getClient: jest.fn(async () => ({
            canGrant: true,
            publicClient: false,
            redirectUri: REGISTERED_URI,
            id: Buffer.from(CLIENT_ID, 'hex'),
          })),
          generateCode: jest.fn(async () => 'code-xyz'),
          recordSignInConsents: jest.fn().mockResolvedValue(undefined),
          hasConsentForClient: jest.fn().mockResolvedValue(true),
        },
        config: {
          ...baseConfig,
          oauthServer: {
            ...baseConfig.oauthServer,
            localRedirects: opts.localRedirects,
          },
        },
      });
      try {
        await routes[1].config.handler({
          headers: {},
          app: {},
          payload: {
            client_id: CLIENT_ID,
            assertion: BASE64URL_STRING,
            state: 'foo',
            scope: 'profile',
            response_type: 'code',
            redirect_uri: opts.redirect_uri,
          },
        });
      } catch (err) {
        error = err;
      }
    });
    return error;
  }

  it('allows an unregistered loopback redirect when localRedirects is true', async () => {
    const error = await runRedirect({
      localRedirects: true,
      redirect_uri: 'http://127.0.0.1:8080/callback',
    });
    expect(error).toBeUndefined();
  });

  it('rejects an unregistered loopback redirect when localRedirects is false', async () => {
    const error = await runRedirect({
      localRedirects: false,
      redirect_uri: 'http://127.0.0.1:8080/callback',
    });
    expect(error).toMatchObject({ errno: 103 });
  });

  it('rejects a loopback look-alike redirect even when localRedirects is true', async () => {
    const error = await runRedirect({
      localRedirects: true,
      redirect_uri: 'https://127.0.0.1.attacker.com/callback',
    });
    expect(error).toMatchObject({ errno: 103 });
  });

  it.each([true, false])(
    'accepts an exactly-registered redirect when localRedirects is %s',
    async (localRedirects) => {
      const error = await runRedirect({
        localRedirects,
        redirect_uri: REGISTERED_URI,
      });
      expect(error).toBeUndefined();
    }
  );
});
