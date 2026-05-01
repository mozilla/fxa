/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Backfill script for the accountAuthorizations table.
 *
 * Makes a single ordered pass through the refreshTokens table and upserts a
 * row into accountAuthorizations for every token whose scope or clientId maps
 * to a configured browserService.  One pass covers all services.
 *
 * Prerequisites:
 *   - accountAuthorizations table created (FXA-12931 migration deployed)
 *   - browserServices populated in config (clientIds, authorizationScope, etc.)
 *
 * Usage (from packages/fxa-auth-server):
 *
 *   # Single-process (suitable up to ~50M tokens)
 *   node -r ts-node scripts/backfill-account-authorizations/backfill-account-authorizations.ts --dry-run
 *   node -r ts-node scripts/backfill-account-authorizations/backfill-account-authorizations.ts
 *
 *   # Resume after interruption
 *   node -r ts-node scripts/backfill-account-authorizations/backfill-account-authorizations.ts \
 *     --start-cursor $(cat temp/backfill-cursor.txt)
 *
 *   # Parallel workers — splits the token keyspace evenly across N processes.
 *   # token is a SHA256 hash so values distribute uniformly across the key space.
 *   # Run each command in a separate terminal / tmux pane:
 *   node -r ts-node scripts/backfill-account-authorizations/backfill-account-authorizations.ts --worker-index 0 --worker-count 8
 *   node -r ts-node scripts/backfill-account-authorizations/backfill-account-authorizations.ts --worker-index 1 --worker-count 8
 *   # ... up to worker-index 7
 *   # Each worker writes its own checkpoint: temp/backfill-cursor-worker-0.txt, etc.
 *
 *   # Filter to a single service
 *   node -r ts-node scripts/backfill-account-authorizations/backfill-account-authorizations.ts --service relay
 *
 * Execution plan:
 *   1. --dry-run on stage           → verify per-service counts
 *   2. Live run on stage            → spot-check accountAuthorizations rows
 *   3. --dry-run on prod            → validate expected counts
 *   4. Live run on prod (off-peak)  → parallel workers if table > 50M rows
 */

import * as fs from 'fs';
import * as path from 'path';
import * as mysql from 'mysql';
import program from 'commander';
import { StatsD } from 'hot-shots';
import pckg from '../../package.json';
import { SERVICE_AMBIGUOUS_CLIENT_IDS } from '../../lib/oauth/browser-services';

export interface BrowserServiceConfig {
  displayName: string;
  authorizationScope: string;
  clientIds: string[];
  serviceParams: string[];
  retentionDays: number;
  allowSilentExchange: boolean;
}

export interface ResolvedService {
  name: string;
  authorizationScope: string;
  clientIdSet: Set<string>; // lower-case hex strings for O(1) lookup
}

export interface ServiceIndexes {
  byName: Map<string, ResolvedService>;
  scopeIdx: Map<string, string>; // scope value → service name
  clientIdIdx: Map<string, string[]>; // lowercase clientId hex → service names
}

export interface MatchResult {
  matches: ResolvedService[];
  isAmbiguous: boolean;
}

export interface UpsertRow {
  uid: Buffer;
  scope: string;
  service: string;
  authorizedAt: number; // ms epoch
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

// Always returns ALL services so the ambiguity check for single-service
// clientId fallback can see the full picture. Use `serviceFilter` at output
// time (in run()) to narrow which rows actually get written.
function resolveServices(
  rawConfig: Record<string, BrowserServiceConfig>
): ResolvedService[] {
  const names = Object.keys(rawConfig);
  if (names.length === 0) {
    throw new Error(
      'browserServices config is empty. ' +
        'Add at least one service entry (relay, vpn, etc.) to config or config/secrets.json.'
    );
  }
  return names.map((name) => buildResolvedService(name, rawConfig[name]));
}

function buildResolvedService(
  name: string,
  cfg: BrowserServiceConfig
): ResolvedService {
  return {
    name,
    authorizationScope: cfg.authorizationScope,
    clientIdSet: new Set((cfg.clientIds || []).map((id) => id.toLowerCase())),
  };
}

// Refuse silently-incorrect cursors. A short or non-hex value would deserialize
// to an unexpected Buffer length, which the SQL `token > ?` comparison would
// happily accept — the backfill would then either skip rows or scan from zero
// without warning.
function parseCursorHex(flag: string, hex: string): Buffer {
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error(
      `--${flag} must be exactly 64 hex chars (32 bytes); got "${hex}" (${hex.length} chars)`
    );
  }
  return Buffer.from(hex, 'hex');
}

