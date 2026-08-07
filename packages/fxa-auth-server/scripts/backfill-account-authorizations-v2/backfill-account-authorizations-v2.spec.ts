/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  distinctScopes,
  partitionBatch,
  buildV2Upsert,
  humanDuration,
  fetchBatch,
  resolveScopeIds,
  run,
  encodeCursor,
  decodeCursor,
  Cursor,
  V1Row,
  V2Row,
  Query,
  Logger,
} from './backfill-account-authorizations-v2';

const UID_A = Buffer.alloc(16, 1);
const UID_B = Buffer.alloc(16, 2);
const CLIENT = Buffer.alloc(8, 9);

function v1Row(overrides: Partial<V1Row> = {}): V1Row {
  return {
    uid: UID_A,
    scope: 'profile',
    service: '',
    clientId: CLIENT,
    firstAuthorizedTosAt: 1000,
    lastAuthorizedTosAt: 2000,
    ...overrides,
  };
}

describe('backfill-account-authorizations-v2', () => {
  describe('distinctScopes', () => {
    it('dedupes scopes preserving first-seen order', () => {
      const rows = [
        v1Row({ scope: 'profile' }),
        v1Row({ scope: 'openid' }),
        v1Row({ scope: 'profile' }),
      ];
      expect(distinctScopes(rows)).toEqual(['profile', 'openid']);
    });

    it('returns an empty array for no rows', () => {
      expect(distinctScopes([])).toEqual([]);
    });
  });

  describe('partitionBatch', () => {
    it('maps rows with a known scope to v2 rows carrying the scopeId', () => {
      const rows = [v1Row({ scope: 'profile', service: 'sync' })];
      const { v2Rows, missing } = partitionBatch(
        rows,
        new Map([['profile', 3]])
      );

      expect(missing.size).toBe(0);
      expect(v2Rows).toEqual<V2Row[]>([
        {
          uid: UID_A,
          service: 'sync',
          scopeId: 3,
          clientId: CLIENT,
          firstAuthorizedTosAt: 1000,
          lastAuthorizedTosAt: 2000,
        },
      ]);
    });

    it('counts rows whose scope is absent from the table as missing', () => {
      const rows = [
        v1Row({ scope: 'profile' }),
        v1Row({ scope: 'unseeded' }),
        v1Row({ scope: 'unseeded', uid: UID_B }),
      ];
      const { v2Rows, missing } = partitionBatch(
        rows,
        new Map([['profile', 3]])
      );

      expect(v2Rows).toHaveLength(1);
      expect(v2Rows[0].scopeId).toBe(3);
      expect(Object.fromEntries(missing)).toEqual({ unseeded: 2 });
    });

    it('matches a scope case-insensitively (scopes.scope is a CI unique key)', () => {
      // Resolver keys the map lower-cased; a v1 row cased differently must
      // still resolve, not be counted missing.
      const rows = [v1Row({ scope: 'Profile' })];
      const { v2Rows, missing } = partitionBatch(
        rows,
        new Map([['profile', 3]])
      );

      expect(missing.size).toBe(0);
      expect(v2Rows[0].scopeId).toBe(3);
    });
  });

  describe('humanDuration', () => {
    it.each([
      [5_000, '5s'],
      [65_000, '1m5s'],
      [3_661_000, '1h1m1s'],
    ])('formats %ims as %s', (ms, expected) => {
      expect(humanDuration(ms)).toBe(expected);
    });
  });

  describe('buildV2Upsert', () => {
    it('builds one tuple per row with flat params in column order', () => {
      const v2Rows: V2Row[] = [
        {
          uid: UID_A,
          service: 'sync',
          scopeId: 3,
          clientId: CLIENT,
          firstAuthorizedTosAt: 1000,
          lastAuthorizedTosAt: 2000,
        },
        {
          uid: UID_B,
          service: '',
          scopeId: 4,
          clientId: CLIENT,
          firstAuthorizedTosAt: 1500,
          lastAuthorizedTosAt: 2500,
        },
      ];
      const { sql, params } = buildV2Upsert(v2Rows);

      expect(sql).toContain('INSERT INTO accountAuthorizations_v2');
      expect(sql).toContain('(?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?)');
      // Reconciles historical first, advances last — idempotent + backfill-safe.
      expect(sql).toContain(
        'firstAuthorizedTosAt = LEAST(firstAuthorizedTosAt, VALUES(firstAuthorizedTosAt))'
      );
      expect(sql).toContain(
        'lastAuthorizedTosAt = GREATEST(lastAuthorizedTosAt, VALUES(lastAuthorizedTosAt))'
      );
      expect(params).toEqual([
        UID_A,
        'sync',
        3,
        CLIENT,
        1000,
        2000,
        UID_B,
        '',
        4,
        CLIENT,
        1500,
        2500,
      ]);
    });
  });

  describe('fetchBatch', () => {
    it('selects the first page ordered by PK with no WHERE when cursor is null', async () => {
      const query = jest
        .fn()
        .mockResolvedValue([]) as jest.MockedFunction<Query>;

      await fetchBatch(query, null, 500);

      const [sql, params] = query.mock.calls[0];
      expect(sql).toContain('FROM accountAuthorizations ');
      expect(sql).toContain('ORDER BY uid, scope, service, clientId LIMIT ?');
      expect(sql).not.toContain('WHERE');
      expect(params).toEqual([500]);
    });

    it('keyset-paginates over the full PK tuple when given a cursor', async () => {
      const query = jest
        .fn()
        .mockResolvedValue([]) as jest.MockedFunction<Query>;
      const cursor = {
        uid: UID_A,
        scope: 'profile',
        service: 'sync',
        clientId: CLIENT,
      };

      await fetchBatch(query, cursor, 500);

      const [sql, params] = query.mock.calls[0];
      expect(sql).toContain(
        'AND (uid, scope, service, clientId) > (?, ?, ?, ?)'
      );
      expect(params).toEqual([UID_A, UID_A, 'profile', 'sync', CLIENT, 500]);
    });

    it('leads with a uid >= conjunct so MySQL can range-seek the PK', async () => {
      // Logically redundant with the tuple comparison, but without it MySQL
      // scans the PRIMARY index from the start on every batch.
      const query = jest
        .fn()
        .mockResolvedValue([]) as jest.MockedFunction<Query>;
      const cursor = {
        uid: UID_A,
        scope: 'profile',
        service: 'sync',
        clientId: CLIENT,
      };

      await fetchBatch(query, cursor, 500);

      const [sql, params] = query.mock.calls[0];
      expect(sql).toContain('WHERE uid >= ? ');
      // cursor.uid is bound twice: the range conjunct, then the tuple head.
      expect(params?.[0]).toBe(UID_A);
      expect(params?.[1]).toBe(UID_A);
    });
  });

  describe('resolveScopeIds', () => {
    it('short-circuits without querying for an empty scope list', async () => {
      const query = jest.fn() as jest.MockedFunction<Query>;

      const result = await resolveScopeIds(query, []);

      expect(result.size).toBe(0);
      expect(query).not.toHaveBeenCalled();
    });

    it('builds one IN placeholder per scope and keys the map lower-cased', async () => {
      const query = jest.fn().mockResolvedValue([
        { id: 3, scope: 'Profile' },
        { id: 2, scope: 'openid' },
      ]) as jest.MockedFunction<Query>;

      const result = await resolveScopeIds(query, ['Profile', 'openid']);

      const [sql, params] = query.mock.calls[0];
      expect(sql).toContain('WHERE scope IN (?, ?)');
      expect(params).toEqual(['Profile', 'openid']);
      expect(result.get('profile')).toBe(3);
      expect(result.get('openid')).toBe(2);
    });
  });

  describe('encodeCursor / decodeCursor', () => {
    // Base64 of an arbitrary JSON payload, for building malformed tokens.
    function tokenFor(payload: unknown): string {
      return Buffer.from(JSON.stringify(payload)).toString('base64');
    }
    const VALID_PAYLOAD = {
      uid: 'a'.repeat(32),
      scope: 'profile',
      service: 'sync',
      clientId: 'b'.repeat(16),
    };

    it('round-trips a cursor through the token', () => {
      const cursor: Cursor = {
        uid: UID_A,
        scope: 'profile',
        service: 'sync',
        clientId: CLIENT,
      };

      expect(decodeCursor(encodeCursor(cursor))).toEqual(cursor);
    });

    it('round-trips a scope containing shell-hostile characters', () => {
      // The token is meant to be pasted as a single shell argument, and
      // scope is a VARCHAR(256) that can hold spaces, quotes and `$`.
      const cursor: Cursor = {
        uid: UID_A,
        scope: `weird "scope" with spaces and $VARS 'quoted'`,
        service: '',
        clientId: CLIENT,
      };

      expect(decodeCursor(encodeCursor(cursor))).toEqual(cursor);
    });

    it('throws when the token is not base64', () => {
      expect(() => decodeCursor('not base64 !!!')).toThrow(
        'Invalid resume cursor: not valid base64'
      );
    });

    it('tolerates whitespace around a token copied out of a log viewer', () => {
      const cursor: Cursor = {
        uid: UID_A,
        scope: 'profile',
        service: 'sync',
        clientId: CLIENT,
      };

      expect(decodeCursor(`  ${encodeCursor(cursor)}\n`)).toEqual(cursor);
    });

    it('throws on an empty token rather than silently restarting at page one', () => {
      // `--resume-from "$LAST_CURSOR"` with an unset variable must fail, not
      // quietly re-walk the table from the beginning.
      expect(() => decodeCursor('')).toThrow('Invalid resume cursor');
    });

    it('throws when the token is base64 but not JSON', () => {
      const token = Buffer.from('plain text, not json').toString('base64');

      expect(() => decodeCursor(token)).toThrow(
        'Invalid resume cursor: not valid JSON'
      );
    });

    it('throws when uid is not exactly 32 hex characters', () => {
      const token = tokenFor({ ...VALID_PAYLOAD, uid: 'a'.repeat(31) });

      expect(() => decodeCursor(token)).toThrow(
        'Invalid resume cursor: uid must be 32 hex characters'
      );
    });

    it('throws when clientId is not exactly 16 hex characters', () => {
      const token = tokenFor({ ...VALID_PAYLOAD, clientId: 'b'.repeat(17) });

      expect(() => decodeCursor(token)).toThrow(
        'Invalid resume cursor: clientId must be 16 hex characters'
      );
    });

    it('throws when scope is not a string', () => {
      const token = tokenFor({ ...VALID_PAYLOAD, scope: 42 });

      expect(() => decodeCursor(token)).toThrow(
        'Invalid resume cursor: scope must be a string'
      );
    });

    it('throws when service is not a string', () => {
      const token = tokenFor({ ...VALID_PAYLOAD, service: null });

      expect(() => decodeCursor(token)).toThrow(
        'Invalid resume cursor: service must be a string'
      );
    });
  });

  describe('run', () => {
    let log: jest.Mocked<Logger>;

    beforeEach(() => {
      log = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
    });

    // Dispatches by SQL shape: v1 page, scope resolution, or v2 upsert.
    function makeQuery(
      pages: V1Row[][],
      scopeTable: Record<string, number>,
      upserts: unknown[][]
    ) {
      let page = 0;
      const fn = jest.fn(async (sql: string, params?: unknown[]) => {
        if (sql.includes('FROM accountAuthorizations ')) {
          return pages[page++] ?? [];
        }
        if (sql.includes('FROM scopes')) {
          return (params ?? [])
            .filter((s) => (s as string) in scopeTable)
            .map((s) => ({ scope: s, id: scopeTable[s as string] }));
        }
        if (sql.includes('INSERT INTO accountAuthorizations_v2')) {
          upserts.push(params ?? []);
          return {};
        }
        throw new Error(`unexpected SQL: ${sql}`);
      });
      return fn as unknown as jest.MockedFunction<Query>;
    }

    it('upserts resolved rows and stops on a short (final) batch', async () => {
      const upserts: unknown[][] = [];
      const query = makeQuery(
        [[v1Row({ scope: 'profile' }), v1Row({ scope: 'openid', uid: UID_B })]],
        { profile: 3, openid: 2 },
        upserts
      );

      await run(query, log, { dryRun: false, batchSize: 10, batchDelayMs: 0 });

      expect(upserts).toHaveLength(1);
      // Assert the actual params, not just count: two rows, flat, in column
      // order, with the resolved scopeIds.
      expect(upserts[0]).toEqual([
        UID_A,
        '',
        3,
        CLIENT,
        1000,
        2000,
        UID_B,
        '',
        2,
        CLIENT,
        1000,
        2000,
      ]);
      expect(log.info).toHaveBeenCalledWith(
        'backfill_v2.complete',
        expect.objectContaining({ totalScanned: 2, totalV2Written: 2 })
      );
    });

    it('rethrows and logs when the upsert fails, without a completion log', async () => {
      const query = jest.fn(async (sql: string) => {
        if (sql.includes('FROM accountAuthorizations ')) {
          return [v1Row({ scope: 'profile' })];
        }
        if (sql.includes('FROM scopes')) {
          return [{ scope: 'profile', id: 3 }];
        }
        throw new Error('insert boom');
      }) as unknown as jest.MockedFunction<Query>;

      await expect(
        run(query, log, { dryRun: false, batchSize: 10, batchDelayMs: 0 })
      ).rejects.toThrow('insert boom');

      expect(log.error).toHaveBeenCalledWith(
        'backfill_v2.upsert_batch_failed',
        expect.objectContaining({ batchNum: 1, rowCount: 1 })
      );
      expect(log.info).not.toHaveBeenCalledWith(
        'backfill_v2.complete',
        expect.anything()
      );
    });

    it('does not upsert on a dry run', async () => {
      const upserts: unknown[][] = [];
      const query = makeQuery(
        [[v1Row({ scope: 'profile' })]],
        { profile: 3 },
        upserts
      );

      await run(query, log, { dryRun: true, batchSize: 10, batchDelayMs: 0 });

      expect(upserts).toHaveLength(0);
      expect(log.info).toHaveBeenCalledWith(
        'backfill_v2.complete',
        expect.objectContaining({
          totalScanned: 1,
          totalV2Written: 1,
          dryRun: true,
        })
      );
    });

    it('accumulates unresolved scopes and warns with the seed list', async () => {
      const upserts: unknown[][] = [];
      const query = makeQuery(
        [
          [
            v1Row({ scope: 'profile' }),
            v1Row({ scope: 'mystery', uid: UID_B }),
          ],
        ],
        { profile: 3 },
        upserts
      );

      await run(query, log, { dryRun: false, batchSize: 10, batchDelayMs: 0 });

      // Only the resolvable row is written.
      expect(upserts[0]).toHaveLength(6);
      expect(log.warn).toHaveBeenCalledWith(
        'backfill_v2.missing_scopes',
        expect.objectContaining({ scopes: ['mystery'] })
      );
    });

    it('pages with a full batch then a short one, advancing the keyset cursor', async () => {
      const upserts: unknown[][] = [];
      const query = makeQuery(
        [
          [v1Row({ scope: 'profile' }), v1Row({ scope: 'openid', uid: UID_B })],
          [v1Row({ scope: 'email', uid: UID_B })],
        ],
        { profile: 3, openid: 2, email: 4 },
        upserts
      );

      await run(query, log, { dryRun: false, batchSize: 2, batchDelayMs: 0 });

      // fetch1 returns a full batch (2 == batchSize) so the loop continues;
      // fetch2 returns 1 (< batchSize) and breaks — 2 fetches, no extra probe.
      const fetchCalls = query.mock.calls.filter(([sql]) =>
        sql.includes('FROM accountAuthorizations ')
      );
      expect(fetchCalls).toHaveLength(2);
      // Second fetch resumes after the last row of page one: the range conjunct
      // uid, then the keyset tuple (uid, scope, service, clientId), then limit.
      expect(fetchCalls[1][1]).toEqual([UID_B, UID_B, 'openid', '', CLIENT, 2]);
      expect(log.info).toHaveBeenCalledWith(
        'backfill_v2.complete',
        expect.objectContaining({ totalScanned: 3, totalV2Written: 3 })
      );
    });

    it('binds startCursor into the very first fetch instead of reading page one', async () => {
      const upserts: unknown[][] = [];
      const query = makeQuery(
        [[v1Row({ scope: 'openid', uid: UID_B })]],
        { openid: 2 },
        upserts
      );
      const startCursor: Cursor = {
        uid: UID_A,
        scope: 'profile',
        service: 'sync',
        clientId: CLIENT,
      };

      await run(query, log, {
        dryRun: false,
        batchSize: 10,
        batchDelayMs: 0,
        startCursor,
      });

      const [sql, params] = query.mock.calls[0];
      expect(sql).toContain(
        'AND (uid, scope, service, clientId) > (?, ?, ?, ?)'
      );
      expect(params).toEqual([UID_A, UID_A, 'profile', 'sync', CLIENT, 10]);
    });

    it('logs the encoded startCursor on the start log when resuming', async () => {
      const upserts: unknown[][] = [];
      const query = makeQuery(
        [[v1Row({ scope: 'openid', uid: UID_B })]],
        { openid: 2 },
        upserts
      );
      const startCursor: Cursor = {
        uid: UID_A,
        scope: 'profile',
        service: 'sync',
        clientId: CLIENT,
      };

      await run(query, log, {
        dryRun: false,
        batchSize: 10,
        batchDelayMs: 0,
        startCursor,
      });

      // The token, not the raw Cursor — it says which chunk this log covers and
      // is the value that goes back into --resume-from.
      expect(log.info).toHaveBeenCalledWith(
        'backfill_v2.start',
        expect.objectContaining({ startCursor: encodeCursor(startCursor) })
      );
    });

    it('logs an undefined startCursor on the start log when beginning at page one', async () => {
      const upserts: unknown[][] = [];
      const query = makeQuery(
        [[v1Row({ scope: 'profile' })]],
        { profile: 3 },
        upserts
      );

      await run(query, log, { dryRun: false, batchSize: 10, batchDelayMs: 0 });

      expect(log.info).toHaveBeenCalledWith(
        'backfill_v2.start',
        expect.objectContaining({ startCursor: undefined })
      );
    });

    it('logs a resume cursor per batch that decodes to that batch last row', async () => {
      const upserts: unknown[][] = [];
      const query = makeQuery(
        [[v1Row({ scope: 'profile' }), v1Row({ scope: 'openid', uid: UID_B })]],
        { profile: 3, openid: 2 },
        upserts
      );

      await run(query, log, { dryRun: false, batchSize: 10, batchDelayMs: 0 });

      const batchLog = log.info.mock.calls.find(
        ([op]) => op === 'backfill_v2.batch'
      );
      const { cursor } = (batchLog as NonNullable<typeof batchLog>)[1] as {
        cursor: string;
      };
      expect(decodeCursor(cursor)).toEqual<Cursor>({
        uid: UID_B,
        scope: 'openid',
        service: '',
        clientId: CLIENT,
      });
    });
  });
});
