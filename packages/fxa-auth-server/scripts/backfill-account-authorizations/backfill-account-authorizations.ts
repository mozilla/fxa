/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Backfill script for the accountAuthorizations consent ledger.
 *
 * Walks the refreshTokens table in cursor order and writes one consent row
 * per (uid, scope, service, clientId) tuple for every scope on every token,
 * plus the service's canonical scope when the token lacks it. Each token's
 * `service` is inferred from its scopes and clientId (see
 * inferServicesForToken, which mirrors lib/routes/oauth/authorization.js).
 * A token with one service scope has that service on every row, so
 * backfilled rows look identical to organic ones, including the service=''
 * rows that future ToS-rejection logic on /authorization will read for
 * non-browser RPs. An exchange-derived token with several service scopes
 * gets one row set per consented service (see resolveTargetRows).
 *
 * The upsert never touches deauthorizedAt: a backfill is not a ToS view.
 *
 * Per service notes:
 *   - relay rows are written for tokens whose only service scope is relay
 *     (the Relay website's own sign-in), even though token-exchange currently
 *     bypasses the consent check. Two reasons: (a) the firstAuthorizedTosAt /
 *     lastAuthorizedTosAt columns are a per-user ToS-acceptance ledger
 *     independent of how exchange decides today, and (b) the bypass is
 *     explicitly transitional — see EXCHANGE_DECISION.BYPASS in
 *     lib/oauth/db/index.js and the "Remove this path once application-
 *     services ships a 4xx handler" comment in lib/routes/oauth/token.js.
 *     Backfilled rows prevent existing users from being re-prompted when
 *     that bypass is eventually removed. A relay scope that arrived via the
 *     exchange (alongside another service scope) gets no row; see below.
 *   - sync rows materialize from mobile only — Firefox Desktop calls /destroy
 *     on its sync refresh token immediately after sign-in, so Desktop sync
 *     tokens aren't present in the scan source.
 *   - A mobile token that went through the token exchange carries its Sync
 *     scope plus the exchanged service's scope. It yields a sync row set
 *     (Sync sign-in is always interactive) and a row for each exchanged
 *     service whose exchange required consent (vpn); relay is skipped while
 *     it is in bypassConsentForServices.
 *   - A Firefox Desktop token carrying the Sync scope plus one other service
 *     scope resolves to that other service, with no Sync row: the same rule
 *     runtime applies when recording consent (dropUnconsentedSyncScope).
 *     Desktop destroys its Sync token after sign-in, so such tokens are
 *     rare in the scan; the rule is here so the two paths agree if one
 *     does appear.
 *
 * Prerequisites:
 *   - accountAuthorizations table at the new (clientId, firstAuthorizedTosAt,
 *     lastAuthorizedTosAt) shape.
 *   - oauthServer.exchange.serviceScopes, allowedClientsForService,
 *     serviceForClient and bypassConsentForServices populated in config.
 *     bypassConsentForServices is read at run time: a service listed there
 *     gets no rows from exchange-derived (multi-service-scope) tokens, so
 *     the same token is treated differently once Relay leaves the list.
 *
 * Usage (from packages/fxa-auth-server):
 *
 *   # Default — every refreshToken, including 123done-style tokens whose
 *   # scopes don't map to a browser service (recorded with service='')
 *   node -r ts-node/register/transpile-only -r tsconfig-paths/register scripts/backfill-account-authorizations/backfill-account-authorizations.ts --dry-run
 *   node -r ts-node/register/transpile-only -r tsconfig-paths/register scripts/backfill-account-authorizations/backfill-account-authorizations.ts
 *
 *   # Just one service — only tokens whose inferred service matches are
 *   # touched; tokens that infer to other services or to '' are skipped.
 *   node -r ts-node/register/transpile-only -r tsconfig-paths/register scripts/backfill-account-authorizations/backfill-account-authorizations.ts --service vpn
 *
 *   # Skip rows for some scopes
 *   node -r ts-node/register/transpile-only -r tsconfig-paths/register scripts/backfill-account-authorizations/backfill-account-authorizations.ts --omit-scope profile
 *
 * The clientId → service map comes from oauthServer.exchange.serviceForClient
 * (override per run with OAUTH_EXCHANGE_SERVICE_FOR_CLIENT). The effective map
 * is logged in `backfill.start`, so check it on the dry run.
 *
 * To resume after a crash, pass the `cursor` from the last `backfill.batch`
 * log line as --start-cursor. Re-running from anywhere earlier is also safe:
 * the upsert is idempotent, and `rowsAffected` on the batch log (1 per
 * insert, 2 per firstAuthorizedTosAt moved earlier, 0 per untouched row)
 * shows how much of a re-run did anything.
 *
 * Execution plan:
 *   1. --dry-run on stage           → verify per-service counts
 *   2. Live run on stage            → spot-check accountAuthorizations rows
 *   3. --dry-run on prod            → validate expected counts
 *   4. Live run on prod (off-peak)  → tune --batch-size and --batch-delay-ms
 *                                     to balance throughput against DB load.
 */

import { promisify } from 'util';
import * as mysql from 'mysql';
import { program } from 'commander';
import { StatsD } from 'hot-shots';
import pckg from '../../package.json';
import type { ConfigType } from '../../config';
import { dropUnconsentedSyncScope } from '../../lib/oauth/desktop-sync-dau-authorization-bandaid';

export interface ServiceConfig {
  // Inverse map: service scope URL → service name. Drives scope matching.
  scopeToService: Map<string, string>;
  // service → Set<lowercased clientId hex>. Services absent from the map are
  // unrestricted (any clientId may produce a row); services present with
  // a non-empty set require clientId membership. Mirrors the runtime
  // isClientAllowedForService gate.
  allowedClients: Map<string, Set<string>>;
  // service → its canonical scope URL. Added to a token's row set when the
  // token doesn't carry it, as the runtime writer does.
  canonicalScopes: Map<string, string>;
  // lowercased clientId hex → service, for tokens with no canonical scope.
  serviceForClient: Map<string, string>;
  // Services the token exchange grants without consulting consent
  // (oauthServer.exchange.bypassConsentForServices). On a token carrying
  // several service scopes, such a scope arrived via that exchange and is
  // not evidence of consent, so no row is written for it.
  bypassConsent: Set<string>;
}

export interface UpsertRow {
  uid: Buffer;
  scope: string;
  service: string;
  clientId: Buffer;
  firstAuthorizedTosAt: number; // ms epoch
  lastAuthorizedTosAt: number; // ms epoch
}

export interface ResolveResult {
  rows: UpsertRow[];
  // Services inferred for this token whose allowlist gate rejected the
  // clientId. Used by the caller to emit a security-relevant skip metric
  // distinct from "no rows produced".
  allowlistDenied: string[];
}

export interface Logger {
  info: (op: string, data?: unknown) => void;
  warn: (op: string, data?: unknown) => void;
  error: (op: string, data?: unknown) => void;
  debug?: (op: string, data?: unknown) => void;
}

export type Query = <T = unknown>(
  sql: string,
  values?: unknown[]
) => Promise<T>;

function makeQuery(pool: mysql.Pool): Query {
  return <T = unknown>(sql: string, values?: unknown[]): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      pool.query(sql, values, (err, results) => {
        if (err) reject(err);
        else resolve(results as T);
      });
    });
}

function errMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function humanDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h${m}m${s}s`;
  if (m > 0) return `${m}m${s}s`;
  return `${s}s`;
}

function buildServiceConfig(
  serviceScopes: Record<string, string>,
  allowedClientsForService: Record<string, string[]>,
  serviceForClientInput: Record<string, string> = {},
  bypassConsentForServices: string[] = []
): ServiceConfig {
  const scopeToService = new Map<string, string>();
  const canonicalScopes = new Map<string, string>();
  for (const [service, scope] of Object.entries(serviceScopes)) {
    scopeToService.set(scope, service);
    canonicalScopes.set(service, scope);
  }

  // Entries for services absent from serviceScopes are dropped, as at runtime
  // (OauthDB.getFallbackServiceForClient), so a mapping that lands ahead of
  // its service config is inert rather than fatal.
  const serviceForClient = new Map<string, string>();
  for (const [clientId, service] of Object.entries(serviceForClientInput)) {
    if (canonicalScopes.has(service)) {
      serviceForClient.set(clientId.toLowerCase(), service);
    }
  }

  const allowedClients = new Map<string, Set<string>>();
  for (const [service, clientIds] of Object.entries(
    allowedClientsForService || {}
  )) {
    if (Array.isArray(clientIds) && clientIds.length > 0) {
      allowedClients.set(
        service,
        new Set(clientIds.map((c) => c.toLowerCase()))
      );
    }
  }

  const bypassConsent = new Set(bypassConsentForServices);

  return {
    scopeToService,
    allowedClients,
    canonicalScopes,
    serviceForClient,
    bypassConsent,
  };
}

// Per-token service inference. Mirrors the runtime path
// (lib/routes/oauth/authorization.js:recordAuthorizationRows): the URL
// ?service= param is the source of truth in runtime but isn't preserved on
// the refreshToken, so we fall back to runtime's inference branch — if
// exactly one of the token's scopes is a configured service's scope URL,
// that's the service. No match falls back to the clientId mapping (runtime's
// getFallbackServiceForClient); otherwise service=''.
//
// Two or more service-scope URLs on one token come from the token exchange
// (lib/routes/oauth/token.js unions the subject token's scope with the
// requested one): a Firefox client signed in to one service and exchanged
// for others. Each service is returned, minus those in bypassConsent: the
// exchange granted those without a consent check, so the scope says nothing
// about consent. If nothing survives, the token yields no rows. Firefox
// Desktop's extra Sync scope is removed by the caller before this runs (see
// resolveTargetRows).
function inferServicesForToken(
  scopes: string[],
  clientHex: string,
  cfg: Pick<
    ServiceConfig,
    'scopeToService' | 'serviceForClient' | 'bypassConsent'
  >
): string[] {
  const matched: string[] = [];
  for (const scope of scopes) {
    const service = cfg.scopeToService.get(scope);
    if (service && !matched.includes(service)) {
      matched.push(service);
    }
  }
  if (matched.length === 1) {
    return matched;
  }
  if (matched.length > 1) {
    return matched.filter((s) => !cfg.bypassConsent.has(s));
  }
  return [cfg.serviceForClient.get(clientHex.toLowerCase()) ?? ''];
}

// Follows lib/routes/oauth/authorization.js:recordAuthorizationRows where a
// token has one service, and differs for exchange-derived tokens, which
// runtime never records at all:
//   - A Firefox Desktop token carrying the Sync scope plus one other service
//     scope resolves to that other service, as runtime does when recording
//     consent (dropUnconsentedSyncScope): the Sync scope is dropped first and
//     the token then has a single service.
//   - A token with one inferred service (see inferServicesForToken) has that
//     service on every row written for it. This matches runtime, which
//     derives serviceValue once from URL/scope inference and then writes each
//     scope with that same serviceValue. A 123done token with
//     scope='openid profile' lands as two rows with service=''; a VPN token
//     with scope='<vpn-scope-url> profile' lands as two rows both with
//     service='vpn'.
//   - A token with several service scopes (exchange-derived) gets one row set
//     per surviving service: that service's scope URL under that service.
//     Scopes that belong to no service (profile, openid, ...) go under sync
//     when sync is among them, since the Sync sign-in is where these tokens
//     start, otherwise under the first service. Scope URLs of bypassed
//     services are not written at all.
//   - Allowlist gate is per service: if a service has an allowlist and the
//     token's clientId isn't on it, that service's rows are skipped and the
//     service is reported in allowlistDenied. service='' is unrestricted.
//   - --service filter keeps only that service's rows; a token with none is
//     dropped before the allowlist gate, so it is not counted as denied. The
//     same applies when every service scope on a token is bypassed.
//   - Each row carries the token's own clientId (the new PK includes it,
//     so different RP clients for the same user/scope produce distinct rows).
//   - lastAuthorizedTosAt is set to the token's createdAt, NOT to a real ToS
//     view. For refreshTokens minted via prompt=none the user never saw a
//     ToS, but we have no separate "last consent" signal to draw from.
//     Backfilled values are upper bounds on "could have seen ToS by". On an
//     existing row only firstAuthorizedTosAt can move, and only earlier: an
//     older live token is evidence of an earlier grant, while a newer one
//     is not evidence of a later ToS view (see batchUpsert).
function resolveTargetRows(
  token: {
    userId: Buffer;
    clientId: Buffer;
    scope: string;
    createdAt: Date;
  },
  cfg: ServiceConfig,
  serviceFilter?: string,
  omitScopes?: ReadonlySet<string>
): ResolveResult {
  const rawScopes = token.scope.split(/\s+/).filter(Boolean);
  if (rawScopes.length === 0) {
    return { rows: [], allowlistDenied: [] };
  }

  const clientHex = token.clientId.toString('hex');
  const nonSyncServices = [
    ...new Set(
      rawScopes
        .map((s) => cfg.scopeToService.get(s))
        .filter((svc): svc is string => Boolean(svc) && svc !== 'sync')
    ),
  ];
  const { scopes } = dropUnconsentedSyncScope({
    scopes: rawScopes,
    serviceValue: nonSyncServices.length === 1 ? nonSyncServices[0] : '',
    clientIdHex: clientHex,
  });

  const services = inferServicesForToken(scopes, clientHex, cfg);
  if (services.length === 0) {
    return { rows: [], allowlistDenied: [] };
  }
  const matchedServices = new Set(
    scopes.map((s) => cfg.scopeToService.get(s)).filter(Boolean)
  );
  const multiService = matchedServices.size > 1;
  const primary = services.includes('sync') ? 'sync' : services[0];

  const scopesFor = (service: string): Set<string> => {
    if (!multiService) {
      const all = new Set(scopes);
      const canonical = cfg.canonicalScopes.get(service);
      if (canonical) all.add(canonical);
      return all;
    }
    const own = new Set<string>();
    const canonical = cfg.canonicalScopes.get(service);
    if (canonical) own.add(canonical);
    if (service === primary) {
      for (const s of scopes) {
        if (!cfg.scopeToService.has(s)) own.add(s);
      }
    }
    return own;
  };

  const tsMs = token.createdAt.getTime();
  const rows: UpsertRow[] = [];
  const allowlistDenied: string[] = [];
  for (const service of services) {
    if (serviceFilter !== undefined && service !== serviceFilter) {
      continue;
    }
    const allowlist = cfg.allowedClients.get(service);
    if (allowlist && !allowlist.has(clientHex)) {
      allowlistDenied.push(service);
      continue;
    }
    for (const scope of scopesFor(service)) {
      if (omitScopes?.has(scope)) {
        continue;
      }
      rows.push({
        uid: token.userId,
        scope,
        service,
        clientId: token.clientId,
        firstAuthorizedTosAt: tsMs,
        lastAuthorizedTosAt: tsMs,
      });
    }
  }

  return { rows, allowlistDenied };
}

// On conflict, only firstAuthorizedTosAt can change, and only when the token
// is from an earlier second than the row. refreshTokens.createdAt has
// whole-second precision while the row holds milliseconds, so a token minted
// in the same second as the row would otherwise look up to 999ms older; the
// + 999 treats the token as the latest instant in its second for the
// comparison, and the stored value is the token's own timestamp.
// lastAuthorizedTosAt is never updated: a token minted after the row is a
// silent refresh or exchange, not a ToS view. Several tokens in one batch can
// map to the same key, so those are merged first (earliest first, latest last).
//
// Returns MySQL's affected-rows count: 1 per inserted row, 2 per row whose
// firstAuthorizedTosAt moved, 0 per untouched row. That needs the pool opened
// without FOUND_ROWS, which otherwise reports 1 for an untouched row too. The
// count is a lower bound: if the connection drops after MySQL commits but
// before the OK packet arrives, the retry sees its own rows as untouched.
async function batchUpsert(query: Query, rows: UpsertRow[]): Promise<number> {
  if (rows.length === 0) return 0;

  const merged = new Map<string, UpsertRow>();
  for (const r of rows) {
    const key = JSON.stringify([
      r.uid.toString('hex'),
      r.scope,
      r.service,
      r.clientId.toString('hex'),
    ]);
    const prev = merged.get(key);
    if (!prev) {
      merged.set(key, { ...r });
    } else {
      prev.firstAuthorizedTosAt = Math.min(
        prev.firstAuthorizedTosAt,
        r.firstAuthorizedTosAt
      );
      prev.lastAuthorizedTosAt = Math.max(
        prev.lastAuthorizedTosAt,
        r.lastAuthorizedTosAt
      );
    }
  }
  const unique = [...merged.values()];

  const placeholders = unique.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
  const values = unique.flatMap((r) => [
    r.uid,
    r.scope,
    r.service,
    r.clientId,
    r.firstAuthorizedTosAt,
    r.lastAuthorizedTosAt,
  ]);

  const result = await query<{ affectedRows?: number }>(
    `INSERT INTO accountAuthorizations
       (uid, scope, service, clientId, firstAuthorizedTosAt, lastAuthorizedTosAt)
     VALUES ${placeholders}
     ON DUPLICATE KEY UPDATE
       firstAuthorizedTosAt = IF(
         VALUES(firstAuthorizedTosAt) + 999 < firstAuthorizedTosAt,
         VALUES(firstAuthorizedTosAt),
         firstAuthorizedTosAt
       )`,
    values
  );
  return Number(result?.affectedRows ?? 0);
}

async function estimateTotalTokens(query: Query): Promise<number> {
  // InnoDB TABLE_ROWS is an approximation but fine for progress display.
  const rows = await query<Array<{ TABLE_ROWS: number }>>(
    `SELECT TABLE_ROWS FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'refreshTokens'`
  );
  return rows[0]?.TABLE_ROWS ?? 0;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Codes the mysql driver / Node net stack surface for transient blips. A
// single packet hiccup or short lock contention shouldn't kill a multi-hour
// backfill — we retry, and only propagate the error when the same op fails
// repeatedly. Anything not in this set (schema errors, syntax errors, etc.)
// fails fast.
const TRANSIENT_DB_ERROR_CODES: ReadonlySet<string> = new Set([
  'PROTOCOL_CONNECTION_LOST',
  'ECONNRESET',
  'ETIMEDOUT',
  'EPIPE',
  'ER_LOCK_WAIT_TIMEOUT',
  'ER_LOCK_DEADLOCK',
]);

/**
 * Clamp statsd `code` tags to a bounded allowlist. Anything outside the
 * known set lands in 'other' so a novel driver-surfaced code can't blow
 * up tag cardinality on the metrics backend.
 */
function safeStatsdCode(code: string | undefined): string {
  return code && TRANSIENT_DB_ERROR_CODES.has(code) ? code : 'other';
}

async function withRetry<T>(
  operation: () => Promise<T>,
  context: {
    opName: string;
    attempts: number;
    initialDelayMs: number;
    log: Logger;
    statsd?: StatsD;
  }
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= context.attempts; attempt++) {
    try {
      return await operation();
    } catch (err) {
      lastErr = err;
      const code = (err as { code?: string }).code;
      const isTransient = !!code && TRANSIENT_DB_ERROR_CODES.has(code);
      if (!isTransient || attempt === context.attempts) {
        throw err;
      }
      const delayMs = context.initialDelayMs * Math.pow(2, attempt - 1);
      context.log.warn('backfill.retry', {
        op: context.opName,
        attempt,
        nextDelayMs: delayMs,
        code,
        err: errMessage(err),
      });
      context.statsd?.increment('account_authz.backfill.retry', {
        op: context.opName,
        code: safeStatsdCode(code),
      });
      await sleep(delayMs);
    }
  }
  throw lastErr;
}

type TokenRow = {
  token: Buffer;
  userId: Buffer;
  clientId: Buffer;
  scope: string;
  createdAt: Date;
};

async function fetchBatch(
  query: Query,
  cursor: Buffer,
  batchSize: number
): Promise<TokenRow[]> {
  return query<TokenRow[]>(
    'SELECT token, userId, clientId, scope, createdAt ' +
      'FROM refreshTokens WHERE token > ? ORDER BY token LIMIT ?',
    [cursor, batchSize]
  );
}

async function run(
  query: Query,
  cfg: ServiceConfig,
  log: Logger,
  opts: {
    dryRun: boolean;
    batchSize: number;
    batchDelayMs: number;
    serviceFilter?: string;
    omitScopes?: ReadonlySet<string>;
    startCursor?: Buffer;
    statsd?: StatsD;
    retryAttempts?: number;
    retryInitialDelayMs?: number;
  }
): Promise<void> {
  const { dryRun, batchSize, batchDelayMs, serviceFilter, statsd } = opts;
  const retryAttempts = opts.retryAttempts ?? 3;
  const retryInitialDelayMs = opts.retryInitialDelayMs ?? 500;
  const withDbRetry = <T>(opName: string, op: () => Promise<T>): Promise<T> =>
    withRetry(op, {
      opName,
      attempts: retryAttempts,
      initialDelayMs: retryInitialDelayMs,
      log,
      statsd,
    });

  const runStartedMs = Date.now();
  // Estimate is a progress-display nicety, not load-bearing. If
  // information_schema is unavailable or the DB role can't read it, log
  // the failure and continue with -1 so logs make the failed state
  // visible. Downstream percent calculation already guards against negatives.
  let estimated = -1;
  try {
    estimated = await estimateTotalTokens(query);
  } catch (err) {
    log.warn('backfill.estimate_failed', { err: errMessage(err) });
  }
  const allServiceNames = [...cfg.scopeToService.values()];
  log.info('backfill.start', {
    estimatedTokens: estimated,
    services: allServiceNames,
    serviceForClient: Object.fromEntries(cfg.serviceForClient),
    bypassConsent: [...cfg.bypassConsent],
    serviceFilter: serviceFilter ?? null,
    omitScopes: opts.omitScopes ? [...opts.omitScopes] : [],
    startCursor: opts.startCursor?.toString('hex') ?? null,
    batchSize,
    batchDelayMs,
    dryRun,
  });

  // Pagination cursor. All-zeros sorts before any token; advances to the last
  // token of each batch.
  let cursor = opts.startCursor ?? Buffer.alloc(32);
  let batchNum = 0;
  let totalTokensProcessed = 0;
  let totalUpsertsAttempted = 0;
  let totalRowsAffected = 0;
  let totalSkippedNoMatch = 0;
  let totalSkippedAllowlist = 0;
  const countsByService: Record<string, number> = {};
  for (const name of allServiceNames) countsByService[name] = 0;

  let rows = await withDbRetry('fetchBatch', () =>
    fetchBatch(query, cursor, batchSize)
  );

  while (rows.length > 0) {
    batchNum++;
    totalTokensProcessed += rows.length;
    const batchStartedMs = Date.now();

    const upserts: UpsertRow[] = [];
    // Per-batch aggregates flushed to statsd at batch boundary. Emitting a
    // packet per token would mean 50M+ UDP packets on a real backfill —
    // counts collapse here and ship once per batch.
    let batchSkippedNoMatch = 0;
    let batchSkippedAllowlist = 0;
    const batchUpsertsByService: Record<string, number> = {};

    for (const row of rows) {
      const { rows: resolved, allowlistDenied } = resolveTargetRows(
        row,
        cfg,
        serviceFilter,
        opts.omitScopes
      );

      if (allowlistDenied.length > 0) {
        totalSkippedAllowlist += allowlistDenied.length;
        batchSkippedAllowlist += allowlistDenied.length;
      }

      if (resolved.length === 0) {
        if (allowlistDenied.length === 0) {
          totalSkippedNoMatch++;
          batchSkippedNoMatch++;
        }
        continue;
      }

      for (const upsert of resolved) {
        upserts.push(upsert);
        countsByService[upsert.service] =
          (countsByService[upsert.service] ?? 0) + 1;
        batchUpsertsByService[upsert.service] =
          (batchUpsertsByService[upsert.service] ?? 0) + 1;
      }
    }

    if (batchSkippedAllowlist > 0) {
      statsd?.increment(
        'account_authz.backfill.tokens_skipped',
        batchSkippedAllowlist,
        { reason: 'client_not_allowed' }
      );
    }
    if (batchSkippedNoMatch > 0) {
      statsd?.increment(
        'account_authz.backfill.tokens_skipped',
        batchSkippedNoMatch,
        { reason: 'no_match' }
      );
    }
    for (const [service, count] of Object.entries(batchUpsertsByService)) {
      statsd?.increment('account_authz.backfill.upserts_attempted', count, {
        service,
      });
    }

    let batchAffected = 0;
    if (!dryRun && upserts.length > 0) {
      try {
        batchAffected = await withDbRetry('batchUpsert', () =>
          batchUpsert(query, upserts)
        );
      } catch (err) {
        statsd?.increment('account_authz.backfill.upsert_batch_failed');
        log.error('backfill.upsert_batch_failed', {
          batchNum,
          rowCount: upserts.length,
          err: errMessage(err),
        });
        throw err;
      }
    }

    totalUpsertsAttempted += upserts.length;
    totalRowsAffected += batchAffected;
    if (batchAffected > 0) {
      statsd?.increment('account_authz.backfill.rows_affected', batchAffected);
    }
    cursor = rows[rows.length - 1].token;

    const batchDurationMs = Date.now() - batchStartedMs;
    statsd?.timing('account_authz.backfill.batch_duration_ms', batchDurationMs);
    statsd?.increment('account_authz.backfill.tokens_scanned', rows.length);
    statsd?.increment('account_authz.backfill.batches_completed', {
      dry_run: String(dryRun),
    });

    const percent =
      estimated > 0
        ? Math.round((totalTokensProcessed / estimated) * 100)
        : null;
    log.info('backfill.batch', {
      batchNum,
      cursor: cursor.toString('hex'),
      tokensProcessed: totalTokensProcessed,
      percent,
      upsertsAttempted: totalUpsertsAttempted,
      rowsAffected: totalRowsAffected,
      skippedNoMatch: totalSkippedNoMatch,
      skippedAllowlist: totalSkippedAllowlist,
      durationMs: batchDurationMs,
    });

    if (rows.length < batchSize) break;

    if (batchDelayMs > 0) await sleep(batchDelayMs);

    rows = await withDbRetry('fetchBatch', () =>
      fetchBatch(query, cursor, batchSize)
    );
  }

  const totalDurationMs = Date.now() - runStartedMs;
  statsd?.timing('account_authz.backfill.run_duration_ms', totalDurationMs);
  log.info('backfill.complete', {
    tokensScanned: totalTokensProcessed,
    upsertsAttempted: totalUpsertsAttempted,
    rowsAffected: totalRowsAffected,
    skippedNoMatch: totalSkippedNoMatch,
    skippedAllowlist: totalSkippedAllowlist,
    totalDurationMs,
    totalDurationHuman: humanDuration(totalDurationMs),
    dryRun,
    countsByService,
  });

  if (totalUpsertsAttempted === 0 && !dryRun) {
    log.warn('backfill.no_rows_upserted', {
      op: 'backfill.complete',
      msg: 'No rows were upserted — verify oauthServer.exchange.serviceScopes and allowedClientsForService are configured correctly.',
    });
  }
}

export {
  buildServiceConfig,
  inferServicesForToken,
  resolveTargetRows,
  batchUpsert,
  fetchBatch,
  estimateTotalTokens,
  withRetry,
  run,
};

export async function init() {
  // require() (not import) so the module's env-driven config validation
  // doesn't fire when this file is imported by the spec.
  const config: ConfigType = require('../../config').default.getProperties();
  const statsd = new StatsD({ ...config.statsd, maxBufferSize: 0 });
  const log = require('../../lib/log')(
    config.log.level,
    'backfill-account-authorizations',
    statsd
  );

  program
    .version(pckg.version)
    .option(
      '--dry-run',
      'Log what would be written without writing (recommended first pass)',
      false
    )
    .option('--batch-size <number>', 'Rows read per iteration', '1000')
    .option(
      '--batch-delay-ms <number>',
      'Sleep between batches in ms (controls DB load)',
      '100'
    )
    .option(
      '--service <name>',
      'Only backfill a single service (e.g. vpn). Omit to backfill all configured services.'
    )
    .option(
      '--omit-scope <scope>',
      'Do not write rows for this scope (e.g. profile). Repeatable. Service inference still sees the full token scope.',
      (value: string, prev: string[]) => [...prev, value],
      [] as string[]
    )
    .option(
      '--start-cursor <hex>',
      'Resume after this refreshToken (the `cursor` field of the last backfill.batch log line)'
    )
    .option(
      '--retry-attempts <number>',
      'Total attempts (incl. first) for transient DB errors before giving up',
      '3'
    )
    .option(
      '--retry-initial-delay-ms <number>',
      'Initial backoff delay in ms; doubles on each retry (500 → 1000 → 2000)',
      '500'
    )
    .parse(process.argv);
  const options = program.opts();

  const dryRun: boolean = options.dryRun;
  const batchSize = parseInt(options.batchSize, 10) || 1000;
  const batchDelayMs = parseInt(options.batchDelayMs, 10) || 100;
  const retryAttempts = parseInt(options.retryAttempts, 10) || 3;
  const retryInitialDelayMs = parseInt(options.retryInitialDelayMs, 10) || 500;
  const serviceFilter: string | undefined = options.service;
  const omitScopes = new Set<string>(options.omitScope);

  const dbConfig = config.oauthServer.mysql;
  const exchangeCfg = config.oauthServer.exchange;
  const serviceScopes: Record<string, string> = exchangeCfg.serviceScopes;
  const allowedClientsForService: Record<string, string[]> =
    exchangeCfg.allowedClientsForService;
  const serviceForClient: Record<string, string> = exchangeCfg.serviceForClient;
  const bypassConsentForServices: string[] =
    exchangeCfg.bypassConsentForServices ?? [];

  let cfg: ServiceConfig;
  let startCursor: Buffer | undefined;
  try {
    if (options.startCursor !== undefined) {
      if (!/^[0-9a-f]{64}$/i.test(options.startCursor)) {
        throw new Error('--start-cursor must be 64 hex characters');
      }
      startCursor = Buffer.from(options.startCursor, 'hex');
    }
    if (Object.keys(serviceScopes).length === 0) {
      throw new Error(
        'oauthServer.exchange.serviceScopes is empty. Add at least one ' +
          'service entry (vpn, smartwindow, etc.) to config or config/secrets.json.'
      );
    }
    if (serviceFilter !== undefined && !(serviceFilter in serviceScopes)) {
      throw new Error(
        `No service '${serviceFilter}' found in oauthServer.exchange.serviceScopes. ` +
          `Available: ${Object.keys(serviceScopes).join(', ')}`
      );
    }
    cfg = buildServiceConfig(
      serviceScopes,
      allowedClientsForService,
      serviceForClient,
      bypassConsentForServices
    );
  } catch (err) {
    log.error('backfill.config_error', { err: errMessage(err) });
    return 1;
  }

  // connectionLimit: 1 keeps load on the OAuth DB single-threaded (this script
  // is sequential by design — see --batch-delay-ms). The pool auto-replaces a
  // connection that dies from wait_timeout / network drops; paired with
  // withRetry, the script rides through transient blips.
  const pool = mysql.createPool({
    connectionLimit: 1,
    host: dbConfig.host || 'localhost',
    port: parseInt(dbConfig.port || '3306', 10),
    user: dbConfig.user || 'root',
    password: dbConfig.password || '',
    database: dbConfig.database || 'fxa_oauth',
    timezone: '+00:00',
    charset: 'UTF8MB4_UNICODE_CI',
    // Without this, affectedRows counts an untouched duplicate as 1 and
    // batchUpsert cannot tell writes from no-ops.
    flags: '-FOUND_ROWS',
  });

  pool.on('connection', (conn: mysql.PoolConnection) => {
    conn.on('error', (err) => {
      // Log only the bounded `code` field. The mysql driver decorates errors
      // with internal state that has historically included connection options
      // (host, user, even password in older versions); logging the raw `err`
      // or `String(err)` risks leaking those into structured logs. Clamp
      // the metric tag to a known allowlist; let the log carry the raw code
      // for ops triage.
      const rawCode = (err as { code?: string }).code ?? 'unknown';
      statsd?.increment('account_authz.backfill.connection_error', {
        code: safeStatsdCode(rawCode),
      });
      log.error('backfill.connection_error', {
        code: rawCode,
        msg: 'Connection lost mid-run; pool will acquire a fresh one for the next query.',
      });
    });
  });

  const query = makeQuery(pool);

  try {
    await run(query, cfg, log, {
      dryRun,
      batchSize,
      batchDelayMs,
      serviceFilter,
      omitScopes,
      startCursor,
      statsd,
      retryAttempts,
      retryInitialDelayMs,
    });
  } catch (err) {
    log.error('backfill.run_failed', {
      code: (err as { code?: string }).code,
      err: errMessage(err),
      msg: 'Run aborted; re-run with --start-cursor set to the last logged batch cursor (upsert is idempotent).',
    });
    return 1;
  } finally {
    await new Promise<void>((resolve) => pool.end(() => resolve()));
    // Flush pending UDP metrics. Without this the final run_duration_ms
    // timing and any retry packets emitted in the last few ms can be lost
    // to socket teardown at process.exit.
    await promisify(statsd.close).bind(statsd)();
  }

  return 0;
}

if (require.main === module) {
  let exitStatus = 1;
  init()
    .then((code) => {
      exitStatus = code;
    })
    .catch((err) => {
      // Fallback to console.error here: init() constructs the structured log
      // via require('../../lib/log'), so a crash during config or log
      // construction itself leaves us with no log instance to use.
      console.error(err);
    })
    .finally(() => {
      process.exit(exitStatus);
    });
}
