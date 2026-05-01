/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Seed test data for the backfill-account-authorizations script.
 *
 * Inserts deterministic refresh token rows into the local fxa_oauth MySQL DB
 * covering all cases in backfill-account-authorizations-test-cases.md.
 *
 * Usage (from packages/fxa-auth-server):
 *   npx ts-node scripts/backfill-account-authorizations/seed-test-data.ts
 *   npx ts-node scripts/backfill-account-authorizations/seed-test-data.ts --volume-count 10000
 *   npx ts-node scripts/backfill-account-authorizations/seed-test-data.ts --clean
 *   npx ts-node scripts/backfill-account-authorizations/seed-test-data.ts --expected
 *
 * For T03 (clientId-based matching), add to config/secrets.json:
 *   {
 *     "browserServices": {
 *       "relay": { "clientIds": ["aa01000000000001"] },
 *       "vpn":   { "clientIds": ["aa01000000000002"] }
 *     }
 *   }
 *
 * All test-case UIDs begin with 0xAA, volume noise UIDs begin with 0xBB.
 * --clean removes all rows matching either prefix.
 */

import crypto from 'crypto';
import * as mysql from 'mysql';
import program from 'commander';

// ---- Scopes ----------------------------------------------------------------

const RELAY_SCOPE = 'https://identity.mozilla.com/apps/relay';
const VPN_SCOPE = 'https://identity.mozilla.com/apps/vpn';
const PROFILE_SCOPE = 'profile';
const OPENID_SCOPE = 'openid';

// ---- Client IDs ------------------------------------------------------------

// Firefox browser client already present in tokenExchange config; used for
// scope-based matching cases where clientId itself isn't the signal.
const FIREFOX_CLIENT_ID = '1b1a3e44c54fbb58';

// Fake RP web client IDs — must match what you configure in browserServices:
//   browserServices.relay.clientIds  = ['aa01000000000001']
//   browserServices.vpn.clientIds    = ['aa01000000000002']
const RELAY_WEB_CLIENT_ID = 'aa01000000000001';
const VPN_CLIENT_ID = 'aa01000000000002';

// Unrelated client — should never produce an accountAuthorizations row.
const UNRELATED_CLIENT_ID = 'aa01000000000009';

// ---- Helpers ----------------------------------------------------------------

// All deterministic test UIDs start with 0xAA (BINARY(16) = 32 hex chars).
const UID_PREFIX = 'aa00000000000000000000000000';

function uid(suffix: string): Buffer {
  // suffix = 4 hex chars  →  total 32 hex = 16 bytes
  return Buffer.from(`${UID_PREFIX}${suffix}`, 'hex');
}

// All volume-noise UIDs start with 0xBB so they can be bulk-cleaned separately.
const NOISE_UID_PREFIX = 'bb00000000000000000000000000';

function noiseUid(suffix: string): Buffer {
  return Buffer.from(`${NOISE_UID_PREFIX}${suffix}`, 'hex');
}

function tokenHash(label: string): Buffer {
  return crypto.createHash('sha256').update(`seed-${label}`).digest();
}

function buf(hex: string): Buffer {
  return Buffer.from(hex, 'hex');
}

// Returns a MySQL TIMESTAMP string (UTC).
function mts(iso: string): string {
  return new Date(iso).toISOString().slice(0, 19).replace('T', ' ');
}

// Returns milliseconds since epoch (for accountAuthorizations BIGINT columns).
function ms(iso: string): number {
  return new Date(iso).getTime();
}

const DEFAULT_TS = '2025-01-15T10:00:00Z';

// ---- Refresh token rows ----------------------------------------------------

interface TokenRow {
  testId: string;
  userId: Buffer;
  clientId: Buffer;
  scope: string;
  token: Buffer;
  createdAt: string;
  lastUsedAt: string;
}

