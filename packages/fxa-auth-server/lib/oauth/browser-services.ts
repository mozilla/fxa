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

let cachedConfig: Record<string, BrowserServiceConfig> | null = null;
let scopeIndex: Map<string, string> | null = null;
let clientIdIndex: Map<string, string> | null = null;
let serviceParamIndex: Map<string, string> | null = null;

function normalizeConfig(
  raw: Record<string, BrowserServiceConfig>
): Record<string, BrowserServiceConfig> {
  const out: Record<string, BrowserServiceConfig> = {};
  for (const [name, cfg] of Object.entries(raw)) {
    out[name] = {
      ...cfg,
      clientIds: (cfg.clientIds || []).map((id) => id.toLowerCase()),
      serviceParams: (cfg.serviceParams || []).map((s) => s.toLowerCase()),
    };
  }
  return out;
}

export function validateBrowserServicesConfig(
  cfg: Record<string, BrowserServiceConfig>
): void {
  const seenClientIds = new Map<string, string>();
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

    for (const id of c.clientIds || []) {
      if (!HEX16.test(id)) {
        throw new Error(
          `browserServices.${name}: invalid clientId "${id}" (expected 16 hex chars)`
        );
      }
      const owner = seenClientIds.get(id);
      if (owner && owner !== name) {
        throw new Error(
          `browserServices.${name}: clientId "${id}" already claimed by "${owner}"`
        );
      }
      seenClientIds.set(id, name);
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

function buildIndexes(cfg: Record<string, BrowserServiceConfig>) {
  scopeIndex = new Map();
  clientIdIndex = new Map();
  serviceParamIndex = new Map();
  for (const [name, c] of Object.entries(cfg)) {
    scopeIndex.set(c.authorizationScope, name);
    for (const id of c.clientIds) {
      clientIdIndex.set(id, name);
    }
    for (const sp of c.serviceParams) {
      serviceParamIndex.set(sp, name);
    }
  }
}

export function getBrowserServices(): Record<string, BrowserServiceConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }
  const raw = config.get('oauthServer.browserServices') || {};
  validateBrowserServicesConfig(raw);
  cachedConfig = normalizeConfig(raw);
  buildIndexes(cachedConfig);
  return cachedConfig;
}

function ensureLoaded(): {
  cfg: Record<string, BrowserServiceConfig>;
  scopeIdx: Map<string, string>;
  clientIdIdx: Map<string, string>;
  serviceParamIdx: Map<string, string>;
} {
  if (!cachedConfig) {
    getBrowserServices();
  }
  return {
    cfg: cachedConfig as Record<string, BrowserServiceConfig>,
    scopeIdx: scopeIndex as Map<string, string>,
    clientIdIdx: clientIdIndex as Map<string, string>,
    serviceParamIdx: serviceParamIndex as Map<string, string>,
  };
}

function scopeValues(scope: any): string[] {
  if (!scope) return [];
  if (typeof scope === 'string') return [scope];
  if (typeof scope.getScopeValues === 'function') {
    return scope.getScopeValues();
  }
  if (Array.isArray(scope)) return scope;
  return [];
}

/**
 * Resolve a browser-service authorization for the given access pattern.
 * Priority: explicit scope match > clientId match > serviceParam match.
 *
 * Returns null when no configured service applies, in which case the caller
 * should fall back to legacy behavior (e.g., the TOKEN_EXCHANGE_ALLOWED_SCOPES
 * allowlist) or skip the write.
 */
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
    const name = clientIdIdx.get(clientId.toLowerCase());
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

/**
 * Reverse lookup: given a scope value, return the configured service name.
 * Used by writers to populate accountAuthorizations.service when iterating
 * a multi-scope refresh token.
 */
export function getServiceNameForScope(scope: string): string | null {
  const { scopeIdx } = ensureLoaded();
  return scopeIdx.get(scope) || null;
}

/**
 * Relay carve-out: until application-services fxa-client handles a 4xx from
 * the token-exchange endpoint, callers must bypass the accountAuthorizations
 * check for Relay and fall through to the legacy allowlist. Greppable name +
 * dedicated constant so a future cleanup PR cannot silently break Relay.
 */
export function shouldBypassAuthCheck(
  resolution: ResolvedAuthorization | null
): boolean {
  return resolution?.authorizationScope === RELAY_AUTH_SCOPE;
}

/**
 * Resolve the scope-or-clientId pair to a configured browser service and
 * upsert an entry in accountAuthorizations. No-op when nothing matches.
 *
 * Errors are caught and logged to keep the calling login path resilient —
 * a failure to record the authorization must not break the user's sign-in.
 */
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
    const resolution = getAuthorizationScope(
      args.clientId,
      args.serviceParam,
      args.scope
    );
    if (!resolution) return;
    const now = args.now ?? Date.now();
    await oauthDB.upsertAccountAuthorization(
      args.uid,
      resolution.authorizationScope,
      resolution.name,
      now,
      now
    );
  } catch (err) {
    log?.warn?.('accountAuthorizations.upsertFailed', {
      err: err && (err as Error).message,
    });
  }
}

/**
 * Iterate the scope values in a refresh token and bump lastUsedAt for any
 * that map to a configured browser service. Throttled in SQL so concurrent
 * refreshes coalesce to a single update per (uid, scope, service) per
 * REFRESH_LAST_USED_AT_UPDATE_AFTER_MS window.
 *
 * Errors are caught and logged — refresh-token use must never fail because
 * of a bookkeeping write.
 */
export async function touchAuthorizationsForRefresh(
  oauthDB: any,
  log: any,
  args: { uid: string | Buffer; scope: any; now?: number }
): Promise<void> {
  try {
    const { scopeIdx } = ensureLoaded();
    const values = scopeValues(args.scope);
    if (values.length === 0) return;
    const now = args.now ?? Date.now();
    for (const value of values) {
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

/**
 * Test-only: clear the cached config so tests can re-stub config.get.
 */
export function __resetForTests() {
  cachedConfig = null;
  scopeIndex = null;
  clientIdIndex = null;
  serviceParamIndex = null;
}
