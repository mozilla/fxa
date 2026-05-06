/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ScopeSet from 'fxa-shared/oauth/scopes';
import { config } from '../../config';
import {
  getAuthorizationScope,
  getServiceNameForScope,
  shouldBypassAuthCheck,
  validateBrowserServicesConfig,
  recordAuthorizationOnLogin,
  __resetForTests,
} from './browser-services';

const RELAY_SCOPE = 'https://identity.mozilla.com/apps/relay';
const SYNC_SCOPE = 'https://identity.mozilla.com/apps/oldsync';
const SMARTWINDOW_SCOPE = 'https://identity.mozilla.com/apps/smartwindow';

const RELAY_PROD_CLIENT = '9ebfe2c2f9ea3c58';
const RELAY_STAGE_CLIENT = '41b4363ae36440a9';
const FIREFOX_DESKTOP_CLIENT = '5882386c6d801776';
const FIREFOX_IOS_CLIENT = '1b1a3e44c54fbb58';
const UNKNOWN_CLIENT = 'deadbeefdeadbeef';

const validConfig = {
  relay: {
    displayName: 'Firefox Relay',
    authorizationScope: RELAY_SCOPE,
    clientIds: [RELAY_PROD_CLIENT, RELAY_STAGE_CLIENT, FIREFOX_IOS_CLIENT],
    serviceParams: ['relay'],
    allowSilentExchange: true,
  },
  smartwindow: {
    displayName: 'Smart Window',
    authorizationScope: SMARTWINDOW_SCOPE,
    clientIds: [FIREFOX_DESKTOP_CLIENT],
    serviceParams: ['smartwindow'],
    allowSilentExchange: true,
  },
  sync: {
    displayName: 'Firefox Sync',
    authorizationScope: SYNC_SCOPE,
    clientIds: [FIREFOX_DESKTOP_CLIENT, FIREFOX_IOS_CLIENT],
    serviceParams: ['sync'],
    allowSilentExchange: false,
  },
};

