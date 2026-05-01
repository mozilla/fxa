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
 *   node -r esbuild-register scripts/backfill-account-authorizations/seed-test-data.ts
 *   node -r esbuild-register scripts/backfill-account-authorizations/seed-test-data.ts --volume-count 10000
 *   node -r esbuild-register scripts/backfill-account-authorizations/seed-test-data.ts --clean
 *   node -r esbuild-register scripts/backfill-account-authorizations/seed-test-data.ts --expected
 *
 *
 * All test-case UIDs begin with 0xAA, volume noise UIDs begin with 0xBB.
 * --clean removes all rows matching either prefix.
 */

import crypto from 'crypto';
import * as mysql from 'mysql';
import program from 'commander';

const config = require('../../config').default.getProperties();
const browserServices: Record<string, { clientIds?: string[] }> =
  config.oauthServer?.browserServices ?? {};

const RELAY_SCOPE = 'https://identity.mozilla.com/apps/relay';
const VPN_SCOPE = 'https://identity.mozilla.com/apps/vpn';
const PROFILE_SCOPE = 'profile';
const OPENID_SCOPE = 'openid';

// Pick configured clientIds so the strict scope+clientId match logic in the
// backfill (mirroring lib/oauth/browser-services.ts) actually fires. Empty-
// safe defaults here; ensureSeedClientIds() validates on actual seed paths so
// `--expected` and `--clean` can run without a fully-populated config.
const RELAY_CLIENT_IDS = browserServices.relay?.clientIds ?? [];
const VPN_CLIENT_IDS = browserServices.vpn?.clientIds ?? [];
const RELAY_CLIENT_ID = RELAY_CLIENT_IDS[0] ?? '';
const VPN_CLIENT_ID = VPN_CLIENT_IDS[0] ?? '';
const MULTI_SERVICE_CLIENT_ID =
  VPN_CLIENT_IDS.find((id) => new Set(RELAY_CLIENT_IDS).has(id)) ?? '';

function ensureSeedClientIds(): void {
  if (!RELAY_CLIENT_ID || !VPN_CLIENT_ID) {
    throw new Error(
      'browserServices.relay.clientIds or .vpn.clientIds is empty — check your config'
    );
  }
  if (!MULTI_SERVICE_CLIENT_ID) {
    throw new Error(
      'No clientId is present in both relay and vpn config — check your config'
    );
  }
}

// Client not present in any browserServices.clientIds — used for all
// negative test cases so neither scope nor clientId fallback fires.
const UNRELATED_CLIENT_ID = 'aa01000000000009';

// All deterministic test UIDs start with 0xAA (BINARY(16) = 32 hex chars).
const UID_PREFIX = 'aa00000000000000000000000000';

function uid(suffix: string): Buffer {
  return Buffer.from(`${UID_PREFIX}${suffix}`, 'hex');
}

function tokenHash(label: string): Buffer {
  return crypto.createHash('sha256').update(`seed-${label}`).digest();
}

function hexBuf(hex: string): Buffer {
  return Buffer.from(hex, 'hex');
}

// Returns a MySQL TIMESTAMP string (UTC).
function toMysqlTimestamp(iso: string): string {
  return new Date(iso).toISOString().slice(0, 19).replace('T', ' ');
}

function toEpochMs(iso: string): number {
  return new Date(iso).getTime();
}

const DEFAULT_TS = '2025-01-15T10:00:00Z';

interface TokenRow {
  testId: string;
  userId: Buffer;
  clientId: Buffer;
  scope: string;
  token: Buffer;
  createdAt: string;
  lastUsedAt: string;
}

interface SeedOpts {
  volumeCount: number;
  volumeBatchSize: number;
  tokensPerUser: number;
}

interface AuthRow {
  uid: Buffer;
  scope: string;
  service: string;
  authorizedAt: number;
}

