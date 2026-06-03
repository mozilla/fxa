/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('joi');
const ScopeSet = require('fxa-shared').oauth.scopes;

const CLIENT_ID = '98e6508e88680e1b';
const BASE64URL_STRING =
  'TG9yZW0gSXBzdW0gaXMgc2ltcGx5IGR1bW15IHRleHQgb2YgdGhlIHByaW50aW5nIGFuZCB0eXBlc2V0dGluZyBpbmR1c3RyeS4gTG9yZW0gSXBzdW0gaGFzIGJlZW4gdGhlIGluZHVzdHJ5J3Mgc3RhbmRhcmQgZHVtbXkgdGV4dCBldmVyIHNpbmNlIHRoZSAxNTAwcywgd2hlbiBhbiB1bmtub3duIHByaW50ZXIgdG9vayBhIGdhbGxleSBvZiB0eXBlIGFuZCBzY3JhbWJsZWQgaXQgdG8gbWFrZSBhIHR5cGUgc3BlY2ltZW4gYm9v';
const PKCE_CODE_CHALLENGE = 'iyW5ScKr22v_QL-rcW_EGlJrDSOymJvrlXlw4j7JBiQ';
const PKCE_CODE_CHALLENGE_METHOD = 'S256';
const DISABLED_CLIENT_ID = 'd15ab1edd15ab1ed';

const noop = () => {};

const SERVICES_WITH_EMAIL_VERIFICATION_CLIENT = '32aaeb6f1c21316a';

const mockLog = { info: noop, debug: noop, warn: noop };

const baseConfig = {
  oauthServer: {
    expiration: { accessToken: 3600000 },
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
  log: mockLog,
  oauthDB: {},
})[1];

const configuredRoute = require('./authorization')({
  log: mockLog,
  oauthDB: {},
  config: baseConfig,
})[1];

const sessionTokenRoute = require('./authorization')({
  log: { ...mockLog, notifyAttachedServices: noop },
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
      recordSignInConsent: jest.fn().mockResolvedValue(undefined),
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
  }) {
    let routes: any;
    await jest.isolateModulesAsync(async () => {
      jest.doMock('../../oauth/assertion', () =>
        jest.fn(async () => ({ uid: UID_HEX }))
      );
      jest.doMock('../../oauth/grant', () => ({
        validateRequestedGrant: jest.fn(async (_claims, _client, payload) => ({
          clientId: Buffer.from(CLIENT_ID, 'hex'),
          userId: Buffer.from(UID_HEX, 'hex'),
          scope: {
            getScopeValues: () =>
              (payload.scope as string).split(/\s+/).filter(Boolean),
          },
          offline: payload.access_type !== 'online',
        })),
        generateTokens: jest.fn(async () => ({})),
      }));
      routes = require('./authorization')({
        log: opts.log ?? mockLog,
        oauthDB: opts.oauthDB,
        config: baseConfig,
        statsd: opts.statsd,
      });
      await routes[1].config.handler({
        headers: {},
        payload: buildPayload(opts.payload),
      });
    });
  }

  it('writes one row per requested scope plus the service canonical and consults the allowlist', async () => {
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
    expect(oauthDB.recordSignInConsent).toHaveBeenCalledTimes(3);
    const scopes = (oauthDB.recordSignInConsent as jest.Mock).mock.calls
      .map(([arg]) => arg.scope)
      .sort();
    expect(scopes).toEqual([SYNC_SCOPE, 'openid', 'profile']);
    expect(oauthDB.recordSignInConsent).toHaveBeenCalledWith(
      expect.objectContaining({
        uid: UID_HEX,
        service: 'sync',
        clientId: CLIENT_ID,
      })
    );
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

    expect(oauthDB.recordSignInConsent).toHaveBeenCalledWith(
      expect.objectContaining({ scope: 'profile', service: '' })
    );
  });

  it('swallows recordSignInConsent failures and emits write_failed', async () => {
    const oauthDB = buildOauthDB({
      recordSignInConsent: jest.fn().mockRejectedValue(new Error('db down')),
    });
    const log = { ...mockLog, warn: jest.fn() };
    const statsd = { increment: jest.fn() };

    await runHandler({ oauthDB, log, statsd, payload: { scope: 'profile' } });

    expect(log.warn).toHaveBeenCalledWith(
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

    expect(oauthDB.recordSignInConsent).not.toHaveBeenCalled();
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

    expect(oauthDB.recordSignInConsent).not.toHaveBeenCalled();
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
    expect(oauthDB.recordSignInConsent).toHaveBeenCalledWith(
      expect.objectContaining({ scope: VPN_SCOPE, service: 'vpn' })
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

    expect(oauthDB.recordSignInConsent).not.toHaveBeenCalled();
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

    expect(oauthDB.recordSignInConsent).toHaveBeenCalledTimes(3);
    const calls = (oauthDB.recordSignInConsent as jest.Mock).mock.calls.map(
      ([arg]) => ({ scope: arg.scope, service: arg.service })
    );
    expect(calls).toEqual(
      expect.arrayContaining([
        { scope: VPN_SCOPE, service: 'vpn' },
        { scope: 'profile', service: 'vpn' },
        // apps/oldsync's canonical owner is 'sync', but the row is
        // currently keyed to the URL service='vpn'. FXA-13874 tracks
        // changing this so it's keyed to 'sync' instead.
        { scope: SYNC_SCOPE, service: 'vpn' },
      ])
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
      log: { ...mockLog, notifyAttachedServices: noop },
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
