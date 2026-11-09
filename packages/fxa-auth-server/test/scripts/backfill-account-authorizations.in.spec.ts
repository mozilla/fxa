/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as crypto from 'crypto';
import * as mysql from 'mysql2';

import {
  buildServiceConfig,
  Query,
  run as runBackfill,
} from '../../scripts/backfill-account-authorizations/backfill-account-authorizations';

const config = require('../../config').default.getProperties();

const VPN_SCOPE = 'https://identity.mozilla.com/apps/vpn';
const SMARTWINDOW_SCOPE = 'https://identity.mozilla.com/apps/smartwindow';
const SYNC_SCOPE = 'https://identity.mozilla.com/apps/oldsync';
const RELAY_SCOPE = 'https://identity.mozilla.com/apps/relay';

// Pull a real VPN-allowlisted clientId from config so the allowlist gate
// passes in the same way it would in production.
const exchangeCfg = config.oauthServer.exchange;
const VPN_ALLOWED_CLIENT_ID: string =
  exchangeCfg.allowedClientsForService?.vpn?.[0];
// A second one, for the case that needs two clients on the same allowlist.
const VPN_ALLOWED_CLIENT_ID_2: string =
  exchangeCfg.allowedClientsForService?.vpn?.[1];
// Synthetic clientId that is NOT on any allowlist, for the negative test.
const UNRELATED_CLIENT_ID = 'aa01000000000009';
const SMART_CLIENT_ID: string =
  exchangeCfg.allowedClientsForService?.smartwindow?.[0];
// Firefox Desktop, which adds the Sync scope to every browser flow.
const DESKTOP_CLIENT_ID = '5882386c6d801776';
// A mobile Firefox client on the sync, relay and vpn allowlists: the only
// clients that reach the token exchange.
const MOBILE_CLIENT_ID: string = (
  exchangeCfg.allowedClientsForService?.sync ?? []
).find(
  (id: string) =>
    id !== DESKTOP_CLIENT_ID &&
    exchangeCfg.allowedClientsForService?.relay?.includes(id) &&
    exchangeCfg.allowedClientsForService?.vpn?.includes(id)
);
if (!MOBILE_CLIENT_ID) {
  throw new Error(
    'No mobile client is on the sync, relay and vpn allowlists in oauthServer.exchange.allowedClientsForService'
  );
}

// Test fixture UIDs use the 0xCC prefix so they don't collide with
// seed-test-data.ts (0xAA deterministic, 0xBB volume noise).
function uid(suffix: string): Buffer {
  return Buffer.from('cc' + suffix.padStart(30, '0'), 'hex');
}

function tokenHash(label: string): Buffer {
  return crypto.createHash('sha256').update(`int-test-${label}`).digest();
}