function buildTokenRows(): TokenRow[] {
  const now = toMysqlTimestamp(DEFAULT_TS);
  return [
    // T01 — relay scope + relay clientId (scope+clientId AND match)
    {
      testId: 'T01',
      userId: uid('0001'),
      clientId: hexBuf(RELAY_CLIENT_ID),
      scope: RELAY_SCOPE,
      token: tokenHash('t01-a'),
      createdAt: now,
      lastUsedAt: now,
    },

    // T02 — vpn scope + vpn clientId (scope+clientId AND match)
    {
      testId: 'T02',
      userId: uid('0002'),
      clientId: hexBuf(VPN_CLIENT_ID),
      scope: VPN_SCOPE,
      token: tokenHash('t02-a'),
      createdAt: now,
      lastUsedAt: now,
    },

    // T03 — relay clientId, no relay scope → single-service clientId fallback fires
    {
      testId: 'T03',
      userId: uid('0003'),
      clientId: hexBuf(RELAY_CLIENT_ID),
      scope: PROFILE_SCOPE,
      token: tokenHash('t03-a'),
      createdAt: now,
      lastUsedAt: now,
    },

    // T04 — profile scope only (no service match)
    {
      testId: 'T04',
      userId: uid('0004'),
      clientId: hexBuf(UNRELATED_CLIENT_ID),
      scope: PROFILE_SCOPE,
      token: tokenHash('t04-a'),
      createdAt: now,
      lastUsedAt: now,
    },

    // T05 — openid scope only (no service match)
    {
      testId: 'T05',
      userId: uid('0005'),
      clientId: hexBuf(UNRELATED_CLIENT_ID),
      scope: OPENID_SCOPE,
      token: tokenHash('t05-a'),
      createdAt: now,
      lastUsedAt: now,
    },

    // T06 — profile + openid, no service scope
    {
      testId: 'T06',
      userId: uid('0006'),
      clientId: hexBuf(UNRELATED_CLIENT_ID),
      scope: `${PROFILE_SCOPE} ${OPENID_SCOPE}`,
      token: tokenHash('t06-a'),
      createdAt: now,
      lastUsedAt: now,
    },

    // T07 — relay+vpn scopes on one token from a clientId minting both
    {
      testId: 'T07',
      userId: uid('0007'),
      clientId: hexBuf(MULTI_SERVICE_CLIENT_ID),
      scope: `${RELAY_SCOPE} ${VPN_SCOPE}`,
      token: tokenHash('t07-a'),
      createdAt: now,
      lastUsedAt: now,
    },

    // T08 — relay+profile scope, relay clientId (only relay matches)
    {
      testId: 'T08',
      userId: uid('0008'),
      clientId: hexBuf(RELAY_CLIENT_ID),
      scope: `${RELAY_SCOPE} ${PROFILE_SCOPE}`,
      token: tokenHash('t08-a'),
      createdAt: now,
      lastUsedAt: now,
    },

    // T09 — 2 tokens, same uid, relay scope, interleaved timestamps
    //   Expected: authorizedAt = Jan 1 (LEAST createdAt)
    {
      testId: 'T09',
      userId: uid('0009'),
      clientId: hexBuf(RELAY_CLIENT_ID),
      scope: RELAY_SCOPE,
      token: tokenHash('t09-a'),
      createdAt: toMysqlTimestamp('2024-01-01T00:00:00Z'),
      lastUsedAt: toMysqlTimestamp('2024-06-01T00:00:00Z'),
    },
    {
      testId: 'T09',
      userId: uid('0009'),
      clientId: hexBuf(RELAY_CLIENT_ID),
      scope: RELAY_SCOPE,
      token: tokenHash('t09-b'),
      createdAt: toMysqlTimestamp('2024-02-01T00:00:00Z'),
      lastUsedAt: toMysqlTimestamp('2024-12-01T00:00:00Z'),
    },

    // T10 — 2 tokens, same uid, relay scope, identical timestamps
    {
      testId: 'T10',
      userId: uid('000a'),
      clientId: hexBuf(RELAY_CLIENT_ID),
      scope: RELAY_SCOPE,
      token: tokenHash('t10-a'),
      createdAt: now,
      lastUsedAt: now,
    },
    {
      testId: 'T10',
      userId: uid('000a'),
      clientId: hexBuf(RELAY_CLIENT_ID),
      scope: RELAY_SCOPE,
      token: tokenHash('t10-b'),
      createdAt: now,
      lastUsedAt: now,
    },

    // T11 — 3 tokens, relay scope, interleaved across all three
    //   Token B has earliest createdAt (Jan 1)
    //   Expected: authorizedAt = Jan 1 (LEAST createdAt)
    {
      testId: 'T11',
      userId: uid('000b'),
      clientId: hexBuf(RELAY_CLIENT_ID),
      scope: RELAY_SCOPE,
      token: tokenHash('t11-a'),
      createdAt: toMysqlTimestamp('2024-03-01T00:00:00Z'),
      lastUsedAt: toMysqlTimestamp('2024-08-01T00:00:00Z'),
    },
    {
      testId: 'T11',
      userId: uid('000b'),
      clientId: hexBuf(RELAY_CLIENT_ID),
      scope: RELAY_SCOPE,
      token: tokenHash('t11-b'),
      createdAt: toMysqlTimestamp('2024-01-01T00:00:00Z'),
      lastUsedAt: toMysqlTimestamp('2024-06-01T00:00:00Z'),
    },
    {
      testId: 'T11',
      userId: uid('000b'),
      clientId: hexBuf(RELAY_CLIENT_ID),
      scope: RELAY_SCOPE,
      token: tokenHash('t11-c'),
      createdAt: toMysqlTimestamp('2024-05-01T00:00:00Z'),
      lastUsedAt: toMysqlTimestamp('2024-12-01T00:00:00Z'),
    },

    // T12 — same uid, separate relay and vpn tokens (expect 2 rows)
    {
      testId: 'T12',
      userId: uid('000c'),
      clientId: hexBuf(RELAY_CLIENT_ID),
      scope: RELAY_SCOPE,
      token: tokenHash('t12-a'),
      createdAt: now,
      lastUsedAt: now,
    },
    {
      testId: 'T12',
      userId: uid('000c'),
      clientId: hexBuf(VPN_CLIENT_ID),
      scope: VPN_SCOPE,
      token: tokenHash('t12-b'),
      createdAt: now,
      lastUsedAt: now,
    },

    // T13 — same uid, relay + profile tokens (only 1 row for relay)
    {
      testId: 'T13',
      userId: uid('000d'),
      clientId: hexBuf(RELAY_CLIENT_ID),
      scope: RELAY_SCOPE,
      token: tokenHash('t13-a'),
      createdAt: now,
      lastUsedAt: now,
    },
    {
      testId: 'T13',
      userId: uid('000d'),
      clientId: hexBuf(UNRELATED_CLIENT_ID),
      scope: PROFILE_SCOPE,
      token: tokenHash('t13-b'),
      createdAt: now,
      lastUsedAt: now,
    },

    // T14 — relay-extra scope — partial match must NOT fire
    {
      testId: 'T14',
      userId: uid('000e'),
      clientId: hexBuf(UNRELATED_CLIENT_ID),
      scope: `${RELAY_SCOPE}-extra`,
      token: tokenHash('t14-a'),
      createdAt: now,
      lastUsedAt: now,
    },

    // T15 — relay scope prefix — must NOT match
    {
      testId: 'T15',
      userId: uid('000f'),
      clientId: hexBuf(UNRELATED_CLIENT_ID),
      scope: 'https://identity.mozilla.com/apps/rela',
      token: tokenHash('t15-a'),
      createdAt: now,
      lastUsedAt: now,
    },

    // T16 — relay is second in space-separated scope string (must still match)
    {
      testId: 'T16',
      userId: uid('0010'),
      clientId: hexBuf(RELAY_CLIENT_ID),
      scope: `${PROFILE_SCOPE} ${RELAY_SCOPE}`,
      token: tokenHash('t16-a'),
      createdAt: now,
      lastUsedAt: now,
    },

    // T17 — specific timestamps for BIGINT conversion verification
    //   Expected authorizedAt: toEpochMs('2025-01-15T10:00:00Z') = 1736935200000
    {
      testId: 'T17',
      userId: uid('0011'),
      clientId: hexBuf(RELAY_CLIENT_ID),
      scope: RELAY_SCOPE,
      token: tokenHash('t17-a'),
      createdAt: toMysqlTimestamp('2025-01-15T10:00:00Z'),
      lastUsedAt: toMysqlTimestamp('2025-06-01T14:00:00Z'),
    },

    // T18 — idempotency: token createdAt (Jan 2024) matches pre-seeded authorizedAt (Jan 2024) — no-op
    {
      testId: 'T18',
      userId: uid('0012'),
      clientId: hexBuf(RELAY_CLIENT_ID),
      scope: RELAY_SCOPE,
      token: tokenHash('t18-a'),
      createdAt: toMysqlTimestamp('2024-01-01T00:00:00Z'),
      lastUsedAt: toMysqlTimestamp('2024-12-01T00:00:00Z'),
    },

    // T19 — idempotency: token createdAt (Jan 2024) matches pre-seeded authorizedAt (Jan 2024) — no-op
    {
      testId: 'T19',
      userId: uid('0013'),
      clientId: hexBuf(RELAY_CLIENT_ID),
      scope: RELAY_SCOPE,
      token: tokenHash('t19-a'),
      createdAt: toMysqlTimestamp('2024-01-01T00:00:00Z'),
      lastUsedAt: toMysqlTimestamp('2024-06-01T00:00:00Z'),
    },

    // T20 — idempotency: token createdAt (Jun 2023) is earlier than pre-seeded authorizedAt (Jan 2024)
    //   Expected: authorizedAt updates to Jun 2023 (LEAST wins)
    {
      testId: 'T20',
      userId: uid('0014'),
      clientId: hexBuf(RELAY_CLIENT_ID),
      scope: RELAY_SCOPE,
      token: tokenHash('t20-a'),
      createdAt: toMysqlTimestamp('2023-06-01T00:00:00Z'),
      lastUsedAt: toMysqlTimestamp('2024-06-01T00:00:00Z'),
    },

    // T21 — idempotency: identical data, run script twice — result is a no-op
    {
      testId: 'T21',
      userId: uid('0015'),
      clientId: hexBuf(RELAY_CLIENT_ID),
      scope: RELAY_SCOPE,
      token: tokenHash('t21-a'),
      createdAt: now,
      lastUsedAt: now,
    },

    // Unrelated client with non-service scope — should produce 0 rows
    {
      testId: 'noise-client',
      userId: uid('0099'),
      clientId: hexBuf(UNRELATED_CLIENT_ID),
      scope: PROFILE_SCOPE,
      token: tokenHash('noise-client-a'),
      createdAt: now,
      lastUsedAt: now,
    },
  ];
}