function buildServiceIndexes(services: ResolvedService[]): ServiceIndexes {
  const byName = new Map<string, ResolvedService>();
  const scopeIdx = new Map<string, string>();
  const clientIdIdx = new Map<string, string[]>();

  for (const svc of services) {
    byName.set(svc.name, svc);
    scopeIdx.set(svc.authorizationScope, svc.name);
    for (const id of svc.clientIdSet) {
      const list = clientIdIdx.get(id) ?? [];
      list.push(svc.name);
      clientIdIdx.set(id, list);
    }
  }

  return { byName, scopeIdx, clientIdIdx };
}

// Mirrors lib/oauth/browser-services.ts:recordAuthorizationOnLogin matching:
//   - scope match requires the clientId to be a recognized minter for the
//     matched service (so an RP that obtains the scope can't plant rows for
//     services it doesn't represent)
//   - clientId-only fallback only fires when the clientId maps to exactly
//     one service (multi-service clientIds are ambiguous without scope)
//   - SERVICE_AMBIGUOUS_CLIENT_IDS (Firefox Desktop) require serviceParam at
//     runtime; refreshTokens doesn't store serviceParam, so we restrict to
//     scope+clientId matches only and report the gap via metrics.
function findMatchingServices(
  clientId: Buffer,
  scopeStr: string,
  indexes: ServiceIndexes
): MatchResult {
  const clientHex = clientId.toString('hex').toLowerCase();
  const isAmbiguous = SERVICE_AMBIGUOUS_CLIENT_IDS.has(clientHex);
  const scopes = scopeStr.split(/\s+/).filter(Boolean);

  const matched = new Map<string, ResolvedService>();

  for (const value of scopes) {
    const name = indexes.scopeIdx.get(value);
    if (!name || matched.has(name)) continue;
    const svc = indexes.byName.get(name);
    if (!svc || !svc.clientIdSet.has(clientHex)) continue;
    matched.set(name, svc);
  }

  if (matched.size === 0 && !isAmbiguous) {
    const candidates = indexes.clientIdIdx.get(clientHex);
    if (candidates && candidates.length === 1) {
      const svc = indexes.byName.get(candidates[0]);
      if (svc) matched.set(svc.name, svc);
    }
  }

  return { matches: [...matched.values()], isAmbiguous };
}

async function batchUpsert(query: Query, rows: UpsertRow[]): Promise<void> {
  if (rows.length === 0) return;

  const placeholders = rows.map(() => '(?, ?, ?, ?)').join(', ');
  const values = rows.flatMap((r) => [
    r.uid,
    r.scope,
    r.service,
    r.authorizedAt,
  ]);

  await query(
    `INSERT INTO accountAuthorizations (uid, scope, service, authorizedAt)
     VALUES ${placeholders}
     ON DUPLICATE KEY UPDATE
       authorizedAt = LEAST(authorizedAt, VALUES(authorizedAt))`,
    values
  );
}

function writeCheckpoint(cursor: Buffer, filePath: string, log: Logger): void {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, cursor.toString('hex'), 'utf8');
  } catch (err) {
    log.warn('backfill.checkpoint.write_failed', {
      filePath,
      err,
      cursor: cursor.toString('hex'),
    });
  }
}

async function estimateTotalTokens(query: Query): Promise<number> {
  // InnoDB TABLE_ROWS is an approximation but fine for progress display.
  const rows = await query<Array<{ TABLE_ROWS: number }>>(
    `SELECT TABLE_ROWS FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'refreshTokens'`
  );
  return rows[0]?.TABLE_ROWS ?? 0;
}

/**
 * Splits the full BINARY(32) token keyspace into `workerCount` equal ranges
 * and returns the [startCursor, endCursor] pair for `workerIndex`.
 *
 * Tokens are SHA256 hashes so they distribute uniformly, making byte-boundary
 * splits an effective way to parallelize without hotspots.
 */