function toMysqlTs(d: Date): string {
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

function noopLog() {
  return {
    info: () => {},
    warn: () => {},
    error: () => {},
    debug: () => {},
  };
}

describe('#integration - scripts/backfill-account-authorizations', () => {
  let pool: mysql.Pool;
  let query: Query;

  const baseRunOpts = {
    dryRun: false,
    batchSize: 100,
    batchDelayMs: 0,
    retryAttempts: 1,
    retryInitialDelayMs: 1,
  };

  function buildCfg() {
    return buildServiceConfig(
      exchangeCfg.serviceScopes,
      exchangeCfg.allowedClientsForService || {},
      {},
      exchangeCfg.bypassConsentForServices || []
    );
  }

  async function rowsFor(userId: Buffer) {
    const rows = await query<Array<{ service: string; scope: string }>>(
      'SELECT service, scope FROM accountAuthorizations WHERE uid = ?',
      [userId]
    );
    return rows.map((r) => `${r.service}:${r.scope}`).sort();
  }

  async function insertRefreshToken(args: {
    label: string;
    userId: Buffer;
    clientId: string;
    scope: string;
    createdAt: Date;
  }) {
    await query(
      'INSERT INTO refreshTokens (clientId, userId, scope, token, profileChangedAt, createdAt, lastUsedAt) ' +
        'VALUES (?, ?, ?, ?, NULL, ?, ?)',
      [
        Buffer.from(args.clientId, 'hex'),
        args.userId,
        args.scope,
        tokenHash(args.label),
        toMysqlTs(args.createdAt),
        toMysqlTs(args.createdAt),
      ]
    );
  }

  async function clearTestRows() {
    await query(
      "DELETE FROM refreshTokens WHERE LEFT(userId, 1) = UNHEX('cc')"
    );
    await query(
      "DELETE FROM accountAuthorizations WHERE LEFT(uid, 1) = UNHEX('cc')"
    );
  }

  beforeAll(() => {
    const c = config.oauthServer.mysql;
    pool = mysql.createPool({
      connectionLimit: 2,
      host: c.host,
      port: parseInt(c.port, 10),
      user: c.user,
      password: c.password,
      database: c.database,
      timezone: '+00:00',
    });
    query = <T = unknown>(sql: string, values?: unknown[]) =>
      new Promise<T>((resolve, reject) => {
        pool.query(sql, values, (err, results) => {
          if (err) reject(err);
          else resolve(results as T);
        });
      });
  });

  afterAll(async () => {
    await clearTestRows();
    await new Promise<void>((resolve) => pool.end(() => resolve()));
  });

  beforeEach(async () => {
    await clearTestRows();
  });

  it('writes a row populating all new columns for a vpn-scope token from an allowlisted clientId', async () => {
    const userId = uid('01');
    const createdAt = new Date('2024-06-15T12:00:00Z');
    await insertRefreshToken({
      label: 'one-match',
      userId,
      clientId: VPN_ALLOWED_CLIENT_ID,
      scope: VPN_SCOPE,
      createdAt,
    });

    await runBackfill(query, buildCfg(), noopLog(), baseRunOpts);

    const rows = await query<
      Array<{
        scope: string;
        service: string;
        clientId: Buffer;
        firstAuthorizedTosAt: number;
        lastAuthorizedTosAt: number;
      }>
    >(
      'SELECT scope, service, clientId, firstAuthorizedTosAt, lastAuthorizedTosAt ' +
        'FROM accountAuthorizations WHERE uid = ?',
      [userId]
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].scope).toBe(VPN_SCOPE);
    expect(rows[0].service).toBe('vpn');
    expect(rows[0].clientId.toString('hex')).toBe(VPN_ALLOWED_CLIENT_ID);
    // TIMESTAMP → BIGINT ms-epoch round-trip end-to-end.
    expect(Number(rows[0].firstAuthorizedTosAt)).toBe(createdAt.getTime());
    expect(Number(rows[0].lastAuthorizedTosAt)).toBe(createdAt.getTime());
  });

  it('writes one row per clientId when the same (uid, scope, service) appears with different clientIds', async () => {
    // Both clients are on the vpn allowlist, so the gate passes and what is
    // left is the PK-includes-clientId property: same scope, same service,
    // two different clientIds → two distinct rows.
    const userId = uid('02');
    const createdAt = new Date('2024-06-15T00:00:00Z');
    const clientA = VPN_ALLOWED_CLIENT_ID;
    const clientB = VPN_ALLOWED_CLIENT_ID_2;

    await insertRefreshToken({
      label: 'multi-client-a',
      userId,
      clientId: clientA,
      scope: VPN_SCOPE,
      createdAt,
    });
    await insertRefreshToken({
      label: 'multi-client-b',
      userId,
      clientId: clientB,
      scope: VPN_SCOPE,
      createdAt,
    });

    await runBackfill(query, buildCfg(), noopLog(), baseRunOpts);

    const rows = await query<Array<{ clientId: Buffer }>>(
      'SELECT clientId FROM accountAuthorizations WHERE uid = ? AND service = ? ' +
        'ORDER BY clientId',
      [userId, 'vpn']
    );
    const hexClientIds = rows.map((r) => r.clientId.toString('hex')).sort();
    expect(hexClientIds).toEqual([clientA, clientB].sort());
  });

  it('merges multiple tokens for the same (uid, scope, service, clientId) into one row spanning both', async () => {
    const userId = uid('03');
    const earlier = new Date('2023-01-01T00:00:00Z');
    const later = new Date('2024-06-01T00:00:00Z');
    // Insert the later token first; both land in the same batch, and the
    // in-batch merge keeps the earliest first and latest last timestamp.
    await insertRefreshToken({
      label: 'least-late',
      userId,
      clientId: VPN_ALLOWED_CLIENT_ID,
      scope: VPN_SCOPE,
      createdAt: later,
    });
    await insertRefreshToken({
      label: 'least-early',
      userId,
      clientId: VPN_ALLOWED_CLIENT_ID,
      scope: VPN_SCOPE,
      createdAt: earlier,
    });

    await runBackfill(query, buildCfg(), noopLog(), baseRunOpts);

    const rows = await query<
      Array<{ firstAuthorizedTosAt: number; lastAuthorizedTosAt: number }>
    >(
      'SELECT firstAuthorizedTosAt, lastAuthorizedTosAt ' +
        'FROM accountAuthorizations WHERE uid = ? AND service = ?',
      [userId, 'vpn']
    );
    expect(rows).toHaveLength(1);
    expect(Number(rows[0].firstAuthorizedTosAt)).toBe(earlier.getTime());
    expect(Number(rows[0].lastAuthorizedTosAt)).toBe(later.getTime());
  });

  it('moves firstAuthorizedTosAt earlier for an older token and never touches lastAuthorizedTosAt', async () => {
    const userId = uid('07');
    const existingFirst = new Date('2024-03-01T00:00:00Z').getTime();
    const existingLast = new Date('2024-03-02T00:00:00Z').getTime();
    const olderToken = new Date('2023-01-01T00:00:00Z');
    await query(
      'INSERT INTO accountAuthorizations ' +
        '(uid, scope, service, clientId, firstAuthorizedTosAt, lastAuthorizedTosAt) ' +
        'VALUES (?, ?, ?, ?, ?, ?)',
      [
        userId,
        VPN_SCOPE,
        'vpn',
        Buffer.from(VPN_ALLOWED_CLIENT_ID, 'hex'),
        existingFirst,
        existingLast,
      ]
    );
    await insertRefreshToken({
      label: 'untouched-old',
      userId,
      clientId: VPN_ALLOWED_CLIENT_ID,
      scope: VPN_SCOPE,
      createdAt: olderToken,
    });
    await insertRefreshToken({
      label: 'untouched-new',
      userId,
      clientId: VPN_ALLOWED_CLIENT_ID,
      scope: VPN_SCOPE,
      createdAt: new Date('2025-01-01T00:00:00Z'),
    });

    await runBackfill(query, buildCfg(), noopLog(), baseRunOpts);

    const rows = await query<
      Array<{ firstAuthorizedTosAt: number; lastAuthorizedTosAt: number }>
    >(
      'SELECT firstAuthorizedTosAt, lastAuthorizedTosAt ' +
        'FROM accountAuthorizations WHERE uid = ? AND service = ?',
      [userId, 'vpn']
    );
    expect(rows).toHaveLength(1);
    expect(Number(rows[0].firstAuthorizedTosAt)).toBe(olderToken.getTime());
    expect(Number(rows[0].lastAuthorizedTosAt)).toBe(existingLast);
  });

  it('leaves a row untouched when the token was minted in the same second', async () => {
    // refreshTokens.createdAt is whole seconds; the row is T + 500ms. Without
    // the 999ms guard the token would look 500ms older and move the row.
    const userId = uid('08');
    const tokenSecond = new Date('2024-03-01T00:00:00Z');
    const existingFirst = tokenSecond.getTime() + 500;
    const existingLast = existingFirst;
    await query(
      'INSERT INTO accountAuthorizations ' +
        '(uid, scope, service, clientId, firstAuthorizedTosAt, lastAuthorizedTosAt) ' +
        'VALUES (?, ?, ?, ?, ?, ?)',
      [
        userId,
        VPN_SCOPE,
        'vpn',
        Buffer.from(VPN_ALLOWED_CLIENT_ID, 'hex'),
        existingFirst,
        existingLast,
      ]
    );
    await insertRefreshToken({
      label: 'same-second',
      userId,
      clientId: VPN_ALLOWED_CLIENT_ID,
      scope: VPN_SCOPE,
      createdAt: tokenSecond,
    });

    await runBackfill(query, buildCfg(), noopLog(), baseRunOpts);

    const rows = await query<
      Array<{ firstAuthorizedTosAt: number; lastAuthorizedTosAt: number }>
    >(
      'SELECT firstAuthorizedTosAt, lastAuthorizedTosAt ' +
        'FROM accountAuthorizations WHERE uid = ? AND service = ?',
      [userId, 'vpn']
    );
    expect(rows).toHaveLength(1);
    expect(Number(rows[0].firstAuthorizedTosAt)).toBe(existingFirst);
    expect(Number(rows[0].lastAuthorizedTosAt)).toBe(existingLast);
  });

  it('writes a sync row set and no relay row for an exchange-derived oldsync+relay token', async () => {
    // relay is in bypassConsentForServices, so the exchange that added it did
    // not check consent and no relay row is written.
    const userId = uid('09');
    await insertRefreshToken({
      label: 'exchange-relay',
      userId,
      clientId: MOBILE_CLIENT_ID,
      scope: `${SYNC_SCOPE} ${RELAY_SCOPE} profile`,
      createdAt: new Date('2024-06-15T12:00:00Z'),
    });

    await runBackfill(query, buildCfg(), noopLog(), baseRunOpts);

    expect(await rowsFor(userId)).toEqual([
      `sync:${SYNC_SCOPE}`,
      'sync:profile',
    ]);
  });

  it('writes a sync row set plus a vpn row for an exchange-derived oldsync+vpn token', async () => {
    const userId = uid('0a');
    await insertRefreshToken({
      label: 'exchange-vpn',
      userId,
      clientId: MOBILE_CLIENT_ID,
      scope: `${SYNC_SCOPE} ${VPN_SCOPE} profile`,
      createdAt: new Date('2024-06-15T12:00:00Z'),
    });

    await runBackfill(query, buildCfg(), noopLog(), baseRunOpts);

    expect(await rowsFor(userId)).toEqual([
      `sync:${SYNC_SCOPE}`,
      'sync:profile',
      `vpn:${VPN_SCOPE}`,
    ]);
  });

  it('writes relay rows and no sync row for a Firefox Desktop oldsync+relay token', async () => {
    const userId = uid('0b');
    await insertRefreshToken({
      label: 'desktop-relay',
      userId,
      clientId: DESKTOP_CLIENT_ID,
      scope: `${SYNC_SCOPE} ${RELAY_SCOPE} profile`,
      createdAt: new Date('2024-06-15T12:00:00Z'),
    });

    await runBackfill(query, buildCfg(), noopLog(), baseRunOpts);

    expect(await rowsFor(userId)).toEqual([
      `relay:${RELAY_SCOPE}`,
      'relay:profile',
    ]);
  });

  it('skips tokens whose clientId is not on the service allowlist', async () => {
    // Security gate: a refresh token with vpn scope from a clientId
    // outside allowedClientsForService.vpn must not produce a row.
    const userId = uid('04');
    await insertRefreshToken({
      label: 'allowlist-denied',
      userId,
      clientId: UNRELATED_CLIENT_ID,
      scope: VPN_SCOPE,
      createdAt: new Date('2024-06-15T00:00:00Z'),
    });

    await runBackfill(query, buildCfg(), noopLog(), baseRunOpts);

    const rows = await query<Array<{ scope: string }>>(
      'SELECT scope FROM accountAuthorizations WHERE uid = ?',
      [userId]
    );
    expect(rows).toHaveLength(0);
  });

  it('writes service="" rows for non-service scopes (123done-style RP)', async () => {
    // Sign-in to a non-browser RP that grants openid + profile. Runtime writes
    // one row per scope with service=''; backfill must do the same so
    // future ToS-rejection on /authorization can find them.
    const userId = uid('06');
    const createdAt = new Date('2024-06-15T12:00:00Z');
    await insertRefreshToken({
      label: 'non-service-rp',
      userId,
      clientId: UNRELATED_CLIENT_ID,
      scope: 'openid profile',
      createdAt,
    });

    await runBackfill(query, buildCfg(), noopLog(), baseRunOpts);

    const rows = await query<Array<{ scope: string; service: string }>>(
      'SELECT scope, service FROM accountAuthorizations WHERE uid = ? ORDER BY scope',
      [userId]
    );
    expect(rows).toEqual([
      { scope: 'openid', service: '' },
      { scope: 'profile', service: '' },
    ]);
  });

  it('with serviceFilter only writes rows for the targeted service', async () => {
    const userId = uid('05');
    const createdAt = new Date('2024-06-15T00:00:00Z');
    await insertRefreshToken({
      label: 'filter-vpn',
      userId,
      clientId: VPN_ALLOWED_CLIENT_ID,
      scope: VPN_SCOPE,
      createdAt,
    });
    await insertRefreshToken({
      label: 'filter-smart',
      userId,
      clientId: SMART_CLIENT_ID,
      scope: SMARTWINDOW_SCOPE,
      createdAt,
    });

    await runBackfill(query, buildCfg(), noopLog(), {
      ...baseRunOpts,
      serviceFilter: 'vpn',
    });

    const rows = await query<Array<{ service: string }>>(
      'SELECT service FROM accountAuthorizations WHERE uid = ? ORDER BY service',
      [userId]
    );
    expect(rows.map((r) => r.service)).toEqual(['vpn']);
  });
});