function buildPreExistingAuths(): AuthRow[] {
  return [
    // T18: row already exists — second run is a no-op (same authorizedAt)
    {
      uid: uid('0012'),
      scope: RELAY_SCOPE,
      service: 'relay',
      authorizedAt: toEpochMs('2024-01-01T00:00:00Z'),
    },
    // T19: row already exists — second run is a no-op (same authorizedAt)
    {
      uid: uid('0013'),
      scope: RELAY_SCOPE,
      service: 'relay',
      authorizedAt: toEpochMs('2024-01-01T00:00:00Z'),
    },
    // T20: row has later authorizedAt — LEAST should update it to token.createdAt (Jun 2023)
    {
      uid: uid('0014'),
      scope: RELAY_SCOPE,
      service: 'relay',
      authorizedAt: toEpochMs('2024-01-01T00:00:00Z'),
    },
  ];
}

function printExpectedOutcomes(): void {
  const t17AuthorizedAt = toEpochMs('2025-01-15T10:00:00Z');

  const rows = [
    {
      id: 'T01',
      uid: 'aa...0001',
      rows: 1,
      note: `service=relay  (scope match)`,
    },
    {
      id: 'T02',
      uid: 'aa...0002',
      rows: 1,
      note: `service=vpn    (scope match)`,
    },
    {
      id: 'T03',
      uid: 'aa...0003',
      rows: 1,
      note: `service=relay  (clientId match — requires browserServices config)`,
    },
    { id: 'T04', uid: 'aa...0004', rows: 0, note: `profile scope — no match` },
    { id: 'T05', uid: 'aa...0005', rows: 0, note: `openid scope — no match` },
    { id: 'T06', uid: 'aa...0006', rows: 0, note: `profile+openid — no match` },
    {
      id: 'T07',
      uid: 'aa...0007',
      rows: 2,
      note: `service=relay + service=vpn (both scopes on one token)`,
    },
    {
      id: 'T08',
      uid: 'aa...0008',
      rows: 1,
      note: `service=relay only (profile is ignored)`,
    },
    {
      id: 'T09',
      uid: 'aa...0009',
      rows: 1,
      note: `service=relay  authorizedAt=${toEpochMs('2024-01-01T00:00:00Z')} (LEAST createdAt)`,
    },
    {
      id: 'T10',
      uid: 'aa...000a',
      rows: 1,
      note: `service=relay  deduped identical timestamps`,
    },
    {
      id: 'T11',
      uid: 'aa...000b',
      rows: 1,
      note: `service=relay  authorizedAt=${toEpochMs('2024-01-01T00:00:00Z')} (LEAST createdAt across 3 tokens)`,
    },
    {
      id: 'T12',
      uid: 'aa...000c',
      rows: 2,
      note: `service=relay + service=vpn (separate tokens)`,
    },
    {
      id: 'T13',
      uid: 'aa...000d',
      rows: 1,
      note: `service=relay only (profile token is noise)`,
    },
    {
      id: 'T14',
      uid: 'aa...000e',
      rows: 0,
      note: `relay-extra scope — must NOT match`,
    },
    {
      id: 'T15',
      uid: 'aa...000f',
      rows: 0,
      note: `scope prefix 'rela' — must NOT match`,
    },
    {
      id: 'T16',
      uid: 'aa...0010',
      rows: 1,
      note: `service=relay  (relay is second in scope string)`,
    },
    {
      id: 'T17',
      uid: 'aa...0011',
      rows: 1,
      note: `service=relay  authorizedAt=${t17AuthorizedAt} (BIGINT conversion)`,
    },
    {
      id: 'T18',
      uid: 'aa...0012',
      rows: 1,
      note: `service=relay  authorizedAt unchanged (pre-seeded row, same value — no-op)`,
    },
    {
      id: 'T19',
      uid: 'aa...0013',
      rows: 1,
      note: `service=relay  authorizedAt unchanged (pre-seeded row, same value — no-op)`,
    },
    {
      id: 'T20',
      uid: 'aa...0014',
      rows: 1,
      note: `service=relay  authorizedAt updated to ${toEpochMs('2023-06-01T00:00:00Z')} (LEAST)`,
    },
    {
      id: 'T21',
      uid: 'aa...0015',
      rows: 1,
      note: `service=relay  second run is a no-op`,
    },
    {
      id: 'noise-client',
      uid: 'aa...0099',
      rows: 0,
      note: `unrelated clientId — must produce 0 rows`,
    },
  ];

  console.log(
    '\n=== Expected accountAuthorizations after running backfill ===\n'
  );
  console.log('ID            UID             Rows  Note');
  console.log('─'.repeat(90));
  for (const r of rows) {
    console.log(
      `${r.id.padEnd(14)}${r.uid.padEnd(16)}${String(r.rows).padEnd(6)}${r.note}`
    );
  }

  console.log(
    '\nT25/T26 volume: service-scope tokens → rows in accountAuthorizations; non-service-scope tokens → 0 rows'
  );
  console.log(
    'T24 resumability: seeded rows are deterministic — run with --start-cursor to pick up mid-way'
  );
  console.log(
    'T27–T30 service filter: covered by the data above; pass --service relay to the backfill script'
  );
}