describe('browser-services helper', () => {
  let originalGet: any;

  beforeEach(() => {
    __resetForTests();
    originalGet = config.get;
    config.get = (key: string) => {
      if (key === 'oauthServer.browserServices') {
        return validConfig;
      }
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
      if (key === 'oauthServer.browserServices') {
        return validConfig;
      }
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
      expect.any(Number)
    );
  });

  it('writes one row per matching scope when several apply (non-ambiguous clientId)', async () => {
    // iOS bundles oldsync + relay at sign-in and is registered for both
    // services. Per-scope writes happen with clientId-membership guard.
    const oauthDB = { upsertAccountAuthorization: jest.fn() };
    await recordAuthorizationOnLogin(oauthDB, undefined, {
      uid: 'abc',
      clientId: FIREFOX_IOS_CLIENT,
      scope: ScopeSet.fromArray(['profile', SYNC_SCOPE, RELAY_SCOPE]),
    });
    expect(oauthDB.upsertAccountAuthorization).toHaveBeenCalledTimes(2);
    expect(oauthDB.upsertAccountAuthorization).toHaveBeenCalledWith(
      'abc',
      SYNC_SCOPE,
      'sync',
      expect.any(Number)
    );
    expect(oauthDB.upsertAccountAuthorization).toHaveBeenCalledWith(
      'abc',
      RELAY_SCOPE,
      'relay',
      expect.any(Number)
    );
  });

  it('skips a service whose scope is in the request but whose clientId list does not include the caller', async () => {
    // Use a non-ambiguous clientId only in sync.clientIds. The Relay scope
    // is requested but the clientId-membership guard skips the relay row.
    __resetForTests();
    const syncOnlyMobileConfig = {
      ...validConfig,
      relay: {
        ...validConfig.relay,
        clientIds: [RELAY_PROD_CLIENT, RELAY_STAGE_CLIENT],
      },
    };
    config.get = (key: string) => {
      if (key === 'oauthServer.browserServices') {
        return syncOnlyMobileConfig;
      }
      return originalGet.call(config, key);
    };
    const oauthDB = { upsertAccountAuthorization: jest.fn() };
    await recordAuthorizationOnLogin(oauthDB, undefined, {
      uid: 'abc',
      clientId: FIREFOX_IOS_CLIENT,
      scope: ScopeSet.fromArray([SYNC_SCOPE, RELAY_SCOPE]),
    });
    expect(oauthDB.upsertAccountAuthorization).toHaveBeenCalledTimes(1);
    expect(oauthDB.upsertAccountAuthorization).toHaveBeenCalledWith(
      'abc',
      SYNC_SCOPE,
      'sync',
      expect.any(Number)
    );
  });

  describe('service-ambiguous clientIds (Firefox Desktop)', () => {
    it('records both the serviceParam row and any other configured scope on the wire', async () => {
      // Smart Window flow: service=smartwindow with oldsync also requested
      // for opportunistic scoped-key fetch. Both rows should land.
      const oauthDB = { upsertAccountAuthorization: jest.fn() };
      await recordAuthorizationOnLogin(oauthDB, undefined, {
        uid: 'abc',
        clientId: FIREFOX_DESKTOP_CLIENT,
        scope: ScopeSet.fromArray([SYNC_SCOPE, 'profile']),
        serviceParam: 'smartwindow',
      });
      expect(oauthDB.upsertAccountAuthorization).toHaveBeenCalledTimes(2);
      expect(oauthDB.upsertAccountAuthorization).toHaveBeenCalledWith(
        'abc',
        SMARTWINDOW_SCOPE,
        'smartwindow',
        expect.any(Number)
      );
      expect(oauthDB.upsertAccountAuthorization).toHaveBeenCalledWith(
        'abc',
        SYNC_SCOPE,
        'sync',
        expect.any(Number)
      );
    });

    it('writes only the smartwindow row when no other browser-service scope is on the wire', async () => {
      const oauthDB = { upsertAccountAuthorization: jest.fn() };
      await recordAuthorizationOnLogin(oauthDB, undefined, {
        uid: 'abc',
        clientId: FIREFOX_DESKTOP_CLIENT,
        scope: ScopeSet.fromArray(['profile']),
        serviceParam: 'smartwindow',
      });
      expect(oauthDB.upsertAccountAuthorization).toHaveBeenCalledTimes(1);
      expect(oauthDB.upsertAccountAuthorization).toHaveBeenCalledWith(
        'abc',
        SMARTWINDOW_SCOPE,
        'smartwindow',
        expect.any(Number)
      );
    });

    it('writes the sync row when serviceParam=sync, deduping against the wire scope', async () => {
      const oauthDB = { upsertAccountAuthorization: jest.fn() };
      await recordAuthorizationOnLogin(oauthDB, undefined, {
        uid: 'abc',
        clientId: FIREFOX_DESKTOP_CLIENT,
        scope: ScopeSet.fromArray([SYNC_SCOPE, 'profile']),
        serviceParam: 'sync',
      });
      expect(oauthDB.upsertAccountAuthorization).toHaveBeenCalledTimes(1);
      expect(oauthDB.upsertAccountAuthorization).toHaveBeenCalledWith(
        'abc',
        SYNC_SCOPE,
        'sync',
        expect.any(Number)
      );
    });

    it('records rows from the wire scope even when serviceParam is missing', async () => {
      // Desktop sign-in with oldsync but no service= param: still record
      // the sync row because the clientId is configured for sync.
      const oauthDB = { upsertAccountAuthorization: jest.fn() };
      await recordAuthorizationOnLogin(oauthDB, undefined, {
        uid: 'abc',
        clientId: FIREFOX_DESKTOP_CLIENT,
        scope: ScopeSet.fromArray([SYNC_SCOPE]),
      });
      expect(oauthDB.upsertAccountAuthorization).toHaveBeenCalledTimes(1);
      expect(oauthDB.upsertAccountAuthorization).toHaveBeenCalledWith(
        'abc',
        SYNC_SCOPE,
        'sync',
        expect.any(Number)
      );
    });

    it('writes nothing when neither serviceParam nor a configured scope is on the wire', async () => {
      const oauthDB = { upsertAccountAuthorization: jest.fn() };
      await recordAuthorizationOnLogin(oauthDB, undefined, {
        uid: 'abc',
        clientId: FIREFOX_DESKTOP_CLIENT,
        scope: ScopeSet.fromArray(['profile']),
      });
      expect(oauthDB.upsertAccountAuthorization).not.toHaveBeenCalled();
    });

    it('warns on unknown serviceParam but still records wire-scope rows', async () => {
      const log = { warn: jest.fn() };
      const oauthDB = { upsertAccountAuthorization: jest.fn() };
      await recordAuthorizationOnLogin(oauthDB, log, {
        uid: 'abc',
        clientId: FIREFOX_DESKTOP_CLIENT,
        scope: ScopeSet.fromArray([SYNC_SCOPE]),
        serviceParam: 'garbage',
      });
      expect(log.warn).toHaveBeenCalledWith(
        'accountAuthorizations.unknownServiceParam',
        expect.objectContaining({
          serviceParam: 'garbage',
          clientId: FIREFOX_DESKTOP_CLIENT,
        })
      );
      expect(oauthDB.upsertAccountAuthorization).toHaveBeenCalledTimes(1);
      expect(oauthDB.upsertAccountAuthorization).toHaveBeenCalledWith(
        'abc',
        SYNC_SCOPE,
        'sync',
        expect.any(Number)
      );
    });

    it('skips the serviceParam row when its service does not list this clientId, but still records wire-scope rows', async () => {
      // Desktop is not in relay.clientIds in the test config; service=relay
      // does not plant a relay row, but the oldsync scope still lands the
      // sync row because Desktop is in sync.clientIds.
      const oauthDB = { upsertAccountAuthorization: jest.fn() };
      await recordAuthorizationOnLogin(oauthDB, undefined, {
        uid: 'abc',
        clientId: FIREFOX_DESKTOP_CLIENT,
        scope: ScopeSet.fromArray([SYNC_SCOPE]),
        serviceParam: 'relay',
      });
      expect(oauthDB.upsertAccountAuthorization).toHaveBeenCalledTimes(1);
      expect(oauthDB.upsertAccountAuthorization).toHaveBeenCalledWith(
        'abc',
        SYNC_SCOPE,
        'sync',
        expect.any(Number)
      );
    });
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
      expect.any(Number)
    );
  });

  it('does not write a row when clientId is not a recognized minter for the requested scope', async () => {
    // Repro: a non-Firefox RP requests Relay scope (e.g. via local diff that
    // strips upstream allowlist checks). Scope alone must not authorize a
    // row for a service the clientId does not represent.
    const oauthDB = { upsertAccountAuthorization: jest.fn() };
    await recordAuthorizationOnLogin(oauthDB, undefined, {
      uid: 'abc',
      clientId: UNKNOWN_CLIENT,
      scope: ScopeSet.fromArray([RELAY_SCOPE]),
    });
    expect(oauthDB.upsertAccountAuthorization).not.toHaveBeenCalled();
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

  it('emits attempt and success metrics tagged by service', async () => {
    const statsd = { increment: jest.fn() };
    const oauthDB = { upsertAccountAuthorization: jest.fn() };
    await recordAuthorizationOnLogin(oauthDB, undefined, {
      uid: 'abc',
      clientId: RELAY_PROD_CLIENT,
      scope: ScopeSet.fromArray([RELAY_SCOPE]),
      statsd,
    });
    expect(statsd.increment).toHaveBeenCalledWith(
      'account_authz.upsert.attempt',
      { service: 'relay' }
    );
    expect(statsd.increment).toHaveBeenCalledWith(
      'account_authz.upsert.success',
      { service: 'relay' }
    );
  });

  it('emits write.skipped{no_targets} when nothing resolves', async () => {
    const statsd = { increment: jest.fn() };
    const oauthDB = { upsertAccountAuthorization: jest.fn() };
    await recordAuthorizationOnLogin(oauthDB, undefined, {
      uid: 'abc',
      clientId: UNKNOWN_CLIENT,
      scope: ScopeSet.fromArray(['profile']),
      statsd,
    });
    expect(statsd.increment).toHaveBeenCalledWith(
      'account_authz.write.skipped',
      { reason: 'no_targets' }
    );
    expect(statsd.increment).not.toHaveBeenCalledWith(
      'account_authz.upsert.attempt',
      expect.anything()
    );
  });

  it('emits error metric tagged by service when DB upsert fails', async () => {
    const statsd = { increment: jest.fn() };
    const oauthDB = {
      upsertAccountAuthorization: jest.fn(async () => {
        throw new Error('boom');
      }),
    };
    await recordAuthorizationOnLogin(oauthDB, undefined, {
      uid: 'abc',
      clientId: RELAY_PROD_CLIENT,
      scope: ScopeSet.fromArray([RELAY_SCOPE]),
      statsd,
    });
    expect(statsd.increment).toHaveBeenCalledWith(
      'account_authz.upsert.error',
      { service: 'relay' }
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

  it('throws when allowSilentExchange is not a boolean', () => {
    const bad = {
      relay: { ...validConfig.relay, allowSilentExchange: 'yes' },
    } as any;
    expect(() => validateBrowserServicesConfig(bad)).toThrow(
      /allowSilentExchange must be a boolean/
    );
  });
});
