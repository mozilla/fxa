/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Backfill script for the accountAuthorizations scope -> scopeId migration
 * (FXA-14169, Phase 2).
 *
 * Copies every existing accountAuthorizations (v1) row into
 * accountAuthorizations_v2, replacing the `scope` string with its integer
 * `scopeId` from the scopes table. Walks v1 in primary-key order via keyset
 * pagination and upserts each batch into v2.
 *
 * Resolve-only, matching the live dual-write: a v1 row whose `scope` has no
 * row in the scopes table cannot be written to v2 (scopeId is a NOT NULL FK).
 * Those scopes are counted and reported so they can be seeded, then the script
 * re-run. v1 stays authoritative until cutover, so a skipped row drops nothing.
 *
 * The v2 upsert uses LEAST(firstAuthorizedTosAt) / GREATEST(lastAuthorizedTosAt)
 * so it is idempotent AND reconciles the true historical firstAuthorizedTosAt
 * from v1 into any row the live dual-write already created (whose first would
 * otherwise be the dual-write time, not the original authorization time).
 *
 * Run only AFTER Phase 1 dual-write is live on every pod, so only historical
 * rows need touching.
 *
 * Usage (from packages/fxa-auth-server):
 *   node -r ts-node/register/transpile-only -r tsconfig-paths/register \
 *     scripts/backfill-account-authorizations-v2/backfill-account-authorizations-v2.ts --dry-run
 *   node -r ts-node/register/transpile-only -r tsconfig-paths/register \
 *     scripts/backfill-account-authorizations-v2/backfill-account-authorizations-v2.ts
 *
 * Every batch logs an opaque `cursor` token on its backfill_v2.batch line. To
 * continue a run that was interrupted (Ctrl-C, crash, pod eviction), take the
 * token from the last such line and pass it back — run a burst, stop, resume
 * later. Rescanning a batch or two is free: the upsert is idempotent, so there
 * is deliberately no handler trying to capture the exact interruption point.
 *   node -r ts-node/register/transpile-only -r tsconfig-paths/register \
 *     scripts/backfill-account-authorizations-v2/backfill-account-authorizations-v2.ts --resume-from <token>
 *
 * Careful: the missing-scopes seed list is per-process. The
 * backfill_v2.missing_scopes warning at completion covers only the rows THAT
 * run scanned, so a walk split across resumed chunks must have every chunk's
 * list unioned — or the final verification pass must be one uninterrupted run.
 * Treating the last chunk's list as complete would under-seed the scopes table
 * and silently block Phase 3 cutover.
 *
 * Exit criteria (Phase 3 cutover is blocked until this holds):
 *   SELECT COUNT(*) FROM accountAuthorizations v1
 *     LEFT JOIN scopes s ON s.scope = v1.scope
 *     LEFT JOIN accountAuthorizations_v2 v2
 *       ON v2.uid = v1.uid AND v2.service = v1.service
 *      AND v2.scopeId = s.id AND v2.clientId = v1.clientId
 *   WHERE v2.uid IS NULL;   -- must be 0 (any remainder is an unseeded scope)
 */

import { promisify } from 'util';
import * as mysql from 'mysql';
import program from 'commander';
import { StatsD } from 'hot-shots';
import pckg from '../../package.json';

export interface V1Row {
  uid: Buffer;
  scope: string;
  service: string;
  clientId: Buffer;
  firstAuthorizedTosAt: number;
  lastAuthorizedTosAt: number;
}

export interface V2Row {
  uid: Buffer;
  service: string;
  scopeId: number;
  clientId: Buffer;
  firstAuthorizedTosAt: number;
  lastAuthorizedTosAt: number;
}

export interface Cursor {
  uid: Buffer;
  scope: string;
  service: string;
  clientId: Buffer;
}

export interface Logger {
  info: (op: string, data?: unknown) => void;
  warn: (op: string, data?: unknown) => void;
  error: (op: string, data?: unknown) => void;
}

export type Query = <T = unknown>(
  sql: string,
  values?: unknown[]
) => Promise<T>;