function workerCursors(
  workerIndex: number,
  workerCount: number
): { startCursor: Buffer; endCursor: Buffer } {
  // Bounded by the size of the first byte of the keyspace (256 values). More
  // than 256 workers would produce zero-byte ranges that overlap or skip rows.
  if (!Number.isInteger(workerCount) || workerCount < 1 || workerCount > 256) {
    throw new Error(
      `--worker-count must be an integer between 1 and 256; got ${workerCount}`
    );
  }
  if (
    !Number.isInteger(workerIndex) ||
    workerIndex < 0 ||
    workerIndex >= workerCount
  ) {
    throw new Error(
      `--worker-index must be 0–${workerCount - 1} when --worker-count is ${workerCount}`
    );
  }

  const bytesPerWorker = Math.ceil(256 / workerCount);
  const firstByteStart = workerIndex * bytesPerWorker;
  const firstByteEnd = Math.min(firstByteStart + bytesPerWorker - 1, 255);

  // startCursor is an exclusive lower bound (WHERE token > startCursor).
  // For worker N>0, set byte[0] = firstByteStart - 1 with 0xff fill so the
  // cursor lands just before the first token in this worker's range.
  const startCursor = Buffer.alloc(32, 0);
  if (workerIndex > 0) {
    startCursor[0] = firstByteStart - 1;
    startCursor.fill(0xff, 1);
  }

  const endCursor = Buffer.alloc(32, 0xff);
  endCursor[0] = firstByteEnd;

  return { startCursor, endCursor };
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
        code,
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
  endCursor: Buffer | null,
  batchSize: number
): Promise<TokenRow[]> {
  if (endCursor) {
    return query(
      'SELECT token, userId, clientId, scope, createdAt ' +
        'FROM refreshTokens WHERE token > ? AND token <= ? ORDER BY token LIMIT ?',
      [cursor, endCursor, batchSize]
    );
  }
  return query(
    'SELECT token, userId, clientId, scope, createdAt ' +
      'FROM refreshTokens WHERE token > ? ORDER BY token LIMIT ?',
    [cursor, batchSize]
  );
}

