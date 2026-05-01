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
 *   npx ts-node scripts/backfill-account-authorizations/index.ts --dry-run
 *   npx ts-node scripts/backfill-account-authorizations/index.ts
 *
 *   # Resume after interruption
 *   npx ts-node scripts/backfill-account-authorizations/index.ts \
 *     --start-cursor $(cat backfill-cursor.txt)
 *
 *   # Parallel workers — splits the token keyspace evenly across N processes.
 *   # token is a SHA256 hash so values distribute uniformly across the key space.
 *   # Run each command in a separate terminal / tmux pane:
 *   npx ts-node scripts/backfill-account-authorizations/index.ts --worker-index 0 --worker-count 8
 *   npx ts-node scripts/backfill-account-authorizations/index.ts --worker-index 1 --worker-count 8
 *   # ... up to worker-index 7
 *   # Each worker writes its own checkpoint: backfill-cursor-worker-0.txt, etc.
 *
 *   # Filter to a single service
 *   npx ts-node scripts/backfill-account-authorizations/index.ts --service relay
 *
 * Execution plan:
 *   1. --dry-run on stage           → verify per-service counts
 *   2. Live run on stage            → spot-check accountAuthorizations rows
 *   3. --dry-run on prod            → validate expected counts
 *   4. Live run on prod (off-peak)  → parallel workers if table > 50M rows
 */

import * as fs from 'fs';
import * as mysql from 'mysql';
import program from 'commander';

const pckg = require('../../package.json');

// ---- Types -----------------------------------------------------------------

interface BrowserServiceConfig {
  displayName: string;
  authorizationScope: string;
  clientIds: string[];
  serviceParams: string[];
  retentionDays: number;
  allowSilentExchange: boolean;
}

interface ResolvedService {
  name: string;
  authorizationScope: string;
  clientIdSet: Set<string>; // lower-case hex strings for O(1) lookup
}

interface UpsertRow {
  uid: Buffer;
  scope: string;
  service: string;
  authorizedAt: number; // ms epoch
  lastUsedAt: number;   // ms epoch
}

// ---- DB helpers ------------------------------------------------------------

