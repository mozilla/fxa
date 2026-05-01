/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const ScopeSet = require('fxa-shared').oauth.scopes;

const { config } = require('../../config');
import {
  getAuthorizationScope,
  getServiceNameForScope,
  shouldBypassAuthCheck,
  validateBrowserServicesConfig,
  recordAuthorizationOnLogin,
  touchAuthorizationsForRefresh,
  __resetForTests,
} from './browser-services';

const RELAY_SCOPE = 'https://identity.mozilla.com/apps/relay';
const SYNC_SCOPE = 'https://identity.mozilla.com/apps/oldsync';
const SMARTWINDOW_SCOPE = 'https://identity.mozilla.com/apps/smartwindow';

const RELAY_PROD_CLIENT = '9ebfe2c2f9ea3c58';
const RELAY_STAGE_CLIENT = '41b4363ae36440a9';
const FIREFOX_DESKTOP_CLIENT = '5882386c6d801776';
const UNKNOWN_CLIENT = 'deadbeefdeadbeef';

const validConfig = {
  relay: {
    displayName: 'Firefox Relay',
    authorizationScope: RELAY_SCOPE,
    clientIds: [RELAY_PROD_CLIENT, RELAY_STAGE_CLIENT],
    serviceParams: ['relay'],
    retentionDays: 1095,
    allowSilentExchange: true,
  },
  smartwindow: {
    displayName: 'Smart Window',
    authorizationScope: SMARTWINDOW_SCOPE,
    clientIds: [],
    serviceParams: ['smartwindow'],
    retentionDays: 1095,
    allowSilentExchange: true,
  },
  sync: {
    displayName: 'Firefox Sync',
    authorizationScope: SYNC_SCOPE,
    clientIds: [FIREFOX_DESKTOP_CLIENT],
    serviceParams: ['sync'],
    retentionDays: 1095,
    allowSilentExchange: false,
  },
};

describe('browser-services helper', () => {
  let originalGet: any;

  beforeEach(() => {
    __resetForTests();
    originalGet = config.get;
    config.get = (key: string) => {
      if (key === 'oauthServer.browserServices') return validConfig;
      return originalGet.call(config, key);
    };
  });

  afterEach(() => {
    config.get = originalGet;
    __resetForTests();
  });

  describe('getAuthorizationScope', () => {
    it('matches by scope and returns the full resolution', () => {
      const r = getAuthorizationScope(undefined, undefined, RELAY_SCOPE);
      expect(r).toEqual({
        name: 'relay',
        authorizationScope: RELAY_SCOPE,
        allowSilentExchange: true,
      });
    });

    it('accepts a multi-value ScopeSet', () => {
      const scope = ScopeSet.fromArray(['profile', RELAY_SCOPE]);
      expect(getAuthorizationScope(undefined, undefined, scope)?.name).toBe(
        'relay'
      );
    });

    it('matches by clientId case-insensitively when scope is unset', () => {
      const r = getAuthorizationScope(
        RELAY_PROD_CLIENT.toUpperCase(),
        undefined,
        undefined
      );
      expect(r?.name).toBe('relay');
    });

    it('matches by serviceParam when other inputs miss', () => {
      expect(
        getAuthorizationScope(UNKNOWN_CLIENT, 'sync', undefined)?.name
      ).toBe('sync');
    });

    it('prefers scope > clientId > serviceParam', () => {
      // scope wins over clientId
      expect(
        getAuthorizationScope(FIREFOX_DESKTOP_CLIENT, undefined, RELAY_SCOPE)
          ?.name
      ).toBe('relay');
      // clientId wins over serviceParam
      expect(
        getAuthorizationScope(RELAY_PROD_CLIENT, 'sync', undefined)?.name
      ).toBe('relay');
    });

    it('returns null when nothing matches', () => {
      expect(
        getAuthorizationScope(UNKNOWN_CLIENT, 'unknown', 'unknown')
      ).toBeNull();
      expect(getAuthorizationScope()).toBeNull();
    });
  });

  describe('getServiceNameForScope', () => {
    it('returns the service name for a configured scope', () => {
      expect(getServiceNameForScope(RELAY_SCOPE)).toBe('relay');
    });

    it('returns null for an unknown scope', () => {
      expect(getServiceNameForScope('https://example.com/unknown')).toBeNull();
    });
  });

  describe('shouldBypassAuthCheck', () => {
    it('returns true only for Relay', () => {
      expect(
        shouldBypassAuthCheck(
          getAuthorizationScope(undefined, undefined, RELAY_SCOPE)
        )
      ).toBe(true);
      expect(
        shouldBypassAuthCheck(
          getAuthorizationScope(undefined, undefined, SYNC_SCOPE)
        )
      ).toBe(false);
      expect(shouldBypassAuthCheck(null)).toBe(false);
    });
  });
});

