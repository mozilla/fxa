/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as crypto from 'crypto';
import * as mysql from 'mysql';

import {
  buildServiceConfig,
  Query,
  run as runBackfill,
} from '../../scripts/backfill-account-authorizations/backfill-account-authorizations';

const config = require('../../config').default.getProperties();

const VPN_SCOPE = 'https://identity.mozilla.com/apps/vpn';
const SMARTWINDOW_SCOPE = 'https://identity.mozilla.com/apps/smartwindow';

// Pull a real VPN-allowlisted clientId from config so the allowlist gate
// passes in the same way it would in production.
const exchangeCfg = config.oauthServer.exchange;
const VPN_ALLOWED_CLIENT_ID: string =
  exchangeCfg.allowedClientsForService?.vpn?.[0];
// Synthetic clientId that is NOT on any allowlist, for the negative test.
const UNRELATED_CLIENT_ID = 'aa01000000000009';
// Smartwindow has no allowlist; any clientId works.
const SMART_CLIENT_ID = UNRELATED_CLIENT_ID;

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
      exchangeCfg.allowedClientsForService || {}
    );
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
    // Smartwindow has no allowlist gate, so this exercise focuses on the
    // PK-includes-clientId property: same scope, same service, two
    // different clientIds → two distinct rows.
    const userId = uid('02');
    const createdAt = new Date('2024-06-15T00:00:00Z');
    const clientA = SMART_CLIENT_ID;
    const clientB = 'aa01000000000010';

    await insertRefreshToken({
      label: 'multi-client-a',
      userId,
      clientId: clientA,
      scope: SMARTWINDOW_SCOPE,
      createdAt,
    });
    await insertRefreshToken({
      label: 'multi-client-b',
      userId,
      clientId: clientB,
      scope: SMARTWINDOW_SCOPE,
      createdAt,
    });

    await runBackfill(query, buildCfg(), noopLog(), baseRunOpts);

    const rows = await query<Array<{ clientId: Buffer }>>(
      'SELECT clientId FROM accountAuthorizations WHERE uid = ? AND service = ? ' +
        'ORDER BY clientId',
      [userId, 'smartwindow']
    );
    const hexClientIds = rows.map((r) => r.clientId.toString('hex')).sort();
    expect(hexClientIds).toEqual([clientA, clientB].sort());
  });

  it('aggregates LEAST/GREATEST across multiple tokens for the same (uid, scope, service, clientId)', async () => {
    const userId = uid('03');
    const earlier = new Date('2023-01-01T00:00:00Z');
    const later = new Date('2024-06-01T00:00:00Z');
    // Insert the later token first; cursor scan order shouldn't matter
    // because the ON DUPLICATE KEY UPDATE clause does LEAST/GREATEST.
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