function buildTokenRows(): TokenRow[] {
  const now = mts(DEFAULT_TS);
  return [
    // T01 — relay scope, Firefox client (scope-based match)
    { testId: 'T01', userId: uid('0001'), clientId: buf(FIREFOX_CLIENT_ID), scope: RELAY_SCOPE, token: tokenHash('t01-a'), createdAt: now, lastUsedAt: now },

    // T02 — VPN scope, Firefox client
    { testId: 'T02', userId: uid('0002'), clientId: buf(FIREFOX_CLIENT_ID), scope: VPN_SCOPE, token: tokenHash('t02-a'), createdAt: now, lastUsedAt: now },

    // T03 — Relay web clientId, no relay scope (clientId-based match)
    { testId: 'T03', userId: uid('0003'), clientId: buf(RELAY_WEB_CLIENT_ID), scope: PROFILE_SCOPE, token: tokenHash('t03-a'), createdAt: now, lastUsedAt: now },

    // T04 — profile scope only (no service match)
    { testId: 'T04', userId: uid('0004'), clientId: buf(FIREFOX_CLIENT_ID), scope: PROFILE_SCOPE, token: tokenHash('t04-a'), createdAt: now, lastUsedAt: now },

    // T05 — openid scope only (no service match)
    { testId: 'T05', userId: uid('0005'), clientId: buf(FIREFOX_CLIENT_ID), scope: OPENID_SCOPE, token: tokenHash('t05-a'), createdAt: now, lastUsedAt: now },

    // T06 — profile + openid, no service scope
    { testId: 'T06', userId: uid('0006'), clientId: buf(FIREFOX_CLIENT_ID), scope: `${PROFILE_SCOPE} ${OPENID_SCOPE}`, token: tokenHash('t06-a'), createdAt: now, lastUsedAt: now },

    // T07 — relay + vpn scopes on one token (expect 2 accountAuthorizations rows)
    { testId: 'T07', userId: uid('0007'), clientId: buf(FIREFOX_CLIENT_ID), scope: `${RELAY_SCOPE} ${VPN_SCOPE}`, token: tokenHash('t07-a'), createdAt: now, lastUsedAt: now },

    // T08 — relay + profile scope (only relay matches)
    { testId: 'T08', userId: uid('0008'), clientId: buf(FIREFOX_CLIENT_ID), scope: `${RELAY_SCOPE} ${PROFILE_SCOPE}`, token: tokenHash('t08-a'), createdAt: now, lastUsedAt: now },

    // T09 — 2 tokens, same uid, relay scope, interleaved timestamps
    //   Expected: authorizedAt = Jan 1 (LEAST), lastUsedAt = Dec 1 (GREATEST)
    { testId: 'T09', userId: uid('0009'), clientId: buf(FIREFOX_CLIENT_ID), scope: RELAY_SCOPE, token: tokenHash('t09-a'), createdAt: mts('2024-01-01T00:00:00Z'), lastUsedAt: mts('2024-06-01T00:00:00Z') },
    { testId: 'T09', userId: uid('0009'), clientId: buf(FIREFOX_CLIENT_ID), scope: RELAY_SCOPE, token: tokenHash('t09-b'), createdAt: mts('2024-02-01T00:00:00Z'), lastUsedAt: mts('2024-12-01T00:00:00Z') },

    // T10 — 2 tokens, same uid, relay scope, identical timestamps
    { testId: 'T10', userId: uid('000a'), clientId: buf(FIREFOX_CLIENT_ID), scope: RELAY_SCOPE, token: tokenHash('t10-a'), createdAt: now, lastUsedAt: now },
    { testId: 'T10', userId: uid('000a'), clientId: buf(FIREFOX_CLIENT_ID), scope: RELAY_SCOPE, token: tokenHash('t10-b'), createdAt: now, lastUsedAt: now },

    // T11 — 3 tokens, relay scope, interleaved across all three
    //   Token B has earliest createdAt (Jan 1), Token C has latest lastUsedAt (Dec 1)
    //   Expected: authorizedAt = Jan 1, lastUsedAt = Dec 1
    { testId: 'T11', userId: uid('000b'), clientId: buf(FIREFOX_CLIENT_ID), scope: RELAY_SCOPE, token: tokenHash('t11-a'), createdAt: mts('2024-03-01T00:00:00Z'), lastUsedAt: mts('2024-08-01T00:00:00Z') },
    { testId: 'T11', userId: uid('000b'), clientId: buf(FIREFOX_CLIENT_ID), scope: RELAY_SCOPE, token: tokenHash('t11-b'), createdAt: mts('2024-01-01T00:00:00Z'), lastUsedAt: mts('2024-06-01T00:00:00Z') },
    { testId: 'T11', userId: uid('000b'), clientId: buf(FIREFOX_CLIENT_ID), scope: RELAY_SCOPE, token: tokenHash('t11-c'), createdAt: mts('2024-05-01T00:00:00Z'), lastUsedAt: mts('2024-12-01T00:00:00Z') },

    // T12 — same uid, separate relay and vpn tokens (expect 2 rows)
    { testId: 'T12', userId: uid('000c'), clientId: buf(FIREFOX_CLIENT_ID), scope: RELAY_SCOPE, token: tokenHash('t12-a'), createdAt: now, lastUsedAt: now },
    { testId: 'T12', userId: uid('000c'), clientId: buf(FIREFOX_CLIENT_ID), scope: VPN_SCOPE, token: tokenHash('t12-b'), createdAt: now, lastUsedAt: now },

    // T13 — same uid, relay + profile tokens (only 1 row for relay)
    { testId: 'T13', userId: uid('000d'), clientId: buf(FIREFOX_CLIENT_ID), scope: RELAY_SCOPE, token: tokenHash('t13-a'), createdAt: now, lastUsedAt: now },
    { testId: 'T13', userId: uid('000d'), clientId: buf(FIREFOX_CLIENT_ID), scope: PROFILE_SCOPE, token: tokenHash('t13-b'), createdAt: now, lastUsedAt: now },

    // T14 — relay-extra scope — partial match must NOT fire
    { testId: 'T14', userId: uid('000e'), clientId: buf(FIREFOX_CLIENT_ID), scope: `${RELAY_SCOPE}-extra`, token: tokenHash('t14-a'), createdAt: now, lastUsedAt: now },

    // T15 — relay scope prefix — must NOT match
    { testId: 'T15', userId: uid('000f'), clientId: buf(FIREFOX_CLIENT_ID), scope: 'https://identity.mozilla.com/apps/rela', token: tokenHash('t15-a'), createdAt: now, lastUsedAt: now },

    // T16 — relay is second in space-separated scope string (must still match)
    { testId: 'T16', userId: uid('0010'), clientId: buf(FIREFOX_CLIENT_ID), scope: `${PROFILE_SCOPE} ${RELAY_SCOPE}`, token: tokenHash('t16-a'), createdAt: now, lastUsedAt: now },

    // T17 — specific timestamps for BIGINT conversion verification
    //   Expected authorizedAt: ms('2025-01-15T10:00:00Z') = 1736935200000
    //   Expected lastUsedAt:   ms('2025-06-01T14:00:00Z') = 1748786400000
    { testId: 'T17', userId: uid('0011'), clientId: buf(FIREFOX_CLIENT_ID), scope: RELAY_SCOPE, token: tokenHash('t17-a'), createdAt: mts('2025-01-15T10:00:00Z'), lastUsedAt: mts('2025-06-01T14:00:00Z') },

    // T18 — idempotency: token lastUsedAt (Dec) is newer than pre-seeded row (Jun)
    //   Expected: lastUsedAt updates to Dec (GREATEST wins)
    { testId: 'T18', userId: uid('0012'), clientId: buf(FIREFOX_CLIENT_ID), scope: RELAY_SCOPE, token: tokenHash('t18-a'), createdAt: mts('2024-01-01T00:00:00Z'), lastUsedAt: mts('2024-12-01T00:00:00Z') },

    // T19 — idempotency: token lastUsedAt (Jun) is older than pre-seeded row (Dec)
    //   Expected: lastUsedAt stays Dec (GREATEST wins)
    { testId: 'T19', userId: uid('0013'), clientId: buf(FIREFOX_CLIENT_ID), scope: RELAY_SCOPE, token: tokenHash('t19-a'), createdAt: mts('2024-01-01T00:00:00Z'), lastUsedAt: mts('2024-06-01T00:00:00Z') },

    // T20 — idempotency: token createdAt (Jun 2023) is earlier than pre-seeded authorizedAt (Jan 2024)
    //   Expected: authorizedAt updates to Jun 2023 (LEAST wins)
    { testId: 'T20', userId: uid('0014'), clientId: buf(FIREFOX_CLIENT_ID), scope: RELAY_SCOPE, token: tokenHash('t20-a'), createdAt: mts('2023-06-01T00:00:00Z'), lastUsedAt: mts('2024-06-01T00:00:00Z') },

    // T21 — idempotency: identical data, run script twice — result is a no-op
    { testId: 'T21', userId: uid('0015'), clientId: buf(FIREFOX_CLIENT_ID), scope: RELAY_SCOPE, token: tokenHash('t21-a'), createdAt: now, lastUsedAt: now },

    // Unrelated client — should produce 0 rows regardless of scope
    { testId: 'noise-client', userId: uid('0099'), clientId: buf(UNRELATED_CLIENT_ID), scope: RELAY_SCOPE, token: tokenHash('noise-client-a'), createdAt: now, lastUsedAt: now },
  ];
}