describe('recordAuthorizationOnLogin', () => {
  let originalGet: any;

  beforeEach(() => {
    __resetForTests();
    originalGet = config.get;
    config.get = (key: string) => {
      if (key === 'oauthServer.browserServices') return validConfig;
      return originalGet.call(config, key);
    };
  });

  afterEach(() => {
    config.get = originalGet;
    __resetForTests();
  });

  it('upserts when scope resolves to a configured service', async () => {
    const oauthDB = { upsertAccountAuthorization: jest.fn() };
    await recordAuthorizationOnLogin(oauthDB, undefined, {
      uid: 'abc',
      clientId: RELAY_PROD_CLIENT,
      scope: ScopeSet.fromArray([RELAY_SCOPE]),
    });
    expect(oauthDB.upsertAccountAuthorization).toHaveBeenCalledWith(
      'abc',
      RELAY_SCOPE,
      'relay',
      expect.any(Number),
      expect.any(Number)
    );
  });

  it('writes one row per matching scope when several apply', async () => {
    const oauthDB = { upsertAccountAuthorization: jest.fn() };
    await recordAuthorizationOnLogin(oauthDB, undefined, {
      uid: 'abc',
      clientId: FIREFOX_DESKTOP_CLIENT,
      scope: ScopeSet.fromArray(['profile', SYNC_SCOPE, RELAY_SCOPE]),
    });
    expect(oauthDB.upsertAccountAuthorization).toHaveBeenCalledTimes(2);
    expect(oauthDB.upsertAccountAuthorization).toHaveBeenCalledWith(
      'abc',
      SYNC_SCOPE,
      'sync',
      expect.any(Number),
      expect.any(Number)
    );
    expect(oauthDB.upsertAccountAuthorization).toHaveBeenCalledWith(
      'abc',
      RELAY_SCOPE,
      'relay',
      expect.any(Number),
      expect.any(Number)
    );
  });

  it('falls back to clientId when scope has no configured matches', async () => {
    const oauthDB = { upsertAccountAuthorization: jest.fn() };
    await recordAuthorizationOnLogin(oauthDB, undefined, {
      uid: 'abc',
      clientId: RELAY_PROD_CLIENT,
      scope: ScopeSet.fromArray(['profile']),
    });
    expect(oauthDB.upsertAccountAuthorization).toHaveBeenCalledTimes(1);
    expect(oauthDB.upsertAccountAuthorization).toHaveBeenCalledWith(
      'abc',
      RELAY_SCOPE,
      'relay',
      expect.any(Number),
      expect.any(Number)
    );
  });

  it('no-op when nothing resolves', async () => {
    const oauthDB = { upsertAccountAuthorization: jest.fn() };
    await recordAuthorizationOnLogin(oauthDB, undefined, {
      uid: 'abc',
      clientId: UNKNOWN_CLIENT,
      scope: ScopeSet.fromArray(['profile']),
    });
    expect(oauthDB.upsertAccountAuthorization).not.toHaveBeenCalled();
  });

  it('swallows DB errors', async () => {
    const log = { warn: jest.fn() };
    const oauthDB = {
      upsertAccountAuthorization: jest.fn(async () => {
        throw new Error('boom');
      }),
    };
    await expect(
      recordAuthorizationOnLogin(oauthDB, log, {
        uid: 'abc',
        clientId: RELAY_PROD_CLIENT,
        scope: RELAY_SCOPE,
      })
    ).resolves.toBeUndefined();
    expect(log.warn).toHaveBeenCalledWith(
      'accountAuthorizations.upsertFailed',
      expect.objectContaining({ err: 'boom' })
    );
  });
});

