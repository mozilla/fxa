/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import fxaShared from 'fxa-shared';

import {
  shouldExcludeFromDau,
  ScopeSetLike,
  VpnDauOauthDB,
  VpnDauPolicy,
  VpnDauRedis,
} from './vpn-dau';

const ScopeSet = (
  fxaShared as { oauth: { scopes: { fromArray(v: string[]): ScopeSetLike } } }
).oauth.scopes;

const VPN_SCOPE = 'https://identity.mozilla.com/apps/vpn';
const DESKTOP_CLIENT_ID = '5882386c6d801776';
const OTHER_CLIENT_ID = '1b1a3e44c54fbb58';
const TTL_SECONDS = 43_200;

const UID = '0123456789abcdef0123456789abcdef';
// sha256(UID), first 4 bytes big-endian / 2^32. A hardcoded literal (not
// recomputed from the SUT) so a change to the bucketing algorithm moves the
// real bucket off this value and fails the boundary tests below, instead of
// shifting both sides in lockstep.
const UID_BUCKET = 0.24489958654157817;

describe('shouldExcludeFromDau', () => {
  let oauthDB: jest.Mocked<VpnDauOauthDB>;
  let redis: jest.Mocked<VpnDauRedis>;
  let statsd: { increment: jest.Mock };
  let log: { warn: jest.Mock };

  const vpnScopeSet = () => ScopeSet.fromArray([VPN_SCOPE, 'profile']);

  function makePolicy(overrides: Partial<VpnDauPolicy> = {}): VpnDauPolicy {
    return {
      clientId: DESKTOP_CLIENT_ID,
      scope: VPN_SCOPE,
      rolloutRate: 1,
      cacheTtlSeconds: TTL_SECONDS,
      ...overrides,
    };
  }

  function deps() {
    return { oauthDB, redis, statsd, log };
  }

  beforeEach(() => {
    oauthDB = {
      getServiceForCanonicalScope: jest.fn(),
      hasConsentForScopeAndClient: jest.fn(),
    };
    oauthDB.getServiceForCanonicalScope.mockReturnValue('vpn');
    oauthDB.hasConsentForScopeAndClient.mockResolvedValue(false);
    redis = { get: jest.fn(), set: jest.fn() };
    redis.get.mockResolvedValue(null);
    redis.set.mockResolvedValue('OK');
    statsd = { increment: jest.fn() };
    log = { warn: jest.fn() };
  });

  describe('eligibility gating (no Redis or DB access)', () => {
    it('returns false when the client is not the configured VPN client', async () => {
      const result = await shouldExcludeFromDau(deps(), {
        uid: UID,
        clientId: OTHER_CLIENT_ID,
        scopeSet: vpnScopeSet(),
        policy: makePolicy(),
      });
      expect(result).toBe(false);
      expect(redis.get).not.toHaveBeenCalled();
      expect(oauthDB.hasConsentForScopeAndClient).not.toHaveBeenCalled();
    });

    it('returns false when the requested scopes do not include the VPN scope', async () => {
      const result = await shouldExcludeFromDau(deps(), {
        uid: UID,
        clientId: DESKTOP_CLIENT_ID,
        scopeSet: ScopeSet.fromArray(['profile']),
        policy: makePolicy(),
      });
      expect(result).toBe(false);
      expect(redis.get).not.toHaveBeenCalled();
      expect(oauthDB.hasConsentForScopeAndClient).not.toHaveBeenCalled();
    });

    it('returns false when the scope set is null', async () => {
      const result = await shouldExcludeFromDau(deps(), {
        uid: UID,
        clientId: DESKTOP_CLIENT_ID,
        scopeSet: null,
        policy: makePolicy(),
      });
      expect(result).toBe(false);
      expect(oauthDB.hasConsentForScopeAndClient).not.toHaveBeenCalled();
    });

    it('returns false when rolloutRate is 0 (feature disabled)', async () => {
      const result = await shouldExcludeFromDau(deps(), {
        uid: UID,
        clientId: DESKTOP_CLIENT_ID,
        scopeSet: vpnScopeSet(),
        policy: makePolicy({ rolloutRate: 0 }),
      });
      expect(result).toBe(false);
      expect(redis.get).not.toHaveBeenCalled();
      expect(oauthDB.hasConsentForScopeAndClient).not.toHaveBeenCalled();
    });
  });

  describe('per-uid rollout bucketing', () => {
    it('performs the lookup for a uid whose bucket is below rolloutRate', async () => {
      await shouldExcludeFromDau(deps(), {
        uid: UID,
        clientId: DESKTOP_CLIENT_ID,
        scopeSet: vpnScopeSet(),
        policy: makePolicy({ rolloutRate: UID_BUCKET + 1e-9 }),
      });
      expect(oauthDB.hasConsentForScopeAndClient).toHaveBeenCalledTimes(1);
    });

    it('skips the lookup for a uid whose bucket is at or above rolloutRate', async () => {
      const result = await shouldExcludeFromDau(deps(), {
        uid: UID,
        clientId: DESKTOP_CLIENT_ID,
        scopeSet: vpnScopeSet(),
        policy: makePolicy({ rolloutRate: UID_BUCKET - 1e-9 }),
      });
      expect(result).toBe(false);
      expect(oauthDB.hasConsentForScopeAndClient).not.toHaveBeenCalled();
    });

    it('buckets a given uid consistently across repeated calls', async () => {
      // UID_BUCKET (~0.245) is below 0.5, so the lookup runs on every call;
      // a non-deterministic gate would drop one of the two.
      const args = {
        uid: UID,
        clientId: DESKTOP_CLIENT_ID,
        scopeSet: vpnScopeSet(),
        policy: makePolicy({ rolloutRate: 0.5 }),
      };
      await shouldExcludeFromDau(deps(), args);
      await shouldExcludeFromDau(deps(), args);
      expect(oauthDB.hasConsentForScopeAndClient).toHaveBeenCalledTimes(2);
    });
  });

  describe('Redis cache', () => {
    it('returns false without a DB call when the cache holds an authorized result', async () => {
      redis.get.mockResolvedValue('1');
      const result = await shouldExcludeFromDau(deps(), {
        uid: UID,
        clientId: DESKTOP_CLIENT_ID,
        scopeSet: vpnScopeSet(),
        policy: makePolicy(),
      });
      expect(result).toBe(false);
      expect(oauthDB.hasConsentForScopeAndClient).not.toHaveBeenCalled();
    });

    it('returns true without a DB call when the cache holds an unauthorized result', async () => {
      redis.get.mockResolvedValue('0');
      const result = await shouldExcludeFromDau(deps(), {
        uid: UID,
        clientId: DESKTOP_CLIENT_ID,
        scopeSet: vpnScopeSet(),
        policy: makePolicy(),
      });
      expect(result).toBe(true);
      expect(oauthDB.hasConsentForScopeAndClient).not.toHaveBeenCalled();
    });

    it('reads the cache under a per-uid key', async () => {
      await shouldExcludeFromDau(deps(), {
        uid: UID,
        clientId: DESKTOP_CLIENT_ID,
        scopeSet: vpnScopeSet(),
        policy: makePolicy(),
      });
      expect(redis.get).toHaveBeenCalledWith(`vpnDau:${UID}`);
    });
  });

  describe('cache miss -> DB lookup', () => {
    it('queries consent with the exact (uid, scope, service, clientId) key', async () => {
      await shouldExcludeFromDau(deps(), {
        uid: UID,
        clientId: DESKTOP_CLIENT_ID,
        scopeSet: vpnScopeSet(),
        policy: makePolicy(),
      });
      expect(oauthDB.hasConsentForScopeAndClient).toHaveBeenCalledWith(
        UID,
        VPN_SCOPE,
        'vpn',
        DESKTOP_CLIENT_ID
      );
    });

    it('returns false and caches "1" when the user has authorized VPN', async () => {
      oauthDB.hasConsentForScopeAndClient.mockResolvedValue(true);
      const result = await shouldExcludeFromDau(deps(), {
        uid: UID,
        clientId: DESKTOP_CLIENT_ID,
        scopeSet: vpnScopeSet(),
        policy: makePolicy(),
      });
      expect(result).toBe(false);
      expect(redis.set).toHaveBeenCalledWith(
        `vpnDau:${UID}`,
        '1',
        'EX',
        TTL_SECONDS
      );
    });

    it('returns true and caches "0" when the user has not authorized VPN', async () => {
      oauthDB.hasConsentForScopeAndClient.mockResolvedValue(false);
      const result = await shouldExcludeFromDau(deps(), {
        uid: UID,
        clientId: DESKTOP_CLIENT_ID,
        scopeSet: vpnScopeSet(),
        policy: makePolicy(),
      });
      expect(result).toBe(true);
      expect(redis.set).toHaveBeenCalledWith(
        `vpnDau:${UID}`,
        '0',
        'EX',
        TTL_SECONDS
      );
    });

    it('returns false and increments a metric when the scope has no known service', async () => {
      oauthDB.getServiceForCanonicalScope.mockReturnValue(undefined);
      const result = await shouldExcludeFromDau(deps(), {
        uid: UID,
        clientId: DESKTOP_CLIENT_ID,
        scopeSet: vpnScopeSet(),
        policy: makePolicy(),
      });
      expect(result).toBe(false);
      expect(oauthDB.hasConsentForScopeAndClient).not.toHaveBeenCalled();
      expect(statsd.increment).toHaveBeenCalledWith(
        'oauth.vpnDau.unknown_service'
      );
    });

    it('works without a Redis client, querying the DB directly', async () => {
      oauthDB.hasConsentForScopeAndClient.mockResolvedValue(false);
      const result = await shouldExcludeFromDau(
        { oauthDB, redis: undefined, statsd, log },
        {
          uid: UID,
          clientId: DESKTOP_CLIENT_ID,
          scopeSet: vpnScopeSet(),
          policy: makePolicy(),
        }
      );
      expect(result).toBe(true);
      expect(oauthDB.hasConsentForScopeAndClient).toHaveBeenCalledTimes(1);
    });
  });

  describe('fail-open on error', () => {
    it('returns false and increments a metric when the DB lookup rejects', async () => {
      oauthDB.hasConsentForScopeAndClient.mockRejectedValue(
        new Error('ECONNREFUSED')
      );
      const result = await shouldExcludeFromDau(deps(), {
        uid: UID,
        clientId: DESKTOP_CLIENT_ID,
        scopeSet: vpnScopeSet(),
        policy: makePolicy(),
      });
      expect(result).toBe(false);
      expect(statsd.increment).toHaveBeenCalledWith('oauth.vpnDau.error');
    });

    it('returns false when the Redis read rejects', async () => {
      redis.get.mockRejectedValue(new Error('redis timeout'));
      const result = await shouldExcludeFromDau(deps(), {
        uid: UID,
        clientId: DESKTOP_CLIENT_ID,
        scopeSet: vpnScopeSet(),
        policy: makePolicy(),
      });
      expect(result).toBe(false);
      expect(statsd.increment).toHaveBeenCalledWith('oauth.vpnDau.error');
    });
  });
});
