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
        'WHERE (uid, scope, service, clientId) > (?, ?, ?, ?)'
      );
      expect(params).toEqual([UID_A, 'profile', 'sync', CLIENT, 500]);
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
      // Second fetch carries the keyset cursor tuple (uid, scope, service, clientId, limit).
      expect(fetchCalls[1][1]).toHaveLength(5);
      expect(log.info).toHaveBeenCalledWith(
        'backfill_v2.complete',
        expect.objectContaining({ totalScanned: 3, totalV2Written: 3 })
      );
    });
  });
});
