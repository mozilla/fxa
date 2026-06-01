/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Backfill script for the accountAuthorizations consent ledger.
 *
 * Walks the refreshTokens table in cursor order and writes one consent row
 * per (uid, scope, service, clientId) tuple for every scope on every token.
 * Each token's `service` column is inferred ONCE from its scopes (mirroring
 * lib/routes/oauth/authorization.js:recordAuthorizationRows): if exactly one
 * of the token's scopes is a configured service's scope URL, that's the
 * service; otherwise service=''. Every row written for that token then
 * carries that same service value — a VPN sign-in with
 * scope='<vpn-scope-url> profile' lands as two rows both with service='vpn',
 * and a 123done sign-in with scope='openid profile' lands as two rows both
 * with service=''. Backfilled rows look identical to organic ones, including
 * the service='' rows that future ToS-rejection logic on /authorization will
 * read for non-browser RPs.
 *
 * Per service notes:
 *   - relay rows are written even though token-exchange currently bypasses
 *     the consent check. Two reasons: (a) the firstAuthorizedTosAt /
 *     lastAuthorizedTosAt columns are a per-user ToS-acceptance ledger
 *     independent of how exchange decides today, and (b) the bypass is
 *     explicitly transitional — see EXCHANGE_DECISION.BYPASS in
 *     lib/oauth/db/index.js and the "Remove this path once application-
 *     services ships a 4xx handler" comment in lib/routes/oauth/token.js.
 *     Backfilled rows prevent existing users from being re-prompted when
 *     that bypass is eventually removed.
 *   - sync rows materialize from mobile only — Firefox Desktop calls /destroy
 *     on its sync refresh token immediately after sign-in, so Desktop sync
 *     tokens aren't present in the scan source.
 *
 * Prerequisites:
 *   - accountAuthorizations table at the new (clientId, firstAuthorizedTosAt,
 *     lastAuthorizedTosAt) shape.
 *   - oauthServer.exchange.serviceScopes + allowedClientsForService populated
 *     in config.
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
 * The script always scans the full refreshTokens table from the start.
 * On failure: restart the script — `INSERT … ON DUPLICATE KEY UPDATE
 * LEAST(first…)/GREATEST(last…)` is idempotent, so re-running converges.
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
import program from 'commander';
import { StatsD } from 'hot-shots';
import pckg from '../../package.json';