function makeQuery(conn: mysql.Connection) {
  return (sql: string, values?: any[]): Promise<any> =>
    new Promise((resolve, reject) => {
      conn.query(sql, values, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
}

// ---- Service resolution ----------------------------------------------------

function resolveServices(
  rawConfig: Record<string, BrowserServiceConfig>,
  serviceFilter: string | undefined
): ResolvedService[] {
  const names = Object.keys(rawConfig);

  if (names.length === 0) {
    throw new Error(
      'browserServices config is empty.\n' +
      'Add at least one service entry (relay, vpn, etc.) to config or config/secrets.json.'
    );
  }

  if (serviceFilter !== undefined) {
    if (!rawConfig[serviceFilter]) {
      throw new Error(
        `No service '${serviceFilter}' found in browserServices config.\n` +
        `Available: ${names.join(', ')}`
      );
    }
    return [buildResolvedService(serviceFilter, rawConfig[serviceFilter])];
  }

  return names.map((name) => buildResolvedService(name, rawConfig[name]));
}

function buildResolvedService(name: string, cfg: BrowserServiceConfig): ResolvedService {
  return {
    name,
    authorizationScope: cfg.authorizationScope,
    clientIdSet: new Set((cfg.clientIds || []).map((id) => id.toLowerCase())),
  };
}

// ---- Token → service matching ----------------------------------------------

function findMatchingServices(
  clientId: Buffer,
  scopeStr: string,
  services: ResolvedService[]
): ResolvedService[] {
  const clientHex = clientId.toString('hex').toLowerCase();
  const scopes = new Set(scopeStr.split(/\s+/).filter(Boolean));

  return services.filter(
    (svc) =>
      svc.clientIdSet.has(clientHex) ||
      scopes.has(svc.authorizationScope)
  );
}

// ---- Upsert ----------------------------------------------------------------

async function batchUpsert(
  query: ReturnType<typeof makeQuery>,
  rows: UpsertRow[]
): Promise<void> {
  if (rows.length === 0) return;

  const placeholders = rows.map(() => '(?, ?, ?, ?, ?)').join(', ');
  const values = rows.flatMap((r) => [
    r.uid,
    r.scope,
    r.service,
    r.authorizedAt,
    r.lastUsedAt,
  ]);

  await query(
    `INSERT INTO accountAuthorizations (uid, scope, service, authorizedAt, lastUsedAt)
     VALUES ${placeholders}
     ON DUPLICATE KEY UPDATE
       lastUsedAt   = GREATEST(lastUsedAt,   VALUES(lastUsedAt)),
       authorizedAt = LEAST(authorizedAt, VALUES(authorizedAt))`,
    values
  );
}

// ---- Checkpoint ------------------------------------------------------------

function writeCheckpoint(cursor: Buffer, filePath: string): void {
  try {
    fs.writeFileSync(filePath, cursor.toString('hex'), 'utf8');
  } catch {
    // Non-fatal — checkpoint is a convenience, not a requirement.
  }
}

// ---- Progress / estimated total --------------------------------------------

async function estimateTotalTokens(
  query: ReturnType<typeof makeQuery>
): Promise<number> {
  // InnoDB TABLE_ROWS is an approximation but fine for progress display.
  const rows = await query(
    `SELECT TABLE_ROWS FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'refreshTokens'`
  );
  return rows[0]?.TABLE_ROWS ?? 0;
}

// ---- Keyspace partitioning -------------------------------------------------

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
  if (workerIndex < 0 || workerIndex >= workerCount) {
    throw new Error(
      `--worker-index must be 0–${workerCount - 1} when --worker-count is ${workerCount}`
    );
  }

  // Divide the 256 possible first-byte values evenly across workers.
  const bytesPerWorker = Math.ceil(256 / workerCount);
  const firstByteStart = workerIndex * bytesPerWorker;
  const firstByteEnd = Math.min(firstByteStart + bytesPerWorker - 1, 255);

  // startCursor: first byte = firstByteStart, remaining 31 bytes = 0x00
  // We use startCursor as the exclusive lower bound (WHERE token > startCursor),
  // so subtract 1 from the intended first byte to include it in results.
  // Special case: worker 0 starts at all-zeros (before any token).
  const startCursor = Buffer.alloc(32, 0);
  if (workerIndex > 0) {
    startCursor[0] = firstByteStart;
    // Set remaining bytes to 0xff so that startCursor sits just before
    // the first token whose first byte equals firstByteStart.
    startCursor.fill(0xff, 1);
    // Actually we want: first token with first byte == firstByteStart to be
    // included, so set startCursor = (firstByteStart - 1, 0xff, 0xff, ...)
    startCursor[0] = firstByteStart - 1;
    startCursor.fill(0xff, 1);
  }

  // endCursor: first byte = firstByteEnd, remaining 31 bytes = 0xFF (inclusive upper bound)
  const endCursor = Buffer.alloc(32, 0xff);
  endCursor[0] = firstByteEnd;

  return { startCursor, endCursor };
}

// ---- Sleep -----------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---- Main loop -------------------------------------------------------------

async function run(
  query: ReturnType<typeof makeQuery>,
  services: ResolvedService[],
  opts: {
    dryRun: boolean;
    batchSize: number;
    batchDelayMs: number;
    startCursor: Buffer;
    endCursor: Buffer | null;
    checkpointFile: string;
  }
): Promise<void> {
  const { dryRun, batchSize, batchDelayMs, checkpointFile } = opts;

  const estimated = await estimateTotalTokens(query);
  const rangeNote = opts.endCursor
    ? ` [${opts.startCursor.toString('hex').slice(0, 8)}…→${opts.endCursor.toString('hex').slice(0, 8)}…]`
    : '';
  console.log(`Estimated tokens in table: ~${estimated.toLocaleString()}${rangeNote}`);
  console.log(`Services targeted: ${services.map((s) => s.name).join(', ')}`);
  console.log(`Batch size: ${batchSize} | Delay: ${batchDelayMs}ms | Dry run: ${dryRun}`);
  console.log('');

  let cursor = opts.startCursor;
  let batchNum = 0;
  let totalTokensProcessed = 0;
  let totalUpserted = 0;
  const countsByService: Record<string, number> = {};
  for (const svc of services) countsByService[svc.name] = 0;

  while (true) {
    const selectSql = opts.endCursor
      ? 'SELECT token, userId, clientId, scope, createdAt, lastUsedAt ' +
        'FROM refreshTokens WHERE token > ? AND token <= ? ORDER BY token LIMIT ?'
      : 'SELECT token, userId, clientId, scope, createdAt, lastUsedAt ' +
        'FROM refreshTokens WHERE token > ? ORDER BY token LIMIT ?';

    const selectParams = opts.endCursor
      ? [cursor, opts.endCursor, batchSize]
      : [cursor, batchSize];

    const rows: Array<{
      token: Buffer;
      userId: Buffer;
      clientId: Buffer;
      scope: string;
      createdAt: Date;
      lastUsedAt: Date;
    }> = await query(selectSql, selectParams);

    if (rows.length === 0) break;

    batchNum++;
    totalTokensProcessed += rows.length;

    const upserts: UpsertRow[] = [];

    for (const row of rows) {
      const matching = findMatchingServices(row.clientId, row.scope, services);
      for (const svc of matching) {
        upserts.push({
          uid: row.userId,
          scope: svc.authorizationScope,
          service: svc.name,
          authorizedAt: row.createdAt.getTime(),
          lastUsedAt: row.lastUsedAt.getTime(),
        });
        countsByService[svc.name]++;
      }
    }

    if (!dryRun) {
      await batchUpsert(query, upserts);
    }

    totalUpserted += upserts.length;
    cursor = rows[rows.length - 1].token;
    writeCheckpoint(cursor, checkpointFile);

    const pct = estimated > 0
      ? ` (~${Math.round((totalTokensProcessed / estimated) * 100)}%)`
      : '';
    process.stdout.write(
      `\rBatch ${batchNum} | tokens: ${totalTokensProcessed.toLocaleString()}${pct} | matches: ${totalUpserted.toLocaleString()}   `
    );

    if (rows.length < batchSize) break;

    if (batchDelayMs > 0) await sleep(batchDelayMs);
  }

  process.stdout.write('\n\n');

  console.log('=== Results ===');
  console.log(`Total tokens scanned:  ${totalTokensProcessed.toLocaleString()}`);
  console.log(`Total rows upserted:   ${dryRun ? `${totalUpserted.toLocaleString()} (dry run — not written)` : totalUpserted.toLocaleString()}`);
  console.log('');
  console.log('Per-service counts:');
  for (const [name, count] of Object.entries(countsByService)) {
    console.log(`  ${name}: ${count.toLocaleString()}`);
  }

  if (totalUpserted === 0 && !dryRun) {
    console.log('\n⚠  No rows were upserted. Verify that browserServices clientIds and scopes are correct.');
  }

  if (dryRun) {
    console.log('\n(Dry run — re-run without --dry-run to write.)');
  }
}

// ---- Entry point -----------------------------------------------------------

export async function init() {
  program
    .version(pckg.version)
    .option('--dry-run', 'Log what would be written without writing (recommended first pass)', false)
    .option('--batch-size <number>', 'Rows read per iteration', '1000')
    .option('--batch-delay-ms <number>', 'Sleep between batches in ms (controls DB load)', '100')
    .option('--service <name>', 'Only backfill a single service (e.g. relay). Omit for all services.')
    .option('--start-cursor <hex>', 'Resume from a checkpoint — pass the hex token cursor written to the checkpoint file.')
    .option('--end-cursor <hex>', 'Stop at this token (exclusive upper bound). Used for manual range splits.')
    .option('--worker-count <number>', 'Total number of parallel workers. Splits the token keyspace evenly.')
    .option('--worker-index <number>', 'Index of this worker (0-based). Requires --worker-count.')
    .option('--checkpoint-file <path>', 'File to write the cursor after each batch (default: backfill-cursor.txt; overridden by --worker-count)', './backfill-cursor.txt')
    .parse(process.argv);

  const dryRun: boolean = program.dryRun;
  const batchSize = parseInt(program.batchSize, 10) || 1000;
  const batchDelayMs = parseInt(program.batchDelayMs, 10) || 100;
  const serviceFilter: string | undefined = program.service;

  // Resolve cursors — worker flags take precedence over explicit cursor flags.
  let startCursor: Buffer;
  let endCursor: Buffer | null = null;
  let checkpointFile: string = program.checkpointFile;

  if (program.workerCount !== undefined) {
    const workerCount = parseInt(program.workerCount, 10);
    const workerIndex = parseInt(program.workerIndex ?? '0', 10);
    let cursors: { startCursor: Buffer; endCursor: Buffer };
    try {
      cursors = workerCursors(workerIndex, workerCount);
    } catch (err: any) {
      console.error(`\nWorker config error: ${err.message}`);
      return 1;
    }
    startCursor = cursors.startCursor;
    endCursor = cursors.endCursor;
    // Each worker gets its own checkpoint file to avoid clobbering.
    checkpointFile = `./backfill-cursor-worker-${workerIndex}.txt`;
    console.log(`Worker ${workerIndex}/${workerCount} | checkpoint: ${checkpointFile}`);
  } else {
    startCursor = program.startCursor
      ? Buffer.from(program.startCursor, 'hex')
      : Buffer.alloc(32); // all zeros — before the first token in sort order
    endCursor = program.endCursor
      ? Buffer.from(program.endCursor, 'hex')
      : null;
  }

  const config = require('../../config').default.getProperties();
  const dbConfig = config.oauthServer.mysql;
  const browserServicesRaw: Record<string, BrowserServiceConfig> =
    config.browserServices ?? {};

  let services: ResolvedService[];
  try {
    services = resolveServices(browserServicesRaw, serviceFilter);
  } catch (err: any) {
    console.error(`\nConfig error: ${err.message}`);
    return 1;
  }

  const conn = mysql.createConnection({
    host: dbConfig.host || 'localhost',
    port: parseInt(dbConfig.port || '3306', 10),
    user: dbConfig.user || 'root',
    password: dbConfig.password || '',
    database: dbConfig.database || 'fxa_oauth',
    timezone: '+00:00',
    charset: 'UTF8MB4_UNICODE_CI',
  });

  await new Promise<void>((resolve, reject) => {
    conn.connect((err) => (err ? reject(err) : resolve()));
  });

  const query = makeQuery(conn);

  try {
    await run(query, services, {
      dryRun,
      batchSize,
      batchDelayMs,
      startCursor,
      endCursor,
      checkpointFile,
    });
  } finally {
    conn.end();
  }

  return 0;
}

if (require.main === module) {
  let exitStatus = 1;
  init()
    .then((code) => { exitStatus = code; })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      process.exit(exitStatus);
    });
}