// ---- Pre-existing accountAuthorizations rows (T18–T20) ---------------------

interface AuthRow {
  uid: Buffer;
  scope: string;
  service: string;
  authorizedAt: number;
  lastUsedAt: number;
}

function buildPreExistingAuths(): AuthRow[] {
  return [
    // T18: row has older lastUsedAt — backfill token (Dec) should update it
    { uid: uid('0012'), scope: RELAY_SCOPE, service: 'relay', authorizedAt: ms('2024-01-01T00:00:00Z'), lastUsedAt: ms('2024-06-01T00:00:00Z') },
    // T19: row has newer lastUsedAt — GREATEST keeps it; token (Jun) must not downgrade
    { uid: uid('0013'), scope: RELAY_SCOPE, service: 'relay', authorizedAt: ms('2024-01-01T00:00:00Z'), lastUsedAt: ms('2024-12-01T00:00:00Z') },
    // T20: row has later authorizedAt — LEAST should update it to token.createdAt (Jun 2023)
    { uid: uid('0014'), scope: RELAY_SCOPE, service: 'relay', authorizedAt: ms('2024-01-01T00:00:00Z'), lastUsedAt: ms('2024-06-01T00:00:00Z') },
  ];
}

// ---- Expected outcomes (human-readable reference) --------------------------