describe('touchAuthorizationsForRefresh', () => {
  let originalGet: any;

  beforeEach(() => {
    __resetForTests();
    originalGet = config.get;
    config.get = (key: string) => {
      if (key === 'oauthServer.browserServices') return validConfig;
      return originalGet.call(config, key);
    };
  });

  afterEach(() => {
    config.get = originalGet;
    __resetForTests();
  });

  it('touches each matching scope in the ScopeSet', async () => {
    const oauthDB = { touchAccountAuthorization: jest.fn() };
    await touchAuthorizationsForRefresh(oauthDB, undefined, {
      uid: 'abc',
      scope: ScopeSet.fromArray([RELAY_SCOPE, SYNC_SCOPE, 'profile']),
      now: 1000,
    });
    expect(oauthDB.touchAccountAuthorization).toHaveBeenCalledTimes(2);
    expect(oauthDB.touchAccountAuthorization).toHaveBeenCalledWith(
      'abc',
      RELAY_SCOPE,
      'relay',
      1000
    );
    expect(oauthDB.touchAccountAuthorization).toHaveBeenCalledWith(
      'abc',
      SYNC_SCOPE,
      'sync',
      1000
    );
  });

  it('no-op when no scope values match', async () => {
    const oauthDB = { touchAccountAuthorization: jest.fn() };
    await touchAuthorizationsForRefresh(oauthDB, undefined, {
      uid: 'abc',
      scope: ScopeSet.fromArray(['profile', 'openid']),
    });
    expect(oauthDB.touchAccountAuthorization).not.toHaveBeenCalled();
  });

  it('swallows DB errors', async () => {
    const log = { warn: jest.fn() };
    const oauthDB = {
      touchAccountAuthorization: jest.fn(async () => {
        throw new Error('boom');
      }),
    };
    await expect(
      touchAuthorizationsForRefresh(oauthDB, log, {
        uid: 'abc',
        scope: ScopeSet.fromArray([RELAY_SCOPE]),
      })
    ).resolves.toBeUndefined();
    expect(log.warn).toHaveBeenCalledWith(
      'accountAuthorizations.touchFailed',
      expect.objectContaining({ err: 'boom' })
    );
  });
});

describe('validateBrowserServicesConfig', () => {
  it('accepts a well-formed config', () => {
    expect(() => validateBrowserServicesConfig(validConfig)).not.toThrow();
  });

  it('accepts a clientId shared across services', () => {
    // Firefox Desktop legitimately mints tokens for multiple services, so
    // its clientId can appear in more than one entry.
    const shared = {
      ...validConfig,
      smartwindow: {
        ...validConfig.smartwindow,
        clientIds: [RELAY_PROD_CLIENT],
      },
    };
    expect(() => validateBrowserServicesConfig(shared)).not.toThrow();
  });

  it('throws on duplicate serviceParam across services', () => {
    const bad = {
      ...validConfig,
      smartwindow: { ...validConfig.smartwindow, serviceParams: ['relay'] },
    };
    expect(() => validateBrowserServicesConfig(bad)).toThrow(
      /serviceParam "relay" already claimed/
    );
  });

  it('throws on duplicate authorizationScope across services', () => {
    const bad = {
      ...validConfig,
      smartwindow: {
        ...validConfig.smartwindow,
        authorizationScope: RELAY_SCOPE,
      },
    };
    expect(() => validateBrowserServicesConfig(bad)).toThrow(
      /authorizationScope .* already claimed/
    );
  });

  it('throws when authorizationScope is not HTTPS', () => {
    const bad = {
      relay: { ...validConfig.relay, authorizationScope: 'http://insecure' },
    };
    expect(() => validateBrowserServicesConfig(bad)).toThrow(
      /authorizationScope must be an HTTPS URL/
    );
  });

  it('throws on malformed clientId', () => {
    const bad = {
      relay: { ...validConfig.relay, clientIds: ['notHex'] },
    };
    expect(() => validateBrowserServicesConfig(bad)).toThrow(
      /invalid clientId/
    );
  });

  it('throws when retentionDays is missing or non-positive', () => {
    const bad = { relay: { ...validConfig.relay, retentionDays: 0 } } as any;
    expect(() => validateBrowserServicesConfig(bad)).toThrow(
      /retentionDays must be a positive number/
    );
  });

  it('throws when allowSilentExchange is not a boolean', () => {
    const bad = {
      relay: { ...validConfig.relay, allowSilentExchange: 'yes' },
    } as any;
    expect(() => validateBrowserServicesConfig(bad)).toThrow(
      /allowSilentExchange must be a boolean/
    );
  });
});
