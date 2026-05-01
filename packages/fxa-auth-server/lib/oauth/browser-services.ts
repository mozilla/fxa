/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { config } = require('../../config');

export interface BrowserServiceConfig {
  displayName: string;
  authorizationScope: string;
  clientIds: string[];
  serviceParams: string[];
  retentionDays: number;
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

interface Cache {
  cfg: Record<string, BrowserServiceConfig>;
  scopeIdx: Map<string, string>;
  // A clientId can legitimately participate in multiple services (e.g.,
  // Firefox Desktop mints both Sync and Relay tokens). Resolution prefers
  // scope match, so the clientId-only fallback returns the first declared.
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

    // ClientIds may overlap across services (Firefox Desktop mints both
    // Sync and Relay tokens). Validate format only.
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
    if (typeof c.retentionDays !== 'number' || c.retentionDays <= 0) {
      throw new Error(
        `browserServices.${name}: retentionDays must be a positive number`
      );
    }
    if (typeof c.allowSilentExchange !== 'boolean') {
      throw new Error(
        `browserServices.${name}: allowSilentExchange must be a boolean`
      );
    }
  }
}

function ensureLoaded(): Cache {
  if (cache) return cache;
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
    for (const sp of c.serviceParams) serviceParamIdx.set(sp, name);
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
  if (!scope) return [];
  if (typeof scope === 'string') return [scope];
  if (typeof scope.getScopeValues === 'function') return scope.getScopeValues();
  if (Array.isArray(scope)) return scope;
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
    if (name) return resolved(cfg, name);
  }
  if (clientId) {
    const name = clientIdIdx.get(clientId.toLowerCase())?.[0];
    if (name) return resolved(cfg, name);
  }
  if (serviceParam) {
    const name = serviceParamIdx.get(serviceParam.toLowerCase());
    if (name) return resolved(cfg, name);
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

// Upsert on login. The grant just issued a refresh token bearing every
// scope in the request, so consent covers each configured service whose
// scope is present. Writes one row per matching scope. If no scope
// matches, falls back to clientId/serviceParam (single match each).
// Errors swallowed so a bookkeeping write can't break sign-in.
export async function recordAuthorizationOnLogin(
  oauthDB: any,
  log: any,
  args: {
    uid: string | Buffer;
    clientId?: string;
    scope?: any;
    serviceParam?: string;
    now?: number;
  }
): Promise<void> {
  try {
    const { cfg, scopeIdx, clientIdIdx, serviceParamIdx } = ensureLoaded();

    // Map<service, scope>. Map keys deduplicate by service automatically.
    const targets = new Map<string, string>();
    for (const value of scopeValues(args.scope)) {
      const name = scopeIdx.get(value);
      if (name && !targets.has(name)) targets.set(name, value);
    }
    if (targets.size === 0 && args.clientId) {
      const name = clientIdIdx.get(args.clientId.toLowerCase())?.[0];
      if (name) targets.set(name, cfg[name].authorizationScope);
    }
    if (targets.size === 0 && args.serviceParam) {
      const name = serviceParamIdx.get(args.serviceParam.toLowerCase());
      if (name) targets.set(name, cfg[name].authorizationScope);
    }
    if (targets.size === 0) return;

    const now = args.now ?? Date.now();
    for (const [service, scope] of targets) {
      await oauthDB.upsertAccountAuthorization(
        args.uid,
        scope,
        service,
        now,
        now
      );
    }
  } catch (err) {
    log?.warn?.('accountAuthorizations.upsertFailed', {
      err: err && (err as Error).message,
    });
  }
}

// Bump lastUsedAt for each matching scope on refresh use. SQL throttles
// concurrent calls; errors swallowed so refresh can't fail on bookkeeping.
export async function touchAuthorizationsForRefresh(
  oauthDB: any,
  log: any,
  args: { uid: string | Buffer; scope: any; now?: number }
): Promise<void> {
  try {
    const { scopeIdx } = ensureLoaded();
    const now = args.now ?? Date.now();
    for (const value of scopeValues(args.scope)) {
      const name = scopeIdx.get(value);
      if (!name) continue;
      await oauthDB.touchAccountAuthorization(args.uid, value, name, now);
    }
  } catch (err) {
    log?.warn?.('accountAuthorizations.touchFailed', {
      err: err && (err as Error).message,
    });
  }
}

// Test-only: clear cached config so tests can re-stub config.get.
export function __resetForTests() {
  cache = null;
}