function printExpectedOutcomes(): void {
  const t17AuthorizedAt = ms('2025-01-15T10:00:00Z');
  const t17LastUsedAt = ms('2025-06-01T14:00:00Z');

  const rows = [
    { id: 'T01', uid: 'aa...0001', rows: 1, note: `service=relay  (scope match)` },
    { id: 'T02', uid: 'aa...0002', rows: 1, note: `service=vpn    (scope match)` },
    { id: 'T03', uid: 'aa...0003', rows: 1, note: `service=relay  (clientId match — requires browserServices config)` },
    { id: 'T04', uid: 'aa...0004', rows: 0, note: `profile scope — no match` },
    { id: 'T05', uid: 'aa...0005', rows: 0, note: `openid scope — no match` },
    { id: 'T06', uid: 'aa...0006', rows: 0, note: `profile+openid — no match` },
    { id: 'T07', uid: 'aa...0007', rows: 2, note: `service=relay + service=vpn (both scopes on one token)` },
    { id: 'T08', uid: 'aa...0008', rows: 1, note: `service=relay only (profile is ignored)` },
    { id: 'T09', uid: 'aa...0009', rows: 1, note: `service=relay  authorizedAt=${ms('2024-01-01T00:00:00Z')}  lastUsedAt=${ms('2024-12-01T00:00:00Z')}` },
    { id: 'T10', uid: 'aa...000a', rows: 1, note: `service=relay  deduped identical timestamps` },
    { id: 'T11', uid: 'aa...000b', rows: 1, note: `service=relay  authorizedAt=${ms('2024-01-01T00:00:00Z')}  lastUsedAt=${ms('2024-12-01T00:00:00Z')}` },
    { id: 'T12', uid: 'aa...000c', rows: 2, note: `service=relay + service=vpn (separate tokens)` },
    { id: 'T13', uid: 'aa...000d', rows: 1, note: `service=relay only (profile token is noise)` },
    { id: 'T14', uid: 'aa...000e', rows: 0, note: `relay-extra scope — must NOT match` },
    { id: 'T15', uid: 'aa...000f', rows: 0, note: `scope prefix 'rela' — must NOT match` },
    { id: 'T16', uid: 'aa...0010', rows: 1, note: `service=relay  (relay is second in scope string)` },
    { id: 'T17', uid: 'aa...0011', rows: 1, note: `service=relay  authorizedAt=${t17AuthorizedAt}  lastUsedAt=${t17LastUsedAt}` },
    { id: 'T18', uid: 'aa...0012', rows: 1, note: `service=relay  lastUsedAt updated to ${ms('2024-12-01T00:00:00Z')} (GREATEST)` },
    { id: 'T19', uid: 'aa...0013', rows: 1, note: `service=relay  lastUsedAt stays ${ms('2024-12-01T00:00:00Z')} (GREATEST; token is older)` },
    { id: 'T20', uid: 'aa...0014', rows: 1, note: `service=relay  authorizedAt updated to ${ms('2023-06-01T00:00:00Z')} (LEAST)` },
    { id: 'T21', uid: 'aa...0015', rows: 1, note: `service=relay  second run is a no-op` },
    { id: 'noise-client', uid: 'aa...0099', rows: 0, note: `unrelated clientId — must produce 0 rows` },
  ];

  console.log('\n=== Expected accountAuthorizations after running backfill ===\n');
  console.log('ID            UID             Rows  Note');
  console.log('─'.repeat(90));
  for (const r of rows) {
    console.log(`${r.id.padEnd(14)}${r.uid.padEnd(16)}${String(r.rows).padEnd(6)}${r.note}`);
  }

  console.log('\nT25/T26 volume: service-scope tokens → rows in accountAuthorizations; non-service-scope tokens → 0 rows');
  console.log('T24 resumability: seeded rows are deterministic — run with --start-cursor to pick up mid-way');
  console.log('T27–T30 service filter: covered by the data above; pass --service relay to the backfill script');
}