/**
 * End-to-end scenarios for the accountAuthorizations backfill: seed every
 * token shape the script has a rule for, run it once against the real
 * fxa_oauth schema, and compare the resulting table to the expected rows.
 *
 * The SCENARIOS table below is the specification. Each entry is one user
 * with one or more refresh tokens, optionally some pre-existing rows, and
 * the exact rows the backfill must leave behind. The config is spelled out
 * in full here (prod's shape) so the expectations do not depend on the
 * environment's config files.
 *
 * This lives in the same file as the per-case suite above because the
 * script scans the whole refreshTokens table: two files running the backfill
 * in parallel Jest workers would see each other's fixtures.
 */
const SYNC = 'https://identity.mozilla.com/apps/oldsync';
const RELAY = 'https://identity.mozilla.com/apps/relay';
const SMARTWINDOW = 'https://identity.mozilla.com/apps/smartwindow';
const VPN = 'https://identity.mozilla.com/apps/vpn';
const MONITOR = 'https://identity.mozilla.com/apps/monitor';
const SUBS = 'https://identity.mozilla.com/account/subscriptions';

const DESKTOP = '5882386c6d801776';
const ANDROID = 'a2270f727f45f648';
const IOS = '1b1a3e44c54fbb58';
const FENIX_NIGHTLY = '3332a18d142636cb';
const REFERENCE_BROWSER = '3c49430b43dfba77';
const RELAY_WEB = '9ebfe2c2f9ea3c58';
const MONITOR_WEB = '802d56ef2a9af9fa';
const VPN_APP = 'e6eb0d1e856335fc';
const THIRD_PARTY = 'dcdb5ae7add825d2';
const FIRE_TV = '85da77264642d6a1';
const UNKNOWN = 'aa01000000000009';