async function run(
  query: Query,
  indexes: ServiceIndexes,
  log: Logger,
  opts: {
    dryRun: boolean;
    batchSize: number;
    batchDelayMs: number;
    startCursor: Buffer;
    endCursor: Buffer | null;
    checkpointFile: string;
    serviceFilter?: string;
    statsd?: StatsD;
    retryAttempts?: number;
    retryInitialDelayMs?: number;
  }
): Promise<void> {
  const {
    dryRun,
    batchSize,
    batchDelayMs,
    checkpointFile,
    serviceFilter,
    statsd,
  } = opts;
  const retryAttempts = opts.retryAttempts ?? 3;
  const retryInitialDelayMs = opts.retryInitialDelayMs ?? 250;
  const withDbRetry = <T>(opName: string, op: () => Promise<T>): Promise<T> =>
    withRetry(op, {
      opName,
      attempts: retryAttempts,
      initialDelayMs: retryInitialDelayMs,
      log,
      statsd,
    });

  const runStartedMs = Date.now();
  const estimated = await estimateTotalTokens(query);
  const allServiceNames = [...indexes.byName.keys()];
  log.info('backfill.start', {
    estimatedTokens: estimated,
    services: allServiceNames,
    serviceFilter: serviceFilter ?? null,
    batchSize,
    batchDelayMs,
    dryRun,
    startCursor: opts.startCursor.toString('hex').slice(0, 8),
    endCursor: opts.endCursor?.toString('hex').slice(0, 8) ?? null,
  });

  let cursor = opts.startCursor;
  let batchNum = 0;
  let totalTokensProcessed = 0;
  let totalUpsertsAttempted = 0;
  let totalSkippedAmbiguous = 0;
  let totalSkippedNoMatch = 0;
  const countsByService: Record<string, number> = {};
  for (const name of allServiceNames) countsByService[name] = 0;

  let rows = await withDbRetry('fetchBatch', () =>
    fetchBatch(query, cursor, opts.endCursor, batchSize)
  );

  while (rows.length > 0) {
    batchNum++;
    totalTokensProcessed += rows.length;
    const batchStartedMs = Date.now();

    const upserts: UpsertRow[] = [];

    for (const row of rows) {
      const { matches, isAmbiguous } = findMatchingServices(
        row.clientId,
        row.scope,
        indexes
      );

      if (matches.length === 0) {
        if (isAmbiguous) {
          totalSkippedAmbiguous++;
          statsd?.increment('account_authz.backfill.tokens_skipped', {
            reason: 'ambiguous_no_match',
          });
        } else {
          totalSkippedNoMatch++;
          statsd?.increment('account_authz.backfill.tokens_skipped', {
            reason: 'no_match',
          });
        }
        continue;
      }

      for (const svc of matches) {
        if (serviceFilter && svc.name !== serviceFilter) continue;
        upserts.push({
          uid: row.userId,
          scope: svc.authorizationScope,
          service: svc.name,
          authorizedAt: row.createdAt.getTime(),
        });
        countsByService[svc.name]++;
        statsd?.increment('account_authz.backfill.upserts_attempted', {
          service: svc.name,
        });
      }
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
    writeCheckpoint(cursor, checkpointFile, log);

    const batchDurationMs = Date.now() - batchStartedMs;
    statsd?.timing('account_authz.backfill.batch_duration_ms', batchDurationMs);
    statsd?.increment('account_authz.backfill.tokens_scanned', rows.length);
    statsd?.increment('account_authz.backfill.batches_completed', {
      dry_run: String(dryRun),
    });

    const pct =
      estimated > 0
        ? Math.round((totalTokensProcessed / estimated) * 100)
        : null;
    log.info('backfill.batch', {
      batchNum,
      tokensProcessed: totalTokensProcessed,
      pct,
      upsertsAttempted: totalUpsertsAttempted,
      skippedAmbiguous: totalSkippedAmbiguous,
      skippedNoMatch: totalSkippedNoMatch,
      cursor: cursor.toString('hex').slice(0, 8),
      durationMs: batchDurationMs,
    });

    if (rows.length < batchSize) break;

    if (batchDelayMs > 0) await sleep(batchDelayMs);

    rows = await withDbRetry('fetchBatch', () =>
      fetchBatch(query, cursor, opts.endCursor, batchSize)
    );
  }

  const totalDurationMs = Date.now() - runStartedMs;
  statsd?.timing('account_authz.backfill.run_duration_ms', totalDurationMs);
  log.info('backfill.complete', {
    tokensScanned: totalTokensProcessed,
    upsertsAttempted: totalUpsertsAttempted,
    skippedAmbiguous: totalSkippedAmbiguous,
    skippedNoMatch: totalSkippedNoMatch,
    totalDurationMs,
    totalDurationHuman: humanDuration(totalDurationMs),
    dryRun,
    countsByService,
  });

  if (totalUpsertsAttempted === 0 && !dryRun) {
    log.warn('backfill.no_rows_upserted', {
      op: 'backfill.complete',
      msg: 'No rows were upserted — verify that browserServices clientIds and scopes are correct.',
    });
  }
}

export {
  resolveServices,
  buildResolvedService,
  buildServiceIndexes,
  findMatchingServices,
  workerCursors,
  batchUpsert,
  writeCheckpoint,
  fetchBatch,
  estimateTotalTokens,
  parseCursorHex,
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
      'Only backfill a single service (e.g. relay). Omit for all services.'
    )
    .option(
      '--start-cursor <hex>',
      'Resume from a checkpoint — pass the hex token cursor written to the checkpoint file.'
    )
    .option(
      '--end-cursor <hex>',
      'Stop at this token (inclusive upper bound). Used for manual range splits.'
    )
    .option(
      '--worker-count <number>',
      'Total number of parallel workers. Splits the token keyspace evenly.'
    )
    .option(
      '--worker-index <number>',
      'Index of this worker (0-based). Requires --worker-count.'
    )
    .option(
      '--checkpoint-file <path>',
      'File to write the cursor after each batch (default: temp/backfill-cursor.txt; overridden by --worker-count)',
      './temp/backfill-cursor.txt'
    )
    .option(
      '--retry-attempts <number>',
      'Total attempts (incl. first) for transient DB errors before giving up',
      '3'
    )
    .option(
      '--retry-initial-delay-ms <number>',
      'Initial backoff delay in ms; doubles on each retry (250 → 500 → 1000)',
      '250'
    )
    .parse(process.argv);

  const dryRun: boolean = program.dryRun;
  const batchSize = parseInt(program.batchSize, 10) || 1000;
  const batchDelayMs = parseInt(program.batchDelayMs, 10) || 100;
  const retryAttempts = parseInt(program.retryAttempts, 10) || 3;
  const retryInitialDelayMs = parseInt(program.retryInitialDelayMs, 10) || 250;
  const serviceFilter: string | undefined = program.service;

  let startCursor: Buffer;
  let endCursor: Buffer | null = null;
  let checkpointFile: string = program.checkpointFile;

  if (program.workerCount !== undefined) {
    const workerCount = parseInt(program.workerCount, 10);
    const workerIndex = parseInt(program.workerIndex ?? '0', 10);
    let cursors: { startCursor: Buffer; endCursor: Buffer };
    try {
      cursors = workerCursors(workerIndex, workerCount);
    } catch (err) {
      log.error('backfill.worker_config_error', { err: errMessage(err) });
      return 1;
    }
    startCursor = cursors.startCursor;
    endCursor = cursors.endCursor;
    checkpointFile = `./temp/backfill-cursor-worker-${workerIndex}.txt`;
    log.info('backfill.worker', { workerIndex, workerCount, checkpointFile });
  } else {
    try {
      startCursor = program.startCursor
        ? parseCursorHex('start-cursor', program.startCursor)
        : Buffer.alloc(32); // all zeros — before the first token in sort order
      endCursor = program.endCursor
        ? parseCursorHex('end-cursor', program.endCursor)
        : null;
    } catch (err) {
      log.error('backfill.cursor_validation_error', { err: errMessage(err) });
      return 1;
    }
  }

  const dbConfig = config.oauthServer.mysql;
  const browserServicesRaw: Record<string, BrowserServiceConfig> =
    config.oauthServer.browserServices ?? {};

  let services: ResolvedService[];
  let indexes: ServiceIndexes;
  try {
    services = resolveServices(browserServicesRaw);
    if (
      serviceFilter !== undefined &&
      !services.some((s) => s.name === serviceFilter)
    ) {
      throw new Error(
        `No service '${serviceFilter}' found in browserServices config. ` +
          `Available: ${services.map((s) => s.name).join(', ')}`
      );
    }
    indexes = buildServiceIndexes(services);
  } catch (err) {
    log.error('backfill.config_error', { err: errMessage(err) });
    return 1;
  }

  // connectionLimit: 1 keeps load on the OAuth DB single-threaded (this script
  // is sequential by design — see --batch-delay-ms). The pool auto-replaces a
  // connection that dies from wait_timeout / network drops, which paired with
  // withRetry lets the script ride through transient blips without resuming
  // from checkpoint.
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

  // Per-connection error events bubble up here when an acquired connection
  // dies. The pool will swap in a fresh one for the next query.
  pool.on('connection', (conn: mysql.PoolConnection) => {
    conn.on('error', (err) => {
      statsd?.increment('account_authz.backfill.connection_error', {
        code: (err as { code?: string }).code ?? 'unknown',
      });
      log.error('backfill.connection_error', {
        code: (err as { code?: string }).code,
        err: errMessage(err),
        msg: 'Connection lost mid-run; pool will acquire a fresh one for the next query.',
      });
    });
  });

  const query = makeQuery(pool);

  try {
    await run(query, indexes, log, {
      dryRun,
      batchSize,
      batchDelayMs,
      startCursor,
      endCursor,
      checkpointFile,
      serviceFilter,
      statsd,
      retryAttempts,
      retryInitialDelayMs,
    });
  } catch (err) {
    log.error('backfill.run_failed', {
      code: (err as { code?: string }).code,
      err: errMessage(err),
      msg: 'Run aborted; resume with --start-cursor from the last checkpoint file.',
    });
    return 1;
  } finally {
    await new Promise<void>((resolve) => pool.end(() => resolve()));
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