// ---- Volume noise ----------------------------------------------------------

function buildVolumeRows(count: number): TokenRow[] {
  const rows: TokenRow[] = [];
  const now = mts(DEFAULT_TS);

  // Alternate between service-scope (T25 data) and non-service-scope (T26 data).
  const serviceScopes = [RELAY_SCOPE, VPN_SCOPE, `${RELAY_SCOPE} ${VPN_SCOPE}`];
  const noiseScopes = [PROFILE_SCOPE, OPENID_SCOPE, `${PROFILE_SCOPE} ${OPENID_SCOPE}`, 'https://example.com/other'];

  for (let i = 0; i < count; i++) {
    const suffix = i.toString(16).padStart(4, '0');
    const isService = i % 2 === 0;
    const scope = isService
      ? serviceScopes[i % serviceScopes.length]
      : noiseScopes[i % noiseScopes.length];

    rows.push({
      testId: `VOL-${i}`,
      userId: noiseUid(suffix),
      clientId: buf(FIREFOX_CLIENT_ID),
      scope,
      token: tokenHash(`vol-${i}`),
      createdAt: now,
      lastUsedAt: now,
    });
  }

  return rows;
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

async function tableExists(query: ReturnType<typeof makeQuery>, tableName: string): Promise<boolean> {
  const rows = await query(
    `SELECT COUNT(*) AS cnt FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?`,
    [tableName]
  );
  return rows[0].cnt > 0;
}

// ---- Seed ------------------------------------------------------------------

async function seed(query: ReturnType<typeof makeQuery>, volumeCount: number): Promise<void> {
  const INSERT_TOKEN =
    'INSERT INTO refreshTokens (clientId, userId, scope, token, profileChangedAt, createdAt, lastUsedAt) ' +
    'VALUES (?, ?, ?, ?, NULL, ?, ?) ON DUPLICATE KEY UPDATE scope = scope';

  const tokenRows = buildTokenRows();
  console.log(`Seeding ${tokenRows.length} deterministic token rows (T01–T21 + noise-client)...`);

  for (const r of tokenRows) {
    await query(INSERT_TOKEN, [r.clientId, r.userId, r.scope, r.token, r.createdAt, r.lastUsedAt]);
    process.stdout.write('.');
  }
  console.log(`\n✓ Token rows seeded`);

  const hasAuthTable = await tableExists(query, 'accountAuthorizations');
  if (hasAuthTable) {
    const INSERT_AUTH =
      'INSERT INTO accountAuthorizations (uid, scope, service, authorizedAt, lastUsedAt) ' +
      'VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE lastUsedAt = lastUsedAt';

    const authRows = buildPreExistingAuths();
    console.log(`\nSeeding ${authRows.length} pre-existing accountAuthorizations rows (T18–T20)...`);
    for (const r of authRows) {
      await query(INSERT_AUTH, [r.uid, r.scope, r.service, r.authorizedAt, r.lastUsedAt]);
      process.stdout.write('.');
    }
    console.log(`\n✓ Pre-existing auth rows seeded`);
  } else {
    console.log('\n⚠  accountAuthorizations table not found — skipping T18–T20 pre-seed.');
    console.log('   Run the FXA-12931 migration first if you want to test idempotency cases.');
  }

  if (volumeCount > 0) {
    const volumeRows = buildVolumeRows(volumeCount);
    console.log(`\nSeeding ${volumeCount} volume noise rows (T25/T26)...`);
    const BATCH = 500;
    for (let i = 0; i < volumeRows.length; i += BATCH) {
      const batch = volumeRows.slice(i, i + BATCH);
      const placeholders = batch.map(() => '(?, ?, ?, ?, NULL, ?, ?)').join(', ');
      const values = batch.flatMap((r) => [r.clientId, r.userId, r.scope, r.token, r.createdAt, r.lastUsedAt]);
      await query(
        `INSERT INTO refreshTokens (clientId, userId, scope, token, profileChangedAt, createdAt, lastUsedAt) VALUES ${placeholders} ON DUPLICATE KEY UPDATE scope = scope`,
        values
      );
      process.stdout.write(`\r  ${Math.min(i + BATCH, volumeCount)} / ${volumeCount}`);
    }
    console.log(`\n✓ Volume rows seeded`);
  }

  console.log('\n✓ Seed complete.');
  printExpectedOutcomes();
}

// ---- Clean -----------------------------------------------------------------

async function clean(query: ReturnType<typeof makeQuery>): Promise<void> {
  // 0xAA prefix = deterministic test case rows
  // 0xBB prefix = volume noise rows
  const { affectedRows: tokenRows } = await query(
    "DELETE FROM refreshTokens WHERE LEFT(userId, 1) IN (UNHEX('aa'), UNHEX('bb'))"
  );
  console.log(`✓ Deleted ${tokenRows} rows from refreshTokens`);

  const hasAuthTable = await tableExists(query, 'accountAuthorizations');
  if (hasAuthTable) {
    const { affectedRows: authRows } = await query(
      "DELETE FROM accountAuthorizations WHERE LEFT(uid, 1) = UNHEX('aa')"
    );
    console.log(`✓ Deleted ${authRows} rows from accountAuthorizations`);
  }

  console.log('✓ Clean complete.');
}

// ---- Entry point -----------------------------------------------------------

export async function init() {
  const config = require('../../config').default.getProperties();
  const dbConfig = config.oauthServer.mysql;

  program
    .option('--clean', 'Remove all seeded test data instead of inserting')
    .option('--expected', 'Print expected accountAuthorizations outcomes and exit')
    .option('--volume-count <number>', 'Number of volume noise rows to seed (0 to skip)', '10000')
    .parse(process.argv);

  if (program.expected) {
    printExpectedOutcomes();
    return 0;
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
    if (program.clean) {
      await clean(query);
    } else {
      const volumeCount = parseInt(program.volumeCount, 10) || 0;
      await seed(query, volumeCount);
    }
  } finally {
    conn.end();
  }

  return 0;
}

if (require.main === module) {
  let exitStatus = 1;
  init()
    .then((code) => { exitStatus = code; })
    .catch((err) => { console.error(err); })
    .finally(() => { process.exit(exitStatus); });
}