const FIREFOX_CLIENTS = [
  DESKTOP,
  IOS,
  FENIX_NIGHTLY,
  ANDROID,
  REFERENCE_BROWSER,
];

const CFG = buildServiceConfig(
  {
    sync: SYNC,
    relay: RELAY,
    smartwindow: SMARTWINDOW,
    vpn: VPN,
    monitor: MONITOR,
  },
  {
    sync: FIREFOX_CLIENTS,
    relay: [...FIREFOX_CLIENTS, RELAY_WEB],
    smartwindow: [DESKTOP],
    vpn: [...FIREFOX_CLIENTS, VPN_APP],
    monitor: [DESKTOP, MONITOR_WEB],
  },
  { [MONITOR_WEB]: 'monitor', [VPN_APP]: 'vpn' },
  ['relay']
);

const T0 = new Date('2024-06-15T12:00:00Z');
const ms = (iso: string) => new Date(iso).getTime();

interface Token {
  client: string;
  scope: string;
  createdAt?: Date;
}
interface ExistingRow {
  client: string;
  scope: string;
  service: string;
  first: number;
  last: number;
  deauthorizedAt?: number;
}
interface ExpectedRow {
  client: string;
  scope: string;
  service: string;
  first?: number;
  last?: number;
  deauthorizedAt?: number | null;
}
interface Scenario {
  id: string;
  title: string;
  tokens: Token[];
  existing?: ExistingRow[];
  expected: ExpectedRow[];
  // Rows the script emits before in-batch/DB dedupe. Defaults to expected.length.
  attempted?: number;
}

const row = (
  client: string,
  service: string,
  scope: string,
  extra: Partial<ExpectedRow> = {}
): ExpectedRow => ({ client, service, scope, ...extra });

