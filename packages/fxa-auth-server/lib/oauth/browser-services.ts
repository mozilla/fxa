/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { config } from '../../config';

export interface BrowserServiceConfig {
  displayName: string;
  authorizationScope: string;
  clientIds: string[];
  serviceParams: string[];
  allowSilentExchange: boolean;
}

export interface ResolvedAuthorization {
  name: string;
  authorizationScope: string;
  allowSilentExchange: boolean;
}

const RELAY_AUTH_SCOPE = 'https://identity.mozilla.com/apps/relay';
const HEX16 = /^[a-f0-9]{16}$/;
const HTTPS_URL = /^https:\/\//;

// Firefox Desktop uses a single clientId across multiple browser services
// (Sync, Smart Window, Relay, VPN). At the OAuth grant level the wire scope
// can include extras (e.g. `oldsync` for opportunistic scoped-key fetch)
// regardless of which service the user is actually authorizing. For this
// clientId, only `service=` (sent on the /oauth/authorization request) is
// a trustworthy intent signal.
//
// Remove this special case once Desktop completes the application-services
// migration to refresh tokens, at which point each refresh-token mint
// carries the right scope on the wire.
export const SERVICE_AMBIGUOUS_CLIENT_IDS: ReadonlySet<string> = new Set([
  '5882386c6d801776', // Firefox Desktop
]);

interface Cache {
  cfg: Record<string, BrowserServiceConfig>;
  scopeIdx: Map<string, string>;
  // A clientId can participate in multiple services (Firefox Desktop mints
  // Sync and Relay tokens). Scope match wins; clientId fallback uses the
  // first declared service.
  clientIdIdx: Map<string, string[]>;
  serviceParamIdx: Map<string, string>;
}

let cache: Cache | null = null;

export function validateBrowserServicesConfig(
  cfg: Record<string, BrowserServiceConfig>
): void {
  const seenServiceParams = new Map<string, string>();
  const seenScopes = new Map<string, string>();

  for (const [name, c] of Object.entries(cfg)) {
    if (!c || typeof c !== 'object') {
      throw new Error(`browserServices.${name}: must be an object`);
    }
    if (!c.authorizationScope || !HTTPS_URL.test(c.authorizationScope)) {
      throw new Error(
        `browserServices.${name}: authorizationScope must be an HTTPS URL`
      );
    }
    const scopeOwner = seenScopes.get(c.authorizationScope);
    if (scopeOwner && scopeOwner !== name) {
      throw new Error(
        `browserServices.${name}: authorizationScope "${c.authorizationScope}" already claimed by "${scopeOwner}"`
      );
    }
    seenScopes.set(c.authorizationScope, name);

    // ClientIds may overlap across services; validate format only.
    for (const id of c.clientIds || []) {
      if (!HEX16.test(id)) {
        throw new Error(
          `browserServices.${name}: invalid clientId "${id}" (expected 16 hex chars)`
        );
      }
    }
    for (const sp of c.serviceParams || []) {
      const owner = seenServiceParams.get(sp);
      if (owner && owner !== name) {
        throw new Error(
          `browserServices.${name}: serviceParam "${sp}" already claimed by "${owner}"`
        );
      }
      seenServiceParams.set(sp, name);
    }
    if (typeof c.allowSilentExchange !== 'boolean') {
      throw new Error(
        `browserServices.${name}: allowSilentExchange must be a boolean`
      );
    }
  }
}

function ensureLoaded(): Cache {
  if (cache) {
    return cache;
  }
  const raw = config.get('oauthServer.browserServices') || {};
  validateBrowserServicesConfig(raw);

  const cfg: Record<string, BrowserServiceConfig> = {};
  const scopeIdx = new Map<string, string>();
  const clientIdIdx = new Map<string, string[]>();
  const serviceParamIdx = new Map<string, string>();
  for (const [name, raw_c] of Object.entries(raw) as [
    string,
    BrowserServiceConfig,
  ][]) {
    const c = {
      ...raw_c,
      clientIds: (raw_c.clientIds || []).map((id) => id.toLowerCase()),
      serviceParams: (raw_c.serviceParams || []).map((s) => s.toLowerCase()),
    };
    cfg[name] = c;
    scopeIdx.set(c.authorizationScope, name);
    for (const id of c.clientIds) {
      const services = clientIdIdx.get(id) || [];
      services.push(name);
      clientIdIdx.set(id, services);
    }
    for (const sp of c.serviceParams) {
      serviceParamIdx.set(sp, name);
    }
  }

  cache = { cfg, scopeIdx, clientIdIdx, serviceParamIdx };
  return cache;
}

function resolved(
  cfg: Record<string, BrowserServiceConfig>,
  name: string
): ResolvedAuthorization {
  const c = cfg[name];
  return {
    name,
    authorizationScope: c.authorizationScope,
    allowSilentExchange: c.allowSilentExchange,
  };
}

function scopeValues(scope: any): string[] {
  if (!scope) {
    return [];
  }
  if (typeof scope === 'string') {
    return [scope];
  }
  if (typeof scope.getScopeValues === 'function') {
    return scope.getScopeValues();
  }
  if (Array.isArray(scope)) {
    return scope;
  }
  return [];
}

