/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VPN-in-Desktop DAU bandaid (FXA-14159).
//
// Firefox Desktop mints a VPN-scoped access token for every signed-in user via
// the fxa-credentials grant, regardless of whether the user actually uses VPN.
// Each mint fires the server-side `access_token_created` Glean event, which
// feeds the services-DAU rollup, so VPN's Desktop DAU is inflated to ~every
// signed-in Desktop user.
//
// This helper decides whether a given fxa-credentials token creation should be
// EXCLUDED from that DAU signal (the token is always granted either way). It is
// excluded when the request is Firefox Desktop requesting the VPN scope AND the
// user has no VPN consent row for that client in accountAuthorizations.
//
// The `/oauth/token` path is extremely hot and the OAuth DB has seen connection
// spikes, so the accountAuthorizations lookup is (a) gated by a deterministic
// per-uid rollout fraction and (b) cached per-uid in Redis. Negative results
// (the majority: signed-in users who don't use VPN) are cached too — that is
// what shields the DB.
//
// Fail-open: any unexpected error returns false (keep the current behavior,
// count the token). The bandaid must never break or slow a grant, and failing
// open cannot undercount.

import crypto from 'crypto';
import { StatsD } from 'hot-shots';
import { Logger } from 'mozlog';

const CACHE_KEY_PREFIX = 'vpnDau:';
const UINT32_SPACE = 0x1_0000_0000;

export interface VpnDauPolicy {
  /** OAuth client_id (hex) subject to the bandaid. Firefox Desktop. */
  clientId: string;
  /** Canonical VPN scope (must be a key of oauthServer.exchange.serviceScopes). */
  scope: string;
  /** Fraction 0-1 of eligible grants for which the lookup runs. 0 disables. */
  rolloutRate: number;
  /** Redis TTL, in seconds, for the cached authorization result. */
  cacheTtlSeconds: number;
}

export interface ScopeSetLike {
  contains(scope: string): boolean;
}

export interface VpnDauOauthDB {
  getServiceForCanonicalScope(scope: string): string | undefined;
  hasConsentForScopeAndClient(
    uid: string,
    scope: string,
    service: string,
    clientId: string
  ): Promise<boolean>;
}

export interface VpnDauRedis {
  get(key: string): Promise<string | null>;
  // Variadic tail mirrors ioredis (e.g. 'EX', ttlSeconds) via the FxaRedis wrapper.
  set(
    key: string,
    value: string,
    ...args: (string | number)[]
  ): Promise<unknown>;
}

export interface VpnDauDeps {
  oauthDB: VpnDauOauthDB;
  redis?: VpnDauRedis;
  // Only the methods this module uses, picked from the real collaborator types
  // so a minimal mock satisfies them without re-declaring the contract.
  statsd?: Pick<StatsD, 'increment'>;
  log?: Pick<Logger, 'warn'>;
}

export interface VpnDauParams {
  /** Grant user id, hex. */
  uid: string;
  /** Grant client_id, hex. */
  clientId: string;
  scopeSet: ScopeSetLike | null | undefined;
  policy: VpnDauPolicy;
}

/**
 * Deterministic per-uid bucket in [0, 1). Same uid always maps to the same
 * value, so a user is consistently inside or outside the rollout — stable DAU
 * measurement and a meaningful per-uid cache. (Contrast the Math.random()
 * sampling used for the accountActivity writer, which does not need per-user
 * consistency.)
 */
function rolloutBucket(uid: string): number {
  const digest = crypto.createHash('sha256').update(uid).digest();
  return digest.readUInt32BE(0) / UINT32_SPACE;
}

/**
 * Returns true when this token creation should be tagged `exclude_dau` (i.e.
 * excluded from the DAU signal). Never throws.
 *
 * Cheap constant checks short-circuit before any Redis/DB access, so only
 * Firefox-Desktop + VPN + in-rollout fxa-credentials grants ever touch Redis or
 * the OAuth DB.
 */
export async function shouldExcludeFromDau(
  deps: VpnDauDeps,
  params: VpnDauParams
): Promise<boolean> {
  const { oauthDB, redis, statsd, log } = deps;
  const { uid, clientId, scopeSet, policy } = params;

  try {
    // Only the configured client (Firefox Desktop) requesting the VPN scope.
    if (clientId !== policy.clientId) {
      return false;
    }
    if (!scopeSet?.contains(policy.scope)) {
      return false;
    }

    // Rollout gate. Disabled, or this uid falls outside the current fraction.
    if (!(policy.rolloutRate > 0) || rolloutBucket(uid) >= policy.rolloutRate) {
      return false;
    }

    // Keyed by uid alone: the client and scope are fixed constants for this
    // bandaid, so they don't need to be part of the key.
    const cacheKey = `${CACHE_KEY_PREFIX}${uid}`;

    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached === '1') {
        return false; // authorized -> count
      }
      if (cached === '0') {
        return true; // not authorized -> exclude
      }
    }

    const service = oauthDB.getServiceForCanonicalScope(policy.scope);
    if (!service) {
      // Misconfiguration: the scope isn't owned by a known service, so we can't
      // form the consent key. Fail open rather than guess.
      statsd?.increment('oauth.vpnDau.unknown_service');
      return false;
    }

    const authorized = await oauthDB.hasConsentForScopeAndClient(
      uid,
      policy.scope,
      service,
      policy.clientId
    );

    if (redis && policy.cacheTtlSeconds > 0) {
      // Fire-and-forget: the cache write isn't needed to answer this request,
      // so the grant response shouldn't wait on a Redis round-trip. A dropped
      // write just means the next request re-queries the DB.
      Promise.resolve(
        redis.set(
          cacheKey,
          authorized ? '1' : '0',
          'EX',
          policy.cacheTtlSeconds
        )
      ).catch(() => statsd?.increment('oauth.vpnDau.cache_write_failed'));
    }

    return !authorized;
  } catch (err) {
    statsd?.increment('oauth.vpnDau.error');
    log?.warn('oauth.vpnDau.error', {
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}