const SCENARIOS: Scenario[] = [
  // A. Single-service tokens
  {
    id: '01',
    title: 'Mobile oldsync+profile → sync rows',
    tokens: [{ client: ANDROID, scope: `${SYNC} profile` }],
    expected: [row(ANDROID, 'sync', SYNC), row(ANDROID, 'sync', 'profile')],
  },
  {
    id: '02',
    title: 'Relay website relay+profile+subscriptions → relay rows',
    tokens: [{ client: RELAY_WEB, scope: `${RELAY} profile ${SUBS}` }],
    expected: [
      row(RELAY_WEB, 'relay', RELAY),
      row(RELAY_WEB, 'relay', 'profile'),
      row(RELAY_WEB, 'relay', SUBS),
    ],
  },
  {
    id: '03',
    title: 'Desktop vpn+profile → vpn rows',
    tokens: [{ client: DESKTOP, scope: `${VPN} profile` }],
    expected: [row(DESKTOP, 'vpn', VPN), row(DESKTOP, 'vpn', 'profile')],
  },
  {
    id: '04',
    title: 'Desktop smartwindow+profile:uid → smartwindow rows',
    tokens: [{ client: DESKTOP, scope: `${SMARTWINDOW} profile:uid` }],
    expected: [
      row(DESKTOP, 'smartwindow', SMARTWINDOW),
      row(DESKTOP, 'smartwindow', 'profile:uid'),
    ],
  },
  {
    id: '05',
    title:
      'Monitor web without the canonical scope → monitor rows plus canonical',
    tokens: [{ client: MONITOR_WEB, scope: `profile ${SUBS}` }],
    expected: [
      row(MONITOR_WEB, 'monitor', 'profile'),
      row(MONITOR_WEB, 'monitor', SUBS),
      row(MONITOR_WEB, 'monitor', MONITOR),
    ],
  },
  {
    id: '06',
    title: 'Monitor web already carrying the canonical scope → no duplicate',
    tokens: [{ client: MONITOR_WEB, scope: `profile ${MONITOR}` }],
    expected: [
      row(MONITOR_WEB, 'monitor', 'profile'),
      row(MONITOR_WEB, 'monitor', MONITOR),
    ],
  },
  {
    id: '07',
    title: 'VPN app without the canonical scope → vpn rows plus canonical',
    tokens: [{ client: VPN_APP, scope: `profile ${SUBS}` }],
    expected: [
      row(VPN_APP, 'vpn', 'profile'),
      row(VPN_APP, 'vpn', SUBS),
      row(VPN_APP, 'vpn', VPN),
    ],
  },
  {
    id: '08',
    title: 'Third-party RP openid+profile → service="" rows',
    tokens: [{ client: THIRD_PARTY, scope: 'openid profile' }],
    expected: [row(THIRD_PARTY, '', 'openid'), row(THIRD_PARTY, '', 'profile')],
  },
  {
    id: '09',
    title: 'Retired Sync client not on the sync allowlist → nothing',
    tokens: [{ client: FIRE_TV, scope: `${SYNC} profile` }],
    expected: [],
  },
  {
    id: '10',
    title: 'Unknown client with the vpn scope → nothing',
    tokens: [{ client: UNKNOWN, scope: `${VPN} profile` }],
    expected: [],
  },
  {
    id: '11',
    title: 'Empty scope → nothing',
    tokens: [{ client: ANDROID, scope: '' }],
    expected: [],
  },

  // B. Exchange-derived mobile tokens
  {
    id: '12',
    title: 'iOS oldsync+relay+profile → sync rows only (relay bypassed)',
    tokens: [{ client: IOS, scope: `${SYNC} ${RELAY} profile` }],
    expected: [row(IOS, 'sync', SYNC), row(IOS, 'sync', 'profile')],
  },
  {
    id: '13',
    title: 'Android oldsync+vpn+profile → sync rows plus vpn row',
    tokens: [{ client: ANDROID, scope: `${SYNC} ${VPN} profile` }],
    expected: [
      row(ANDROID, 'sync', SYNC),
      row(ANDROID, 'sync', 'profile'),
      row(ANDROID, 'vpn', VPN),
    ],
  },
  {
    id: '14',
    title: 'Mobile oldsync+relay+vpn+profile → sync rows plus vpn row',
    tokens: [{ client: ANDROID, scope: `${SYNC} ${RELAY} ${VPN} profile` }],
    expected: [
      row(ANDROID, 'sync', SYNC),
      row(ANDROID, 'sync', 'profile'),
      row(ANDROID, 'vpn', VPN),
    ],
  },
  {
    id: '15',
    title: 'Mobile relay+vpn+profile → vpn rows only',
    tokens: [{ client: ANDROID, scope: `${RELAY} ${VPN} profile` }],
    expected: [row(ANDROID, 'vpn', VPN), row(ANDROID, 'vpn', 'profile')],
  },

  // C. Desktop tokens carrying the Sync scope
  {
    id: '16',
    title: 'Desktop oldsync+relay+profile → relay rows, no sync',
    tokens: [{ client: DESKTOP, scope: `${SYNC} ${RELAY} profile` }],
    expected: [row(DESKTOP, 'relay', RELAY), row(DESKTOP, 'relay', 'profile')],
  },
  {
    id: '17',
    title: 'Desktop oldsync+vpn+profile → vpn rows, no sync',
    tokens: [{ client: DESKTOP, scope: `${SYNC} ${VPN} profile` }],
    expected: [row(DESKTOP, 'vpn', VPN), row(DESKTOP, 'vpn', 'profile')],
  },
  {
    id: '18',
    title: 'Desktop oldsync+profile → sync rows',
    tokens: [{ client: DESKTOP, scope: `${SYNC} profile` }],
    expected: [row(DESKTOP, 'sync', SYNC), row(DESKTOP, 'sync', 'profile')],
  },

  // D. Existing rows and timestamps
  {
    id: '19',
    title: 'Existing row, token newer than first → unchanged',
    existing: [
      {
        client: DESKTOP,
        service: 'vpn',
        scope: VPN,
        first: ms('2024-03-01T00:00:00Z'),
        last: ms('2024-03-02T00:00:00Z'),
      },
    ],
    tokens: [
      {
        client: DESKTOP,
        scope: VPN,
        createdAt: new Date('2024-03-01T12:00:00Z'),
      },
    ],
    expected: [
      row(DESKTOP, 'vpn', VPN, {
        first: ms('2024-03-01T00:00:00Z'),
        last: ms('2024-03-02T00:00:00Z'),
      }),
    ],
  },
  {
    id: '20',
    title:
      'Existing row, token a day older → first moves to the token, last unchanged',
    existing: [
      {
        client: DESKTOP,
        service: 'vpn',
        scope: VPN,
        first: ms('2024-03-01T00:00:00Z'),
        last: ms('2024-03-02T00:00:00Z'),
      },
    ],
    tokens: [
      {
        client: DESKTOP,
        scope: VPN,
        createdAt: new Date('2024-02-29T00:00:00Z'),
      },
    ],
    expected: [
      row(DESKTOP, 'vpn', VPN, {
        first: ms('2024-02-29T00:00:00Z'),
        last: ms('2024-03-02T00:00:00Z'),
      }),
    ],
  },
  {
    id: '21',
    title: 'Existing row at T+500ms, token at T → unchanged',
    existing: [
      {
        client: DESKTOP,
        service: 'vpn',
        scope: VPN,
        first: ms('2024-03-01T00:00:00Z') + 500,
        last: ms('2024-03-01T00:00:00Z') + 500,
      },
    ],
    tokens: [
      {
        client: DESKTOP,
        scope: VPN,
        createdAt: new Date('2024-03-01T00:00:00Z'),
      },
    ],
    expected: [
      row(DESKTOP, 'vpn', VPN, {
        first: ms('2024-03-01T00:00:00Z') + 500,
        last: ms('2024-03-01T00:00:00Z') + 500,
      }),
    ],
  },
  {
    id: '22',
    title: 'Existing row, token newer than last → last never moves later',
    existing: [
      {
        client: DESKTOP,
        service: 'vpn',
        scope: VPN,
        first: ms('2024-03-01T00:00:00Z'),
        last: ms('2024-03-02T00:00:00Z'),
      },
    ],
    tokens: [
      {
        client: DESKTOP,
        scope: VPN,
        createdAt: new Date('2025-01-01T00:00:00Z'),
      },
    ],
    expected: [
      row(DESKTOP, 'vpn', VPN, {
        first: ms('2024-03-01T00:00:00Z'),
        last: ms('2024-03-02T00:00:00Z'),
      }),
    ],
  },
  {
    id: '23',
    title: 'Deauthorized row, token older → first moves, deauthorizedAt kept',
    existing: [
      {
        client: DESKTOP,
        service: 'vpn',
        scope: VPN,
        first: ms('2024-03-01T00:00:00Z'),
        last: ms('2024-03-02T00:00:00Z'),
        deauthorizedAt: ms('2024-04-01T00:00:00Z'),
      },
    ],
    tokens: [
      {
        client: DESKTOP,
        scope: VPN,
        createdAt: new Date('2024-01-01T00:00:00Z'),
      },
    ],
    expected: [
      row(DESKTOP, 'vpn', VPN, {
        first: ms('2024-01-01T00:00:00Z'),
        last: ms('2024-03-02T00:00:00Z'),
        deauthorizedAt: ms('2024-04-01T00:00:00Z'),
      }),
    ],
  },

  // E. Several tokens for one user
  {
    id: '24',
    title:
      'Two tokens for one key in different batches → one row set, first = earliest',
    tokens: [
      {
        client: ANDROID,
        scope: `${SYNC} profile`,
        createdAt: new Date('2023-01-01T00:00:00Z'),
      },
      {
        client: ANDROID,
        scope: `${SYNC} profile`,
        createdAt: new Date('2024-01-01T00:00:00Z'),
      },
    ],
    expected: [
      row(ANDROID, 'sync', SYNC, { first: ms('2023-01-01T00:00:00Z') }),
      row(ANDROID, 'sync', 'profile', { first: ms('2023-01-01T00:00:00Z') }),
    ],
    attempted: 4,
  },
  {
    id: '26',
    title: 'Same scopes from two clients → one row set per client',
    tokens: [
      { client: ANDROID, scope: `${SYNC} profile` },
      { client: IOS, scope: `${SYNC} profile` },
    ],
    expected: [
      row(ANDROID, 'sync', SYNC),
      row(ANDROID, 'sync', 'profile'),
      row(IOS, 'sync', SYNC),
      row(IOS, 'sync', 'profile'),
    ],
  },
  {
    id: '27',
    title:
      'Desktop vpn token plus mobile oldsync+vpn token → vpn under each client, sync under mobile only',
    tokens: [
      { client: DESKTOP, scope: `${VPN} profile` },
      { client: ANDROID, scope: `${SYNC} ${VPN} profile` },
    ],
    expected: [
      row(DESKTOP, 'vpn', VPN),
      row(DESKTOP, 'vpn', 'profile'),
      row(ANDROID, 'sync', SYNC),
      row(ANDROID, 'sync', 'profile'),
      row(ANDROID, 'vpn', VPN),
    ],
  },
];