// Resolve to a configured browser service. Priority: scope > clientId > serviceParam.
export function getAuthorizationScope(
  clientId?: string,
  serviceParam?: string,
  scope?: any
): ResolvedAuthorization | null {
  const { cfg, scopeIdx, clientIdIdx, serviceParamIdx } = ensureLoaded();

  for (const value of scopeValues(scope)) {
    const name = scopeIdx.get(value);
    if (name) {
      return resolved(cfg, name);
    }
  }
  if (clientId) {
    const name = clientIdIdx.get(clientId.toLowerCase())?.[0];
    if (name) {
      return resolved(cfg, name);
    }
  }
  if (serviceParam) {
    const name = serviceParamIdx.get(serviceParam.toLowerCase());
    if (name) {
      return resolved(cfg, name);
    }
  }
  return null;
}

export function getServiceNameForScope(scope: string): string | null {
  return ensureLoaded().scopeIdx.get(scope) || null;
}

// Relay carve-out: bypass the table check until application-services handles 4xx
// from token-exchange. Greppable so a future cleanup can't silently break Relay.
export function shouldBypassAuthCheck(
  resolution: ResolvedAuthorization | null
): boolean {
  return resolution?.authorizationScope === RELAY_AUTH_SCOPE;
}

// Upsert one row per matching scope on login. Falls back to clientId or
// serviceParam (single match each) when no scope resolves. Errors swallowed
// so a bookkeeping write can't break sign-in.
export async function recordAuthorizationOnLogin(
  oauthDB: any,
  log: any,
  args: {
    uid: string | Buffer;
    clientId?: string;
    scope?: any;
    serviceParam?: string;
    now?: number;
    statsd?: { increment: (name: string, tags?: any) => void };
  }
): Promise<void> {
  try {
    const { cfg, scopeIdx, clientIdIdx, serviceParamIdx } = ensureLoaded();
    const lowerClientId = args.clientId?.toLowerCase();

    // Map<service, scope>; keys dedupe by service.
    const targets = new Map<string, string>();

    // Scope alone is not proof of authorization: require the clientId to be
    // a recognized minter for the matched service so an RP that could
    // request the scope cannot plant rows for services it does not
    // represent.
    const addScopeMatchedTargets = (): void => {
      if (!lowerClientId) {
        return;
      }
      for (const value of scopeValues(args.scope)) {
        const name = scopeIdx.get(value);
        if (!name || targets.has(name)) {
          continue;
        }
        if (!cfg[name].clientIds.includes(lowerClientId)) {
          continue;
        }
        targets.set(name, value);
      }
    };

    if (lowerClientId && SERVICE_AMBIGUOUS_CLIENT_IDS.has(lowerClientId)) {
      // serviceParam is the primary intent signal for ambiguous clientIds;
      // any other configured browser-service scope on the wire also lands
      // a row (e.g. Smart Window's opportunistic oldsync → sync row).
      if (args.serviceParam) {
        const name = serviceParamIdx.get(args.serviceParam.toLowerCase());
        if (name && cfg[name].clientIds.includes(lowerClientId)) {
          targets.set(name, cfg[name].authorizationScope);
        } else if (!name) {
          args.statsd?.increment('account_authz.write.skipped', {
            reason: 'service_param_unknown',
          });
          log?.warn?.('accountAuthorizations.unknownServiceParam', {
            serviceParam: args.serviceParam,
            clientId: lowerClientId,
          });
        } else {
          args.statsd?.increment('account_authz.write.skipped', {
            reason: 'service_param_client_id_mismatch',
          });
        }
      }
      addScopeMatchedTargets();
    } else {
      addScopeMatchedTargets();
      if (targets.size === 0 && lowerClientId) {
        // Only fall back when the clientId maps to a single service; a
        // clientId shared across services is ambiguous without scope.
        const matches = clientIdIdx.get(lowerClientId);
        if (matches && matches.length === 1) {
          const name = matches[0];
          targets.set(name, cfg[name].authorizationScope);
        }
      }
      if (targets.size === 0 && args.serviceParam) {
        const name = serviceParamIdx.get(args.serviceParam.toLowerCase());
        if (name) {
          targets.set(name, cfg[name].authorizationScope);
        }
      }
    }
    if (targets.size === 0) {
      args.statsd?.increment('account_authz.write.skipped', {
        reason: 'no_targets',
      });
      return;
    }

    const now = args.now ?? Date.now();
    await Promise.all(
      [...targets].map(async ([service, scope]) => {
        args.statsd?.increment('account_authz.upsert.attempt', { service });
        try {
          await oauthDB.upsertAccountAuthorization(
            args.uid,
            scope,
            service,
            now
          );
          args.statsd?.increment('account_authz.upsert.success', { service });
        } catch (err) {
          args.statsd?.increment('account_authz.upsert.error', { service });
          log?.warn?.('accountAuthorizations.upsertFailed', {
            service,
            err: err && (err as Error).message,
          });
        }
      })
    );
  } catch (err) {
    // Setup-time failure (e.g. config load); no service to attribute.
    args.statsd?.increment('account_authz.upsert.error');
    log?.warn?.('accountAuthorizations.upsertFailed', {
      err: err && (err as Error).message,
    });
  }
}

// Test-only: clear cached config so tests can re-stub config.get.
export function __resetForTests() {
  cache = null;
}