// 10 slots cycled by `i % 10` so distribution is deterministic. Under strict
// matching (scope+clientId AND), pairing each scope with a clientId that mints
// it is what causes the backfill to produce a row. ~30% should match.
const VOLUME_VARIANTS: Array<{ scope: string; clientId: string }> = [
  // 3/10 produce rows
  { scope: RELAY_SCOPE, clientId: RELAY_CLIENT_ID }, // → relay
  { scope: VPN_SCOPE, clientId: VPN_CLIENT_ID }, // → vpn
  { scope: `${RELAY_SCOPE} ${VPN_SCOPE}`, clientId: MULTI_SERVICE_CLIENT_ID }, // → relay + vpn
  // 7/10 produce 0 rows: non-service scope OR scope without clientId membership
  { scope: PROFILE_SCOPE, clientId: UNRELATED_CLIENT_ID },
  { scope: OPENID_SCOPE, clientId: UNRELATED_CLIENT_ID },
  { scope: `${PROFILE_SCOPE} ${OPENID_SCOPE}`, clientId: UNRELATED_CLIENT_ID },
  { scope: 'https://example.com/other', clientId: UNRELATED_CLIENT_ID },
  { scope: RELAY_SCOPE, clientId: UNRELATED_CLIENT_ID }, // scope-only — must NOT fire
  { scope: VPN_SCOPE, clientId: UNRELATED_CLIENT_ID }, // scope-only — must NOT fire
  { scope: PROFILE_SCOPE, clientId: UNRELATED_CLIENT_ID },
];