// Fixture uids use the 0xCD prefix so they never collide with the sibling
// spec's 0xCC rows.
function uidFor(scenario: Scenario): Buffer {
  return Buffer.from('cd' + scenario.id.padStart(30, '0'), 'hex');
}
function scenarioTokenHash(label: string): Buffer {
  return crypto.createHash('sha256').update(`scenario-${label}`).digest();
}
function makeLog() {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  };
}
function completeFields(log: ReturnType<typeof makeLog>) {
  const call = log.info.mock.calls.find(
    ([type]) => type === 'backfill.complete'
  );
  if (!call) throw new Error('backfill.complete was not logged');
  return call[1] as {
    upsertsAttempted: number;
    rowsAffected: number;
    skippedNoMatch: number;
    skippedAllowlist: number;
    countsByService: Record<string, number>;
  };
}

type DbRow = {
  uid: Buffer;
  clientId: Buffer;
  scope: string;
  service: string;
  firstAuthorizedTosAt: number;
  lastAuthorizedTosAt: number;
  deauthorizedAt: number | null;
};
const key = (r: { client: string; service: string; scope: string }) =>
  `${r.client}|${r.service}|${r.scope}`;

describe('#integration - scripts/backfill-account-authorizations scenarios', () => {
  let pool: mysql.Pool;
  let query: Query;
  const baseRunOpts = {
    dryRun: false,
    // One token per batch so every multi-token scenario crosses a batch
    // boundary, the harder path for the dedupe and the upsert guard.
    batchSize: 1,
    batchDelayMs: 0,
    retryAttempts: 1,
    retryInitialDelayMs: 1,
  };

  async function clearFixture() {
    await query(
      "DELETE FROM refreshTokens WHERE LEFT(userId, 1) = UNHEX('cd')"
    );
    await query(
      "DELETE FROM accountAuthorizations WHERE LEFT(uid, 1) = UNHEX('cd')"
    );
  }

  async function seed() {
    for (const s of SCENARIOS) {
      const uid = uidFor(s);
      for (const [i, t] of s.tokens.entries()) {
        const createdAt = t.createdAt ?? T0;
        await query(
          'INSERT INTO refreshTokens (clientId, userId, scope, token, profileChangedAt, createdAt, lastUsedAt) ' +
            'VALUES (?, ?, ?, ?, NULL, ?, ?)',
          [
            Buffer.from(t.client, 'hex'),
            uid,
            t.scope,
            scenarioTokenHash(`${s.id}-${i}`),
            toMysqlTs(createdAt),
            toMysqlTs(createdAt),
          ]
        );
      }
      for (const e of s.existing ?? []) {
        await query(
          'INSERT INTO accountAuthorizations ' +
            '(uid, scope, service, clientId, firstAuthorizedTosAt, lastAuthorizedTosAt, deauthorizedAt) ' +
            'VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            uid,
            e.scope,
            e.service,
            Buffer.from(e.client, 'hex'),
            e.first,
            e.last,
            e.deauthorizedAt ?? null,
          ]
        );
      }
    }
  }

  async function fixtureRows(): Promise<DbRow[]> {
    return query<DbRow[]>(
      'SELECT uid, clientId, scope, service, firstAuthorizedTosAt, lastAuthorizedTosAt, deauthorizedAt ' +
        "FROM accountAuthorizations WHERE LEFT(uid, 1) = UNHEX('cd')"
    );
  }

  function rowsFor(all: DbRow[], s: Scenario) {
    const uid = uidFor(s);
    return all
      .filter((r) => r.uid.equals(uid))
      .map((r) => ({
        client: r.clientId.toString('hex'),
        service: r.service,
        scope: r.scope,
        first: Number(r.firstAuthorizedTosAt),
        last: Number(r.lastAuthorizedTosAt),
        deauthorizedAt:
          r.deauthorizedAt === null ? null : Number(r.deauthorizedAt),
      }))
      .sort((a, b) => key(a).localeCompare(key(b)));
  }

  function allExpected(
    filter: (r: ExpectedRow, s: Scenario) => boolean = () => true
  ) {
    return SCENARIOS.flatMap((s) =>
      s.expected
        .filter((r) => filter(r, s))
        .map((r) => `${uidFor(s).toString('hex')}|${key(r)}`)
    ).sort();
  }
  function allActual(all: DbRow[]) {
    return all
      .map(
        (r) =>
          `${r.uid.toString('hex')}|${r.clientId.toString('hex')}|${r.service}|${r.scope}`
      )
      .sort();
  }

  beforeAll(() => {
    const c = config.oauthServer.mysql;
    pool = mysql.createPool({
      connectionLimit: 2,
      host: c.host,
      port: parseInt(c.port, 10),
      user: c.user,
      password: c.password,
      database: c.database,
      timezone: '+00:00',
      // Same as the script's own pool: lets affectedRows tell inserts and
      // moved rows from untouched ones.
      flags: ['-FOUND_ROWS'],
    });
    query = <T = unknown>(sql: string, values?: unknown[]) =>
      new Promise<T>((resolve, reject) => {
        pool.query(sql, values, (err, results) => {
          if (err) reject(err);
          else resolve(results as T);
        });
      });
  });

  afterAll(async () => {
    await clearFixture();
    await new Promise<void>((resolve) => pool.end(() => resolve()));
  });

  describe('one full run over the seeded fixture', () => {
    let all: DbRow[];
    let firstRun: ReturnType<typeof completeFields>;

    beforeAll(async () => {
      await clearFixture();
      await seed();
      const log = makeLog();
      await runBackfill(query, CFG, log, baseRunOpts);
      firstRun = completeFields(log);
      all = await fixtureRows();
    });

    it.each(SCENARIOS.map((s) => [s.id, s.title, s]))(
      '%s %s',
      (_id, _title, s: Scenario) => {
        const actual = rowsFor(all, s);
        expect(actual.map(key)).toEqual(
          s.expected.map(key).sort((a, b) => a.localeCompare(b))
        );
        for (const exp of s.expected) {
          const got = actual.find((a) => key(a) === key(exp));
          expect(got).toBeDefined();
          if (exp.first !== undefined) expect(got?.first).toBe(exp.first);
          if (exp.last !== undefined) expect(got?.last).toBe(exp.last);
          if (exp.deauthorizedAt !== undefined) {
            expect(got?.deauthorizedAt).toBe(exp.deauthorizedAt);
          }
          if (
            exp.first === undefined &&
            exp.last === undefined &&
            !s.existing
          ) {
            // Rows the backfill created carry the token's createdAt.
            const createdAt =
              s.tokens.length === 1 ? (s.tokens[0].createdAt ?? T0) : undefined;
            if (createdAt) {
              expect(got?.first).toBe(createdAt.getTime());
              expect(got?.last).toBe(createdAt.getTime());
            }
          }
        }
      }
    );

    it('writes no rows outside the scenario table', () => {
      expect(allActual(all)).toEqual(allExpected());
    });

    it('sets last to the first-scanned token when two tokens share a key across batches', () => {
      const s = SCENARIOS.find((x) => x.id === '24') as Scenario;
      const scanOrder = s.tokens
        .map((t, i) => ({ t, hash: scenarioTokenHash(`${s.id}-${i}`) }))
        .sort((a, b) => Buffer.compare(a.hash, b.hash));
      const firstScanned = scanOrder[0].t.createdAt as Date;
      for (const r of rowsFor(all, s)) {
        expect(r.last).toBe(firstScanned.getTime());
      }
    });

    it('reports upsertsAttempted as the rows emitted per token before dedupe', () => {
      const attempted = SCENARIOS.reduce(
        (n, s) => n + (s.attempted ?? s.expected.length),
        0
      );
      expect(firstRun.upsertsAttempted).toBe(attempted);
    });

    it('reports countsByService matching the rows emitted per service', () => {
      const perService: Record<string, number> = {
        sync: 0,
        relay: 0,
        smartwindow: 0,
        vpn: 0,
        monitor: 0,
        '': 0,
      };
      for (const s of SCENARIOS) {
        const factor =
          (s.attempted ?? s.expected.length) / Math.max(s.expected.length, 1);
        for (const r of s.expected) perService[r.service] += factor;
      }
      expect(firstRun.countsByService).toEqual(perService);
    });

    it('reports the allowlist and no-match skips', () => {
      expect(firstRun.skippedAllowlist).toBe(2);
      expect(firstRun.skippedNoMatch).toBe(1);
    });

    it('reports rowsAffected as inserts plus two per moved firstAuthorizedTosAt', () => {
      const preExisting = SCENARIOS.reduce(
        (n, s) => n + (s.existing?.length ?? 0),
        0
      );
      const inserted = allExpected().length - preExisting;
      // Scenarios 20 and 23 each move one existing row. Scenario 24 moves its
      // two rows only if the newer token happens to be scanned first.
      const s24 = SCENARIOS.find((x) => x.id === '24') as Scenario;
      const scanOrder = s24.tokens
        .map((t, i) => ({ t, hash: scenarioTokenHash(`${s24.id}-${i}`) }))
        .sort((a, b) => Buffer.compare(a.hash, b.hash));
      const newerFirst =
        (scanOrder[0].t.createdAt as Date) > (scanOrder[1].t.createdAt as Date);
      const movedRows = 2 + (newerFirst ? s24.expected.length : 0);
      expect(firstRun.rowsAffected).toBe(inserted + 2 * movedRows);
    });

    it('a second identical run affects no rows and changes nothing', async () => {
      const log = makeLog();
      await runBackfill(query, CFG, log, baseRunOpts);
      expect(completeFields(log).rowsAffected).toBe(0);
      expect(allActual(await fixtureRows())).toEqual(allActual(all));
    });

    it('a rerun after a token is backdated a day moves only that key, counting 2 per row', async () => {
      const s = SCENARIOS.find((x) => x.id === '01') as Scenario;
      await query('UPDATE refreshTokens SET createdAt = ? WHERE token = ?', [
        toMysqlTs(new Date(T0.getTime() - 86_400_000)),
        scenarioTokenHash(`${s.id}-0`),
      ]);
      const log = makeLog();
      await runBackfill(query, CFG, log, baseRunOpts);
      expect(completeFields(log).rowsAffected).toBe(2 * s.expected.length);
      for (const r of rowsFor(await fixtureRows(), s)) {
        expect(r.first).toBe(T0.getTime() - 86_400_000);
        expect(r.last).toBe(T0.getTime());
      }
    });
  });

  describe('run options over the same fixture', () => {
    beforeEach(async () => {
      await clearFixture();
      await seed();
    });

    it.each([['vpn'], ['sync'], ['relay'], ['monitor']])(
      '--service %s writes only that service, including rows from exchange-derived tokens',
      async (service) => {
        await runBackfill(query, CFG, makeLog(), {
          ...baseRunOpts,
          serviceFilter: service,
        });
        const preExisting = allExpected((_r, s) => Boolean(s.existing));
        const expected = [
          ...new Set([
            ...allExpected((r) => r.service === service),
            ...preExisting,
          ]),
        ].sort();
        expect(allActual(await fixtureRows())).toEqual(expected);
      }
    );

    it('--omit-scope profile writes everything except profile rows', async () => {
      await runBackfill(query, CFG, makeLog(), {
        ...baseRunOpts,
        omitScopes: new Set(['profile']),
      });
      expect(allActual(await fixtureRows())).toEqual(
        allExpected((r) => r.scope !== 'profile')
      );
    });

    it('--dry-run writes nothing and reports the same counts as the live run', async () => {
      const log = makeLog();
      await runBackfill(query, CFG, log, { ...baseRunOpts, dryRun: true });
      expect(allActual(await fixtureRows())).toEqual(
        allExpected((_r, s) => Boolean(s.existing))
      );
      const attempted = SCENARIOS.reduce(
        (n, s) => n + (s.attempted ?? s.expected.length),
        0
      );
      expect(completeFields(log).upsertsAttempted).toBe(attempted);
      expect(completeFields(log).rowsAffected).toBe(0);
    });

    it('--start-cursor resumes strictly after the given token', async () => {
      const log = makeLog();
      await runBackfill(query, CFG, log, { ...baseRunOpts, batchSize: 5 });
      const batches = log.info.mock.calls.filter(
        ([type]) => type === 'backfill.batch'
      );
      const cursor: string = batches[0][1].cursor;

      await query(
        "DELETE FROM accountAuthorizations WHERE LEFT(uid, 1) = UNHEX('cd')"
      );
      await runBackfill(query, CFG, makeLog(), {
        ...baseRunOpts,
        batchSize: 5,
        startCursor: Buffer.from(cursor, 'hex'),
      });

      const afterCursor = new Set(
        SCENARIOS.flatMap((s) =>
          s.tokens
            .map((_t, i) => ({ s, hash: scenarioTokenHash(`${s.id}-${i}`) }))
            .filter(({ hash }) => hash.toString('hex') > cursor)
            .map(({ s }) => uidFor(s).toString('hex'))
        )
      );
      const resumed = allActual(await fixtureRows());
      expect(resumed.length).toBeLessThan(allExpected().length);
      for (const r of resumed) {
        expect(afterCursor.has(r.split('|')[0])).toBe(true);
      }
    });
  });
});