const V2_UPSERT_PREFIX =
  'INSERT INTO accountAuthorizations_v2 ' +
  '(uid, service, scopeId, clientId, firstAuthorizedTosAt, lastAuthorizedTosAt) ' +
  'VALUES ';
const V2_UPSERT_SUFFIX =
  ' ON DUPLICATE KEY UPDATE ' +
  'firstAuthorizedTosAt = LEAST(firstAuthorizedTosAt, VALUES(firstAuthorizedTosAt)), ' +
  'lastAuthorizedTosAt = GREATEST(lastAuthorizedTosAt, VALUES(lastAuthorizedTosAt))';

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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function humanDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h${m}m${s}s`;
  if (m > 0) return `${m}m${s}s`;
  return `${s}s`;
}

// uid is BINARY(16), clientId is BINARY(8) — hex of exactly those widths.
const UID_HEX = /^[0-9a-fA-F]{32}$/;
const CLIENT_ID_HEX = /^[0-9a-fA-F]{16}$/;

/**
 * Encode a cursor as an opaque resume token. Base64 so the token survives being
 * pasted as a single shell argument — `scope` is a VARCHAR(256) that can hold
 * spaces, quotes and `$`.
 */
export function encodeCursor(c: Cursor): string {
  return Buffer.from(
    JSON.stringify({
      uid: c.uid.toString('hex'),
      scope: c.scope,
      service: c.service,
      clientId: c.clientId.toString('hex'),
    })
  ).toString('base64');
}

/**
 * Decode a resume token, validating strictly. A malformed token that decoded to
 * a garbage cursor would silently skip rows and then report success, so every
 * field is checked and anything unexpected throws.
 */
export function decodeCursor(rawToken: string): Cursor {
  // Tokens get copied out of wrapped log viewers, so tolerate surrounding
  // whitespace rather than failing with a misleading "not valid base64".
  const token = rawToken.trim();
  // Buffer's base64 decoder is lenient (it drops invalid characters), so
  // round-trip the token to reject anything that isn't really base64.
  if (Buffer.from(token, 'base64').toString('base64') !== token) {
    throw new Error('Invalid resume cursor: not valid base64');
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
  } catch (err) {
    throw new Error(
      `Invalid resume cursor: not valid JSON (${errMessage(err)})`
    );
  }
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Invalid resume cursor: expected a JSON object');
  }
  const { uid, scope, service, clientId } = parsed as Record<string, unknown>;
  if (typeof uid !== 'string' || !UID_HEX.test(uid)) {
    throw new Error('Invalid resume cursor: uid must be 32 hex characters');
  }
  if (typeof clientId !== 'string' || !CLIENT_ID_HEX.test(clientId)) {
    throw new Error(
      'Invalid resume cursor: clientId must be 16 hex characters'
    );
  }
  if (typeof scope !== 'string') {
    throw new Error('Invalid resume cursor: scope must be a string');
  }
  if (typeof service !== 'string') {
    throw new Error('Invalid resume cursor: service must be a string');
  }
  return {
    uid: Buffer.from(uid, 'hex'),
    scope,
    service,
    clientId: Buffer.from(clientId, 'hex'),
  };
}

// Codes the mysql driver / Node net stack surface for transient blips. A single
// packet hiccup or short lock contention shouldn't kill a multi-hour backfill —
// we retry, and only propagate the error when the same op fails repeatedly.
// Anything not in this set (schema/syntax errors, etc.) fails fast.
const TRANSIENT_DB_ERROR_CODES: ReadonlySet<string> = new Set([
  'PROTOCOL_CONNECTION_LOST',
  'ECONNRESET',
  'ETIMEDOUT',
  'EPIPE',
  'ER_LOCK_WAIT_TIMEOUT',
  'ER_LOCK_DEADLOCK',
]);

// Clamp statsd `code` tags to the bounded allowlist so a novel driver code
// can't blow up tag cardinality.
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
      context.log.warn('backfill_v2.retry', {
        op: context.opName,
        attempt,
        nextDelayMs: delayMs,
        code,
        err: errMessage(err),
      });
      context.statsd?.increment('account_authz.backfill_v2.retry', {
        op: context.opName,
        code: safeStatsdCode(code),
      });
      await sleep(delayMs);
    }
  }
  throw lastErr;
}

/** Distinct scope strings in a batch, preserving first-seen order. */
export function distinctScopes(rows: V1Row[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const row of rows) {
    if (!seen.has(row.scope)) {
      seen.add(row.scope);
      out.push(row.scope);
    }
  }
  return out;
}

/**
 * Split a v1 batch into v2 rows (scope resolved to scopeId) and a per-scope
 * count of rows that couldn't be resolved (scope absent from the scopes table).
 */
export function partitionBatch(
  rows: V1Row[],
  scopeIdByScope: Map<string, number>
): { v2Rows: V2Row[]; missing: Map<string, number> } {
  const v2Rows: V2Row[] = [];
  const missing = new Map<string, number>();
  for (const row of rows) {
    // scopes.scope is a case-insensitive unique key, so the resolver keys the
    // map by lower-cased scope; match that here. Otherwise a case-variant scope
    // the DB resolved would be miscounted as missing and never backfilled —
    // disagreeing with the collation-insensitive exit-criteria query.
    const scopeId = scopeIdByScope.get(row.scope.toLowerCase());
    if (scopeId === undefined) {
      // Report the original (non-folded) string so the seed list is accurate.
      missing.set(row.scope, (missing.get(row.scope) ?? 0) + 1);
      continue;
    }
    v2Rows.push({
      uid: row.uid,
      service: row.service,
      scopeId,
      clientId: row.clientId,
      firstAuthorizedTosAt: row.firstAuthorizedTosAt,
      lastAuthorizedTosAt: row.lastAuthorizedTosAt,
    });
  }
  return { v2Rows, missing };
}

/** Build the bulk v2 upsert SQL + flat params for a set of resolved rows. */
export function buildV2Upsert(v2Rows: V2Row[]): {
  sql: string;
  params: unknown[];
} {
  const tuples = v2Rows.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
  const params: unknown[] = [];
  for (const r of v2Rows) {
    params.push(
      r.uid,
      r.service,
      r.scopeId,
      r.clientId,
      r.firstAuthorizedTosAt,
      r.lastAuthorizedTosAt
    );
  }
  return { sql: V2_UPSERT_PREFIX + tuples + V2_UPSERT_SUFFIX, params };
}

async function fetchBatch(
  query: Query,
  cursor: Cursor | null,
  batchSize: number
): Promise<V1Row[]> {
  const cols =
    'uid, scope, service, clientId, firstAuthorizedTosAt, lastAuthorizedTosAt';
  if (!cursor) {
    return query<V1Row[]>(
      `SELECT ${cols} FROM accountAuthorizations ` +
        'ORDER BY uid, scope, service, clientId LIMIT ?',
      [batchSize]
    );
  }
  // Row-value keyset pagination over the full PK — index-served, resumable.
  // `uid >= ?` is implied by the tuple comparison and filters no extra rows, but
  // it is load-bearing: MySQL 8 won't range-optimize a row constructor on this
  // key, so without it the plan is access_type "index" and every batch rescans
  // the PRIMARY index from the start (O(offset), ~33h over 23.1M rows). The
  // redundant conjunct gives the optimizer a single-column range to seek on
  // (access_type "range", used_key_parts ["uid"]) — measured 19.4ms vs ~7s for
  // 1000 rows at a cursor 94% into the keyspace. uid is bound twice by design.
  return query<V1Row[]>(
    `SELECT ${cols} FROM accountAuthorizations ` +
      'WHERE uid >= ? ' +
      'AND (uid, scope, service, clientId) > (?, ?, ?, ?) ' +
      'ORDER BY uid, scope, service, clientId LIMIT ?',
    [
      cursor.uid,
      cursor.uid,
      cursor.scope,
      cursor.service,
      cursor.clientId,
      batchSize,
    ]
  );
}

async function resolveScopeIds(
  query: Query,
  scopes: string[]
): Promise<Map<string, number>> {
  if (scopes.length === 0) return new Map();
  const placeholders = scopes.map(() => '?').join(', ');
  const rows = await query<Array<{ id: number; scope: string }>>(
    `SELECT id, scope FROM scopes WHERE scope IN (${placeholders})`,
    scopes
  );
  // Key by lower-cased scope to match partitionBatch's case-folded lookup
  // (scopes.scope is a case-insensitive unique key).
  return new Map(rows.map((r) => [r.scope.toLowerCase(), r.id]));
}

export async function run(
  query: Query,
  log: Logger,
  opts: {
    dryRun: boolean;
    batchSize: number;
    batchDelayMs: number;
    statsd?: StatsD;
    startCursor?: Cursor | null;
  }
): Promise<void> {
  const { dryRun, batchSize, batchDelayMs, statsd } = opts;
  const withDbRetry = <T>(opName: string, op: () => Promise<T>): Promise<T> =>
    withRetry(op, {
      opName,
      attempts: 3,
      initialDelayMs: 500,
      log,
      statsd,
    });
  const runStartedMs = Date.now();
  log.info('backfill_v2.start', {
    batchSize,
    batchDelayMs,
    dryRun,
    // Token, not the raw Cursor: Buffers serialise unhelpfully, and this is the
    // value someone would paste back into --resume-from.
    startCursor: opts.startCursor ? encodeCursor(opts.startCursor) : undefined,
  });

  let cursor: Cursor | null = opts.startCursor ?? null;
  let batchNum = 0;
  let totalScanned = 0;
  let totalV2Written = 0;
  // Distinct unresolved scopes across the whole run — the seed list.
  const missingTotals = new Map<string, number>();

  let rows = await withDbRetry('fetchBatch', () =>
    fetchBatch(query, cursor, batchSize)
  );
  while (rows.length > 0) {
    batchNum++;
    totalScanned += rows.length;
    const batchStartedMs = Date.now();

    const scopeIdByScope = await withDbRetry('resolveScopeIds', () =>
      resolveScopeIds(query, distinctScopes(rows))
    );
    const { v2Rows, missing } = partitionBatch(rows, scopeIdByScope);

    for (const [scope, count] of missing) {
      missingTotals.set(scope, (missingTotals.get(scope) ?? 0) + count);
    }
    if (missing.size > 0) {
      statsd?.increment(
        'account_authz.backfill_v2.rows_skipped_missing_scope',
        [...missing.values()].reduce((a, b) => a + b, 0)
      );
    }

    if (!dryRun && v2Rows.length > 0) {
      const { sql, params } = buildV2Upsert(v2Rows);
      try {
        await withDbRetry('upsert', () => query(sql, params));
      } catch (err) {
        statsd?.increment('account_authz.backfill_v2.upsert_batch_failed');
        log.error('backfill_v2.upsert_batch_failed', {
          batchNum,
          rowCount: v2Rows.length,
          err: errMessage(err),
        });
        throw err;
      }
    }
    totalV2Written += v2Rows.length;

    const last = rows[rows.length - 1];
    cursor = {
      uid: last.uid,
      scope: last.scope,
      service: last.service,
      clientId: last.clientId,
    };
    const cursorToken = encodeCursor(cursor);

    statsd?.timing(
      'account_authz.backfill_v2.batch_duration_ms',
      Date.now() - batchStartedMs
    );
    statsd?.increment('account_authz.backfill_v2.rows_scanned', rows.length);
    log.info('backfill_v2.batch', {
      batchNum,
      totalScanned,
      totalV2Written,
      missingScopesSoFar: missingTotals.size,
      cursor: cursorToken,
    });

    if (rows.length < batchSize) break;
    if (batchDelayMs > 0) await sleep(batchDelayMs);
    rows = await withDbRetry('fetchBatch', () =>
      fetchBatch(query, cursor, batchSize)
    );
  }

  const totalDurationMs = Date.now() - runStartedMs;
  statsd?.timing('account_authz.backfill_v2.run_duration_ms', totalDurationMs);
  log.info('backfill_v2.complete', {
    totalScanned,
    totalV2Written,
    missingScopes: Object.fromEntries(missingTotals),
    missingScopeCount: missingTotals.size,
    totalDurationMs,
    totalDurationHuman: humanDuration(totalDurationMs),
    dryRun,
  });
  if (missingTotals.size > 0) {
    log.warn('backfill_v2.missing_scopes', {
      msg: 'Seed these scopes into the scopes table, then re-run until clean. Cutover is blocked while any remain.',
      scopes: [...missingTotals.keys()],
    });
  }
}

export { fetchBatch, resolveScopeIds };

export async function init(): Promise<number> {
  // require() (not import) so env-driven config validation doesn't fire when
  // this file is imported by the spec.
  const config = require('../../config').default.getProperties();
  const statsd = new StatsD({ ...config.statsd, maxBufferSize: 0 });
  const log = require('../../lib/log')(
    config.log.level,
    'backfill-account-authorizations-v2',
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
      '--resume-from <token>',
      "Opaque cursor token from a prior run's backfill_v2.batch log line; resume immediately after that row"
    )
    .parse(process.argv);

  const dryRun: boolean = program.dryRun;
  // Clamp to sane bounds: batchSize < 1 would be a LIMIT error or a silent
  // no-op logged as success; a negative delay is meaningless.
  const batchSize = Math.max(1, parseInt(program.batchSize, 10) || 1000);
  const batchDelayMs = Math.max(0, parseInt(program.batchDelayMs, 10) || 100);

  // Fail fast on a bad token, before any connection is opened. Checked against
  // undefined, not truthiness: `--resume-from "$LAST_CURSOR"` with an unset
  // variable would otherwise be read as "no cursor" and silently restart the
  // walk from row zero, which only shows up as hours of wasted scan.
  let startCursor: Cursor | null = null;
  if (program.resumeFrom !== undefined) {
    try {
      startCursor = decodeCursor(program.resumeFrom);
    } catch (err) {
      log.error('backfill_v2.invalid_resume_cursor', { err: errMessage(err) });
      return 1;
    }
  }

  const dbConfig = config.oauthServer.mysql;

  // connectionLimit: 1 keeps load on the OAuth DB single-threaded (this script
  // is sequential by design — see --batch-delay-ms).
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

  // A connection dropped mid-run emits 'error' on the connection; without a
  // handler that is an unhandled EventEmitter error and crashes the process.
  // Log only the bounded `code` (the driver decorates errors with connection
  // options that have historically included credentials).
  pool.on('connection', (conn: mysql.PoolConnection) => {
    conn.on('error', (err) => {
      const rawCode = (err as { code?: string }).code ?? 'unknown';
      statsd?.increment('account_authz.backfill_v2.connection_error', {
        code: safeStatsdCode(rawCode),
      });
      log.error('backfill_v2.connection_error', {
        code: rawCode,
        msg: 'Connection lost mid-run; the pool will acquire a fresh one.',
      });
    });
  });

  const query = makeQuery(pool);

  try {
    await run(query, log, {
      dryRun,
      batchSize,
      batchDelayMs,
      statsd,
      startCursor,
    });
  } catch (err) {
    log.error('backfill_v2.run_failed', {
      code: (err as { code?: string }).code,
      err: errMessage(err),
      msg: 'Run aborted; re-run the script (upsert is idempotent), optionally with --resume-from <cursor> using the token from the last backfill_v2.batch line.',
    });
    return 1;
  } finally {
    // Swallow cleanup errors: a failing pool.end/statsd.close must not turn a
    // successful run into a non-zero exit (or mask the real run error above).
    try {
      await new Promise<void>((resolve) => pool.end(() => resolve()));
      await promisify(statsd.close).bind(statsd)();
    } catch (err) {
      log.warn('backfill_v2.cleanup_failed', { err: errMessage(err) });
    }
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
      console.error(err);
    })
    .finally(() => {
      process.exit(exitStatus);
    });
}