// Little-endian layout means byte[0] = i & 0xff cycles through 0–255 every 256
// rows, giving uniform first-byte distribution matching real SHA-256 tokens.
function volumeToken(i: number): Buffer {
  const token = Buffer.alloc(32, 0);
  token.writeUInt32LE(i >>> 0, 0);
  token.writeUInt32LE(Math.floor(i / 0x100000000) >>> 0, 4);
  return token;
}

// UIDs use the 0xBB prefix so --clean can delete them in bulk.
function volumeUserId(i: number, tokensPerUser: number): Buffer {
  const userIndex = Math.floor(i / tokensPerUser);
  const userId = Buffer.alloc(16, 0);
  userId[0] = 0xbb;
  userId.writeUInt32LE(userIndex >>> 0, 1);
  userId.writeUInt32LE(Math.floor(userIndex / 0x100000000) >>> 0, 5);
  return userId;
}

function makeQuery(conn: mysql.Connection) {
  return (sql: string, values?: any[]): Promise<any> =>
    new Promise((resolve, reject) => {
      conn.query(sql, values, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
}

async function tableExists(
  query: ReturnType<typeof makeQuery>,
  tableName: string
): Promise<boolean> {
  const rows = await query(
    `SELECT COUNT(*) AS cnt FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?`,
    [tableName]
  );
  return rows[0].cnt > 0;
}

async function seedVolume(
  query: ReturnType<typeof makeQuery>,
  totalCount: number,
  batchSize: number,
  tokensPerUser: number
): Promise<void> {
  const now = toMysqlTimestamp(DEFAULT_TS);
  const variantBuffers = VOLUME_VARIANTS.map((v) => ({
    scope: v.scope,
    clientId: hexBuf(v.clientId),
  }));
  const INSERT_SQL =
    'INSERT INTO refreshTokens (clientId, userId, scope, token, profileChangedAt, createdAt, lastUsedAt) ' +
    'VALUES ? ON DUPLICATE KEY UPDATE scope = scope';

  console.log(
    `\nSeeding ${totalCount.toLocaleString()} volume rows ` +
      `(batch=${batchSize}, tokensPerUser=${tokensPerUser})...`
  );

  await query('SET unique_checks = 0, foreign_key_checks = 0');

  const startMs = Date.now();
  let inserted = 0;

  try {
    while (inserted < totalCount) {
      const end = Math.min(inserted + batchSize, totalCount);
      const rows: any[][] = [];

      for (let i = inserted; i < end; i++) {
        const variant = variantBuffers[i % variantBuffers.length];
        rows.push([
          variant.clientId,
          volumeUserId(i, tokensPerUser),
          variant.scope,
          volumeToken(i),
          null,
          now,
          now,
        ]);
      }

      await query(INSERT_SQL, [rows]);
      inserted = end;

      const elapsed = (Date.now() - startMs) / 1000;
      const rate = Math.round(inserted / elapsed);
      const remaining = totalCount - inserted;
      const etaSec = rate > 0 ? Math.round(remaining / rate) : 0;
      process.stdout.write(
        `\r  ${inserted.toLocaleString()} / ${totalCount.toLocaleString()} ` +
          `(${rate.toLocaleString()} rows/s, ETA ${etaSec}s)   `
      );
    }
  } finally {
    // Restore session settings so a partial run doesn't leave the connection
    // in a relaxed-integrity mode for any subsequent statement.
    await query('SET unique_checks = 1, foreign_key_checks = 1');
  }
  const totalSec = ((Date.now() - startMs) / 1000).toFixed(1);
  console.log(`\n✓ Volume rows seeded in ${totalSec}s`);
}

async function seed(
  query: ReturnType<typeof makeQuery>,
  opts: SeedOpts
): Promise<void> {
  ensureSeedClientIds();

  const INSERT_TOKEN =
    'INSERT INTO refreshTokens (clientId, userId, scope, token, profileChangedAt, createdAt, lastUsedAt) ' +
    'VALUES (?, ?, ?, ?, NULL, ?, ?) ON DUPLICATE KEY UPDATE scope = scope';

  const tokenRows = buildTokenRows();
  console.log(
    `Seeding ${tokenRows.length} deterministic token rows (T01–T21 + noise-client)...`
  );

  for (const r of tokenRows) {
    await query(INSERT_TOKEN, [
      r.clientId,
      r.userId,
      r.scope,
      r.token,
      r.createdAt,
      r.lastUsedAt,
    ]);
    process.stdout.write('.');
  }
  console.log(`\n✓ Token rows seeded`);

  const hasAuthTable = await tableExists(query, 'accountAuthorizations');
  if (hasAuthTable) {
    const INSERT_AUTH =
      'INSERT INTO accountAuthorizations (uid, scope, service, authorizedAt) ' +
      'VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE authorizedAt = authorizedAt';

    const authRows = buildPreExistingAuths();
    console.log(
      `\nSeeding ${authRows.length} pre-existing accountAuthorizations rows (T18–T20)...`
    );
    for (const r of authRows) {
      await query(INSERT_AUTH, [r.uid, r.scope, r.service, r.authorizedAt]);
      process.stdout.write('.');
    }
    console.log(`\n✓ Pre-existing auth rows seeded`);
  } else {
    console.log(
      '\n⚠  accountAuthorizations table not found — skipping T18–T20 pre-seed.'
    );
    console.log(
      '   Run the FXA-12931 migration first if you want to test idempotency cases.'
    );
  }

  if (opts.volumeCount > 0) {
    await seedVolume(
      query,
      opts.volumeCount,
      opts.volumeBatchSize,
      opts.tokensPerUser
    );
  }

  console.log('\n✓ Seed complete.');
  printExpectedOutcomes();
}

async function clean(query: ReturnType<typeof makeQuery>): Promise<void> {
  // 0xAA prefix = deterministic test case rows
  // 0xBB prefix = volume noise rows
  const { affectedRows: tokenRows } = await query(
    "DELETE FROM refreshTokens WHERE LEFT(userId, 1) IN (UNHEX('aa'), UNHEX('bb'))"
  );
  console.log(`✓ Deleted ${tokenRows} rows from refreshTokens`);

  const hasAuthTable = await tableExists(query, 'accountAuthorizations');
  if (hasAuthTable) {
    // Volume noise tokens (0xBB) can produce accountAuthorizations rows when
    // they pair multi-service clientIds with service scopes. Delete both
    // prefixes so a stale row from a previous run can't bleed into the next.
    const { affectedRows: authRows } = await query(
      "DELETE FROM accountAuthorizations WHERE LEFT(uid, 1) IN (UNHEX('aa'), UNHEX('bb'))"
    );
    console.log(`✓ Deleted ${authRows} rows from accountAuthorizations`);
  }

  console.log('✓ Clean complete.');
}

export async function init() {
  const config = require('../../config').default.getProperties();
  const dbConfig = config.oauthServer.mysql;

  program
    .option('--clean', 'Remove all seeded test data instead of inserting')
    .option(
      '--expected',
      'Print expected accountAuthorizations outcomes and exit'
    )
    .option(
      '--volume-count <number>',
      'Number of volume noise rows to seed (0 to skip)',
      '10000'
    )
    .option(
      '--volume-batch-size <number>',
      'Rows per INSERT for volume data (larger = faster)',
      '5000'
    )
    .option(
      '--tokens-per-user <number>',
      'Volume tokens sharing one UID (1 = one token per account)',
      '1'
    )
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
      await seed(query, {
        volumeCount: parseInt(program.volumeCount, 10) || 0,
        volumeBatchSize: parseInt(program.volumeBatchSize, 10) || 5000,
        tokensPerUser: parseInt(program.tokensPerUser, 10) || 1,
      });
    }
  } finally {
    conn.end();
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