export interface ServiceConfig {
  // Inverse map: service scope URL → service name. Drives scope matching.
  scopeToService: Map<string, string>;
  // service → Set<lowercased clientId hex>. Services absent from the map are
  // unrestricted (any clientId may produce a row); services present with
  // a non-empty set require clientId membership. Mirrors the runtime
  // isClientAllowedForService gate.
  allowedClients: Map<string, Set<string>>;
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
  // The inferred service for this token if its allowlist gate rejected the
  // clientId, otherwise empty. Length is 0 or 1 — a token has exactly one
  // inferred service. Used by the caller to emit a security-relevant skip
  // metric distinct from "no rows produced".
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
  allowedClientsForService: Record<string, string[]>
): ServiceConfig {
  const scopeToService = new Map<string, string>();
  for (const [service, scope] of Object.entries(serviceScopes)) {
    scopeToService.set(scope, service);
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

  return { scopeToService, allowedClients };
}

// Per-token service inference. Mirrors the runtime path
// (lib/routes/oauth/authorization.js:recordAuthorizationRows): the URL
// ?service= param is the source of truth in runtime but isn't preserved on
// the refreshToken, so we fall back to runtime's inference branch — if
// exactly one of the token's scopes is a configured service's scope URL,
// that's the service; otherwise service=''. Two or more service-scope URLs
// are ambiguous and resolve to '' (matches runtime's `inferred.length === 1`
// guard).
function inferServiceForToken(
  scopes: string[],
  scopeToService: Map<string, string>
): string {
  const matchedServices = scopes
    .map((s) => scopeToService.get(s))
    .filter((s): s is string => Boolean(s));
  return matchedServices.length === 1 ? matchedServices[0] : '';
}

// Mirrors lib/routes/oauth/authorization.js:recordAuthorizationRows semantics
// for the backfill side:
//   - One inferred service per token (see inferServiceForToken), applied as
//     the `service` column on every row written for that token. This matches
//     runtime, which derives serviceValue once from URL/scope inference and
//     then writes each scope with that same serviceValue. A 123done token
//     with scope='openid profile' lands as two rows with service=''; a VPN
//     token with scope='<vpn-scope-url> profile' lands as two rows both with
//     service='vpn'.
//   - Allowlist gate is per-token, not per-scope: if the inferred service
//     has an allowlist and the token's clientId isn't on it, the whole
//     token is skipped (matches runtime's early-return on
//     isClientAllowedForService failure). service='' is always unrestricted.
//   - --service filter is also per-token: tokens whose inferred service !=
//     filter are dropped wholesale. Under correct runtime mirroring, every
//     row from a single token carries the same service, so a filter naturally
//     excludes whole tokens — service='' rows can't appear under --service.
//   - Each row carries the token's own clientId (the new PK includes it,
//     so different RP clients for the same user/scope produce distinct rows).
//   - lastAuthorizedTosAt is set to the token's createdAt, NOT to a real ToS
//     view. For refreshTokens minted via prompt=none the user never saw a
//     ToS, but we have no separate "last consent" signal to draw from.
//     Backfilled values are upper bounds on "could have seen ToS by";
//     organic /authorization writes converge the value forward over time.
function resolveTargetRows(
  token: {
    userId: Buffer;
    clientId: Buffer;
    scope: string;
    createdAt: Date;
  },
  cfg: ServiceConfig,
  serviceFilter?: string
): ResolveResult {
  const scopes = token.scope.split(/\s+/).filter(Boolean);
  if (scopes.length === 0) {
    return { rows: [], allowlistDenied: [] };
  }

  const serviceValue = inferServiceForToken(scopes, cfg.scopeToService);

  if (serviceFilter !== undefined && serviceValue !== serviceFilter) {
    return { rows: [], allowlistDenied: [] };
  }

  const clientHex = token.clientId.toString('hex').toLowerCase();
  const allowlist = cfg.allowedClients.get(serviceValue);
  if (allowlist && !allowlist.has(clientHex)) {
    return { rows: [], allowlistDenied: [serviceValue] };
  }

  const tsMs = token.createdAt.getTime();
  const uniqueScopes = new Set(scopes);
  const rows: UpsertRow[] = [];
  for (const scope of uniqueScopes) {
    rows.push({
      uid: token.userId,
      scope,
      service: serviceValue,
      clientId: token.clientId,
      firstAuthorizedTosAt: tsMs,
      lastAuthorizedTosAt: tsMs,
    });
  }

  return { rows, allowlistDenied: [] };
}

// LEAST(firstAuthorizedTosAt) preserves the earliest discovered grant across
// arbitrary cursor-scan order. GREATEST(lastAuthorizedTosAt) keeps the latest
// observed timestamp, matching the runtime ingress's GREATEST clause.
async function batchUpsert(query: Query, rows: UpsertRow[]): Promise<void> {
  if (rows.length === 0) return;

  const placeholders = rows.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
  const values = rows.flatMap((r) => [
    r.uid,
    r.scope,
    r.service,
    r.clientId,
    r.firstAuthorizedTosAt,
    r.lastAuthorizedTosAt,
  ]);

  await query(
    `INSERT INTO accountAuthorizations
       (uid, scope, service, clientId, firstAuthorizedTosAt, lastAuthorizedTosAt)
     VALUES ${placeholders}
     ON DUPLICATE KEY UPDATE
       firstAuthorizedTosAt = LEAST(firstAuthorizedTosAt, VALUES(firstAuthorizedTosAt)),
       lastAuthorizedTosAt  = GREATEST(lastAuthorizedTosAt, VALUES(lastAuthorizedTosAt))`,
    values
  );
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
    serviceFilter: serviceFilter ?? null,
    batchSize,
    batchDelayMs,
    dryRun,
  });

  // Internal pagination cursor. Starts at all-zeros (before any token in
  // sort order) and advances to the last token of each batch.
  let cursor = Buffer.alloc(32);
  let batchNum = 0;
  let totalTokensProcessed = 0;
  let totalUpsertsAttempted = 0;
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
        serviceFilter
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

    if (!dryRun && upserts.length > 0) {
      try {
        await withDbRetry('batchUpsert', () => batchUpsert(query, upserts));
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
      tokensProcessed: totalTokensProcessed,
      percent,
      upsertsAttempted: totalUpsertsAttempted,
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
  inferServiceForToken,
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
  const config = require('../../config').default.getProperties();
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

  const dryRun: boolean = program.dryRun;
  const batchSize = parseInt(program.batchSize, 10) || 1000;
  const batchDelayMs = parseInt(program.batchDelayMs, 10) || 100;
  const retryAttempts = parseInt(program.retryAttempts, 10) || 3;
  const retryInitialDelayMs = parseInt(program.retryInitialDelayMs, 10) || 500;
  const serviceFilter: string | undefined = program.service;

  const dbConfig = config.oauthServer.mysql;
  const exchangeCfg = config.oauthServer.exchange ?? {};
  const serviceScopes: Record<string, string> = exchangeCfg.serviceScopes ?? {};
  const allowedClientsForService: Record<string, string[]> =
    exchangeCfg.allowedClientsForService ?? {};

  let cfg: ServiceConfig;
  try {
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
    cfg = buildServiceConfig(serviceScopes, allowedClientsForService);
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
      statsd,
      retryAttempts,
      retryInitialDelayMs,
    });
  } catch (err) {
    log.error('backfill.run_failed', {
      code: (err as { code?: string }).code,
      err: errMessage(err),
      msg: 'Run aborted; re-run the script (upsert is idempotent).',
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
