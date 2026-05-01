/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as fs from 'fs';

jest.mock('fs');

import {
  BrowserServiceConfig,
  ResolvedService,
  ServiceIndexes,
  UpsertRow,
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
} from './backfill-account-authorizations';
import { SERVICE_AMBIGUOUS_CLIENT_IDS } from '../../lib/oauth/browser-services';

const RELAY_SCOPE = 'https://identity.mozilla.com/apps/relay';
const VPN_SCOPE = 'https://identity.mozilla.com/apps/vpn';
const RELAY_CLIENT_ID = 'aabbccdd11223344';
const VPN_CLIENT_ID = 'deadbeef12345678';

function makeServiceConfig(
  overrides: Partial<BrowserServiceConfig> = {}
): BrowserServiceConfig {
  return {
    displayName: 'Test Service',
    authorizationScope: RELAY_SCOPE,
    clientIds: [RELAY_CLIENT_ID],
    serviceParams: [],
    retentionDays: 365,
    allowSilentExchange: false,
    ...overrides,
  };
}

function makeLog() {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  };
}

function makeQuery(results: any[] = []) {
  return jest.fn().mockResolvedValue(results);
}

describe('resolveServices', () => {
  const rawConfig = {
    relay: makeServiceConfig({
      authorizationScope: RELAY_SCOPE,
      clientIds: [RELAY_CLIENT_ID],
    }),
    vpn: makeServiceConfig({
      displayName: 'VPN',
      authorizationScope: VPN_SCOPE,
      clientIds: [VPN_CLIENT_ID],
    }),
  };

  it('returns all services from the config', () => {
    const services = resolveServices(rawConfig);
    expect(services).toHaveLength(2);
    expect(services.map((s) => s.name)).toEqual(['relay', 'vpn']);
  });

  it('throws when the config has no services', () => {
    expect(() => resolveServices({})).toThrow(
      'browserServices config is empty'
    );
  });
});

describe('buildResolvedService', () => {
  it('maps name and authorizationScope from config', () => {
    const svc = buildResolvedService('relay', makeServiceConfig());
    expect(svc.name).toBe('relay');
    expect(svc.authorizationScope).toBe(RELAY_SCOPE);
  });

  it('lowercases all clientIds for case-insensitive lookup', () => {
    const svc = buildResolvedService(
      'relay',
      makeServiceConfig({ clientIds: ['AABBCCDD11223344', 'DeAdBeEf'] })
    );
    expect(svc.clientIdSet.has('aabbccdd11223344')).toBe(true);
    expect(svc.clientIdSet.has('deadbeef')).toBe(true);
    expect(svc.clientIdSet.has('AABBCCDD11223344')).toBe(false);
  });

  it('handles an empty clientIds array', () => {
    const svc = buildResolvedService(
      'relay',
      makeServiceConfig({ clientIds: [] })
    );
    expect(svc.clientIdSet.size).toBe(0);
  });

  it('handles a missing clientIds field gracefully', () => {
    const cfg = makeServiceConfig();
    delete (cfg as any).clientIds;
    const svc = buildResolvedService('relay', cfg);
    expect(svc.clientIdSet.size).toBe(0);
  });
});

describe('findMatchingServices', () => {
  // Pull the ambiguous clientId from the canonical source so this drifts when
  // the runtime set changes.
  const FIREFOX_DESKTOP_CLIENT_ID = [...SERVICE_AMBIGUOUS_CLIENT_IDS][0];
  const SHARED_CLIENT_ID = 'cafef00d11223344'; // present in both relay AND vpn

  const relayService: ResolvedService = {
    name: 'relay',
    authorizationScope: RELAY_SCOPE,
    clientIdSet: new Set([RELAY_CLIENT_ID, SHARED_CLIENT_ID]),
  };
  const vpnService: ResolvedService = {
    name: 'vpn',
    authorizationScope: VPN_SCOPE,
    clientIdSet: new Set([VPN_CLIENT_ID, SHARED_CLIENT_ID]),
  };
  const indexes = buildServiceIndexes([relayService, vpnService]);

  it('matches scope+clientId when both align', () => {
    const clientId = Buffer.from(RELAY_CLIENT_ID, 'hex');
    const result = findMatchingServices(clientId, RELAY_SCOPE, indexes);
    expect(result.matches.map((s) => s.name)).toEqual(['relay']);
    expect(result.isAmbiguous).toBe(false);
  });

  it('rejects scope-only match when clientId is not a minter for that service', () => {
    const unknownClientId = Buffer.from('aaaa000000000000', 'hex');
    const result = findMatchingServices(unknownClientId, RELAY_SCOPE, indexes);
    expect(result.matches).toHaveLength(0);
  });

  it('falls back to clientId-only when scope does not match and clientId maps to a single service', () => {
    const clientId = Buffer.from(RELAY_CLIENT_ID, 'hex');
    const result = findMatchingServices(clientId, 'profile', indexes);
    expect(result.matches.map((s) => s.name)).toEqual(['relay']);
  });

  it('does not fall back to clientId-only when clientId maps to multiple services', () => {
    const sharedClientId = Buffer.from(SHARED_CLIENT_ID, 'hex');
    const result = findMatchingServices(sharedClientId, 'profile', indexes);
    expect(result.matches).toHaveLength(0);
  });

  it('matches multiple services when token has multiple matching scopes AND clientId mints all of them', () => {
    const sharedClientId = Buffer.from(SHARED_CLIENT_ID, 'hex');
    const result = findMatchingServices(
      sharedClientId,
      `${RELAY_SCOPE} ${VPN_SCOPE}`,
      indexes
    );
    expect(result.matches.map((s) => s.name).sort()).toEqual(['relay', 'vpn']);
  });

  it('only matches the service for which clientId mints when token has multiple service scopes', () => {
    const relayOnlyClientId = Buffer.from(RELAY_CLIENT_ID, 'hex');
    const result = findMatchingServices(
      relayOnlyClientId,
      `${RELAY_SCOPE} ${VPN_SCOPE}`,
      indexes
    );
    expect(result.matches.map((s) => s.name)).toEqual(['relay']);
  });

  it('matches scope when scope appears in a space-separated scope string', () => {
    const clientId = Buffer.from(RELAY_CLIENT_ID, 'hex');
    const result = findMatchingServices(
      clientId,
      `profile ${RELAY_SCOPE} openid`,
      indexes
    );
    expect(result.matches.map((s) => s.name)).toEqual(['relay']);
  });

  it('does not match a scope that is a prefix of a service scope', () => {
    const unknownClientId = Buffer.from('aaaa000000000000', 'hex');
    const result = findMatchingServices(
      unknownClientId,
      'https://identity.mozilla.com/apps/rela',
      indexes
    );
    expect(result.matches).toHaveLength(0);
  });

  it('does not match a scope that has the service scope as a prefix', () => {
    const unknownClientId = Buffer.from('aaaa000000000000', 'hex');
    const result = findMatchingServices(
      unknownClientId,
      `${RELAY_SCOPE}-extra`,
      indexes
    );
    expect(result.matches).toHaveLength(0);
  });

  it('returns no matches for empty scope and unknown clientId', () => {
    const unknownClientId = Buffer.from('aaaa000000000000', 'hex');
    const result = findMatchingServices(unknownClientId, '', indexes);
    expect(result.matches).toHaveLength(0);
    expect(result.isAmbiguous).toBe(false);
  });

  it('is case-insensitive for clientId matching', () => {
    const upperHex = RELAY_CLIENT_ID.toUpperCase();
    const clientId = Buffer.from(upperHex, 'hex');
    const result = findMatchingServices(clientId, RELAY_SCOPE, indexes);
    expect(result.matches.map((s) => s.name)).toEqual(['relay']);
  });

  it('flags Firefox Desktop as ambiguous and skips clientId-only fallback', () => {
    const ambiguousClientId = Buffer.from(FIREFOX_DESKTOP_CLIENT_ID, 'hex');
    // Add Firefox Desktop to relay's clientIds so scope+clientId could match.
    const relayWithDesktop: ResolvedService = {
      ...relayService,
      clientIdSet: new Set([
        ...relayService.clientIdSet,
        FIREFOX_DESKTOP_CLIENT_ID,
      ]),
    };
    const idxWithDesktop = buildServiceIndexes([relayWithDesktop, vpnService]);

    // No scope match → no clientId fallback either.
    const noScope = findMatchingServices(
      ambiguousClientId,
      'profile',
      idxWithDesktop
    );
    expect(noScope.matches).toHaveLength(0);
    expect(noScope.isAmbiguous).toBe(true);

    // Scope+clientId match still works for ambiguous clientIds.
    const withScope = findMatchingServices(
      ambiguousClientId,
      RELAY_SCOPE,
      idxWithDesktop
    );
    expect(withScope.matches.map((s) => s.name)).toEqual(['relay']);
    expect(withScope.isAmbiguous).toBe(true);
  });
});

describe('buildServiceIndexes', () => {
  const relayService: ResolvedService = {
    name: 'relay',
    authorizationScope: RELAY_SCOPE,
    clientIdSet: new Set([RELAY_CLIENT_ID, 'aabbccdd00000001']),
  };
  const vpnService: ResolvedService = {
    name: 'vpn',
    authorizationScope: VPN_SCOPE,
    clientIdSet: new Set([VPN_CLIENT_ID, 'aabbccdd00000001']),
  };

  it('indexes services by name, scope, and clientId', () => {
    const idx = buildServiceIndexes([relayService, vpnService]);
    expect(idx.byName.get('relay')).toBe(relayService);
    expect(idx.scopeIdx.get(RELAY_SCOPE)).toBe('relay');
    expect(idx.scopeIdx.get(VPN_SCOPE)).toBe('vpn');
    expect(idx.clientIdIdx.get(RELAY_CLIENT_ID)).toEqual(['relay']);
  });

  it('records all services that share a clientId', () => {
    const idx = buildServiceIndexes([relayService, vpnService]);
    expect(idx.clientIdIdx.get('aabbccdd00000001')?.sort()).toEqual([
      'relay',
      'vpn',
    ]);
  });
});

describe('parseCursorHex', () => {
  const validHex = 'a'.repeat(64);

  it('returns a 32-byte Buffer for valid 64-char hex', () => {
    const buf = parseCursorHex('start-cursor', validHex);
    expect(buf).toHaveLength(32);
    expect(buf.toString('hex')).toBe(validHex);
  });

  it('accepts upper-case hex', () => {
    const buf = parseCursorHex('start-cursor', validHex.toUpperCase());
    expect(buf).toHaveLength(32);
  });

  it('throws when hex is shorter than 64 chars', () => {
    expect(() => parseCursorHex('start-cursor', 'a'.repeat(63))).toThrow(
      'must be exactly 64 hex chars'
    );
  });

  it('throws when hex is longer than 64 chars', () => {
    expect(() => parseCursorHex('start-cursor', 'a'.repeat(65))).toThrow(
      'must be exactly 64 hex chars'
    );
  });

  it('throws when input contains non-hex characters', () => {
    const bad = 'g'.repeat(64);
    expect(() => parseCursorHex('start-cursor', bad)).toThrow(
      'must be exactly 64 hex chars'
    );
  });

  it('includes the flag name in the error message', () => {
    expect(() => parseCursorHex('end-cursor', '')).toThrow('--end-cursor');
  });
});

describe('workerCursors', () => {
  it('worker 0 starts at all-zero buffer', () => {
    const { startCursor } = workerCursors(0, 4);
    expect(startCursor).toEqual(Buffer.alloc(32, 0));
  });

  it('last worker ends at all-0xFF buffer', () => {
    const { endCursor } = workerCursors(3, 4);
    expect(endCursor).toEqual(Buffer.alloc(32, 0xff));
  });

  it('adjacent workers cover the full keyspace without gaps', () => {
    const workerCount = 4;
    for (let i = 0; i < workerCount - 1; i++) {
      const { endCursor } = workerCursors(i, workerCount);
      const { startCursor } = workerCursors(i + 1, workerCount);
      // worker N's endCursor is the exclusive lower bound for worker N+1:
      // startCursor[1..] is 0xFF and startCursor[0] == endCursor[0]
      expect(startCursor[0]).toBe(endCursor[0]);
      expect(startCursor.subarray(1)).toEqual(Buffer.alloc(31, 0xff));
    }
  });

  it('throws when workerIndex equals workerCount', () => {
    expect(() => workerCursors(4, 4)).toThrow('--worker-index must be 0');
  });

  it('throws when workerIndex is negative', () => {
    expect(() => workerCursors(-1, 4)).toThrow('--worker-index must be 0');
  });

  it('throws when workerCount is 0', () => {
    expect(() => workerCursors(0, 0)).toThrow('--worker-count must be');
  });

  it('throws when workerCount exceeds 256', () => {
    expect(() => workerCursors(0, 257)).toThrow('--worker-count must be');
  });

  it('throws when workerCount is not an integer', () => {
    expect(() => workerCursors(0, 1.5)).toThrow('--worker-count must be');
  });

  it('throws when workerIndex is not an integer', () => {
    expect(() => workerCursors(1.5, 4)).toThrow('--worker-index must be 0');
  });

  it('returns 32-byte buffers for both cursors', () => {
    const { startCursor, endCursor } = workerCursors(2, 8);
    expect(startCursor).toHaveLength(32);
    expect(endCursor).toHaveLength(32);
  });

  it('works for a single worker (workerCount = 1)', () => {
    const { startCursor, endCursor } = workerCursors(0, 1);
    expect(startCursor).toEqual(Buffer.alloc(32, 0));
    expect(endCursor).toEqual(Buffer.alloc(32, 0xff));
  });
});

describe('batchUpsert', () => {
  it('does nothing and does not call query when rows is empty', async () => {
    const query = makeQuery();
    await batchUpsert(query, []);
    expect(query).not.toHaveBeenCalled();
  });

  it('calls query with one value group for a single row', async () => {
    const query = makeQuery();
    const uid = Buffer.alloc(16, 0xaa);
    const rows: UpsertRow[] = [
      {
        uid,
        scope: RELAY_SCOPE,
        service: 'relay',
        authorizedAt: 1000,
      },
    ];
    await batchUpsert(query, rows);
    expect(query).toHaveBeenCalledTimes(1);
    const [sql, values] = query.mock.calls[0];
    expect(sql).toContain('INSERT INTO accountAuthorizations');
    expect(sql).toContain('ON DUPLICATE KEY UPDATE');
    expect(values).toEqual([uid, RELAY_SCOPE, 'relay', 1000]);
  });

  it('builds one placeholder group per row for multiple rows', async () => {
    const query = makeQuery();
    const rows: UpsertRow[] = [
      {
        uid: Buffer.alloc(16, 0x01),
        scope: RELAY_SCOPE,
        service: 'relay',
        authorizedAt: 1000,
      },
      {
        uid: Buffer.alloc(16, 0x02),
        scope: VPN_SCOPE,
        service: 'vpn',
        authorizedAt: 3000,
      },
    ];
    await batchUpsert(query, rows);
    const [sql, values] = query.mock.calls[0];
    expect((sql.match(/\(\?, \?, \?, \?\)/g) ?? []).length).toBe(2);
    expect(values).toHaveLength(8);
  });

  it('uses LEAST for authorizedAt in the upsert clause', async () => {
    const query = makeQuery();
    await batchUpsert(query, [
      {
        uid: Buffer.alloc(16),
        scope: RELAY_SCOPE,
        service: 'relay',
        authorizedAt: 1000,
      },
    ]);
    const [sql] = query.mock.calls[0];
    expect(sql).toContain('LEAST(authorizedAt');
  });
});

describe('writeCheckpoint', () => {
  it('writes the cursor as a hex string to the given file path', () => {
    const log = makeLog();
    const cursor = Buffer.from('deadbeef'.padEnd(64, '0'), 'hex');

    writeCheckpoint(cursor, '/tmp/cursor.txt', log);

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      '/tmp/cursor.txt',
      cursor.toString('hex'),
      'utf8'
    );
    expect(log.warn).not.toHaveBeenCalled();
  });

  it('emits a warn log and does not throw when the write fails', () => {
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {
      throw new Error('ENOENT');
    });
    const log = makeLog();
    const cursor = Buffer.alloc(32, 0xab);

    expect(() =>
      writeCheckpoint(cursor, '/no/such/path.txt', log)
    ).not.toThrow();
    expect(log.warn).toHaveBeenCalledWith(
      'backfill.checkpoint.write_failed',
      expect.objectContaining({ filePath: '/no/such/path.txt' })
    );
  });
});

describe('fetchBatch', () => {
  const cursor = Buffer.alloc(32, 0x00);
  const endCursor = Buffer.alloc(32, 0xff);

  it('uses a range query (token <= endCursor) when endCursor is provided', async () => {
    const query = makeQuery([]);
    await fetchBatch(query, cursor, endCursor, 100);
    const [sql, values] = query.mock.calls[0];
    expect(sql).toContain('token <= ?');
    expect(values).toEqual([cursor, endCursor, 100]);
  });

  it('uses an open-ended query when endCursor is null', async () => {
    const query = makeQuery([]);
    await fetchBatch(query, cursor, null, 100);
    const [sql, values] = query.mock.calls[0];
    expect(sql).not.toContain('token <=');
    expect(values).toEqual([cursor, 100]);
  });

  it('always uses an exclusive lower bound (token > cursor)', async () => {
    const query = makeQuery([]);
    await fetchBatch(query, cursor, null, 50);
    const [sql] = query.mock.calls[0];
    expect(sql).toContain('token > ?');
  });

  it('passes batchSize as the LIMIT parameter', async () => {
    const query = makeQuery([]);
    await fetchBatch(query, cursor, null, 250);
    const values = query.mock.calls[0][1];
    expect(values[values.length - 1]).toBe(250);
  });
});

describe('estimateTotalTokens', () => {
  it('returns TABLE_ROWS from information_schema', async () => {
    const query = makeQuery([{ TABLE_ROWS: 42000 }]);
    const total = await estimateTotalTokens(query);
    expect(total).toBe(42000);
  });

  it('returns 0 when the query returns no rows', async () => {
    const query = makeQuery([]);
    const total = await estimateTotalTokens(query);
    expect(total).toBe(0);
  });
});

describe('withRetry', () => {
  function retryCtx(overrides: { attempts?: number } = {}) {
    return {
      opName: 'test',
      attempts: overrides.attempts ?? 3,
      initialDelayMs: 1, // keep tests fast
      log: makeLog(),
    };
  }

  it('returns the value on first success without retrying', async () => {
    const op = jest.fn().mockResolvedValue('ok');
    const result = await withRetry(op, retryCtx());
    expect(result).toBe('ok');
    expect(op).toHaveBeenCalledTimes(1);
  });

  it('retries on a transient error and succeeds on a later attempt', async () => {
    const transient = Object.assign(new Error('reset'), {
      code: 'ECONNRESET',
    });
    const op = jest
      .fn()
      .mockRejectedValueOnce(transient)
      .mockResolvedValue('ok');
    const ctx = retryCtx();
    const result = await withRetry(op, ctx);
    expect(result).toBe('ok');
    expect(op).toHaveBeenCalledTimes(2);
    expect(ctx.log.warn).toHaveBeenCalledWith(
      'backfill.retry',
      expect.objectContaining({ op: 'test', attempt: 1, code: 'ECONNRESET' })
    );
  });

  it('throws after exhausting all attempts', async () => {
    const transient = Object.assign(new Error('timeout'), {
      code: 'ETIMEDOUT',
    });
    const op = jest.fn().mockRejectedValue(transient);
    await expect(withRetry(op, retryCtx({ attempts: 3 }))).rejects.toThrow(
      'timeout'
    );
    expect(op).toHaveBeenCalledTimes(3);
  });

  it('does not retry non-transient errors', async () => {
    const fatal = new Error('syntax error'); // no code
    const op = jest.fn().mockRejectedValue(fatal);
    await expect(withRetry(op, retryCtx())).rejects.toThrow('syntax error');
    expect(op).toHaveBeenCalledTimes(1);
  });

  it('does not retry errors whose code is not in the transient set', async () => {
    const fatal = Object.assign(new Error('access denied'), {
      code: 'ER_ACCESS_DENIED_ERROR',
    });
    const op = jest.fn().mockRejectedValue(fatal);
    await expect(withRetry(op, retryCtx())).rejects.toThrow('access denied');
    expect(op).toHaveBeenCalledTimes(1);
  });
});

describe('run', () => {
  const relayService: ResolvedService = {
    name: 'relay',
    authorizationScope: RELAY_SCOPE,
    clientIdSet: new Set([RELAY_CLIENT_ID]),
  };
  const relayIndexes: ServiceIndexes = buildServiceIndexes([relayService]);

  const baseOpts = {
    dryRun: false,
    batchSize: 100,
    batchDelayMs: 0,
    startCursor: Buffer.alloc(32, 0),
    endCursor: null,
    checkpointFile: '/tmp/test-cursor.txt',
    retryInitialDelayMs: 1, // keep tests fast in case any error path retries
  };

  beforeEach(() => {
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
  });

  function makeTokenRow(
    overrides: Partial<{
      token: Buffer;
      userId: Buffer;
      clientId: Buffer;
      scope: string;
      createdAt: Date;
    }> = {}
  ) {
    return {
      token: Buffer.alloc(32, 0x01),
      userId: Buffer.alloc(16, 0xaa),
      clientId: Buffer.from(RELAY_CLIENT_ID, 'hex'),
      scope: RELAY_SCOPE,
      createdAt: new Date(1000),
      ...overrides,
    };
  }

  it('completes cleanly when the table is empty', async () => {
    const log = makeLog();
    const query = jest
      .fn()
      .mockResolvedValueOnce([{ TABLE_ROWS: 0 }]) // estimateTotalTokens
      .mockResolvedValueOnce([]); // fetchBatch → empty, loop never enters
    await run(query, relayIndexes, log, baseOpts);
    expect(log.info).toHaveBeenCalledWith(
      'backfill.complete',
      expect.objectContaining({ tokensScanned: 0, upsertsAttempted: 0 })
    );
  });

  it('does not call INSERT when dryRun is true', async () => {
    const log = makeLog();
    const tokenRow = makeTokenRow();
    const query = jest
      .fn()
      .mockResolvedValueOnce([{ TABLE_ROWS: 1 }]) // estimateTotalTokens
      .mockResolvedValueOnce([tokenRow]); // fetchBatch → one page
    await run(query, relayIndexes, log, { ...baseOpts, dryRun: true });
    const insertCalls = query.mock.calls.filter(([sql]) =>
      sql?.includes?.('INSERT INTO')
    );
    expect(insertCalls).toHaveLength(0);
  });

  it('calls INSERT when dryRun is false and a token matches', async () => {
    const log = makeLog();
    const tokenRow = makeTokenRow();
    const query = jest
      .fn()
      .mockResolvedValueOnce([{ TABLE_ROWS: 1 }]) // estimateTotalTokens
      .mockResolvedValueOnce([tokenRow]) // fetchBatch → one matching row
      .mockResolvedValueOnce(undefined); // batchUpsert INSERT
    await run(query, relayIndexes, log, baseOpts);
    const insertCalls = query.mock.calls.filter(([sql]) =>
      sql?.includes?.('INSERT INTO accountAuthorizations')
    );
    expect(insertCalls).toHaveLength(1);
  });

  it('warns when no rows are upserted and dryRun is false', async () => {
    const log = makeLog();
    const nonMatchingRow = makeTokenRow({
      clientId: Buffer.alloc(8, 0x00),
      scope: 'profile',
    });
    const query = jest
      .fn()
      .mockResolvedValueOnce([{ TABLE_ROWS: 1 }]) // estimateTotalTokens
      .mockResolvedValueOnce([nonMatchingRow]); // fetchBatch → no match
    await run(query, relayIndexes, log, baseOpts);
    expect(log.warn).toHaveBeenCalledWith(
      'backfill.no_rows_upserted',
      expect.any(Object)
    );
  });

  it('does not warn about zero upserts when dryRun is true', async () => {
    const log = makeLog();
    const nonMatchingRow = makeTokenRow({ scope: 'profile' });
    const query = jest
      .fn()
      .mockResolvedValueOnce([{ TABLE_ROWS: 1 }]) // estimateTotalTokens
      .mockResolvedValueOnce([nonMatchingRow]); // fetchBatch
    await run(query, relayIndexes, log, { ...baseOpts, dryRun: true });
    expect(log.warn).not.toHaveBeenCalledWith(
      'backfill.no_rows_upserted',
      expect.any(Object)
    );
  });

  it('logs per-service counts in backfill.complete', async () => {
    const log = makeLog();
    const tokenRow = makeTokenRow();
    const query = jest
      .fn()
      .mockResolvedValueOnce([{ TABLE_ROWS: 1 }])
      .mockResolvedValueOnce([tokenRow])
      .mockResolvedValueOnce(undefined);
    await run(query, relayIndexes, log, baseOpts);
    expect(log.info).toHaveBeenCalledWith(
      'backfill.complete',
      expect.objectContaining({
        countsByService: { relay: 1 },
        upsertsAttempted: 1,
      })
    );
  });

  it('writes a checkpoint after each batch', async () => {
    const log = makeLog();
    const tokenRow = makeTokenRow({ token: Buffer.alloc(32, 0x42) });
    const query = jest
      .fn()
      .mockResolvedValueOnce([{ TABLE_ROWS: 1 }])
      .mockResolvedValueOnce([tokenRow])
      .mockResolvedValueOnce(undefined);
    await run(query, relayIndexes, log, baseOpts);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      baseOpts.checkpointFile,
      tokenRow.token.toString('hex'),
      'utf8'
    );
  });

  it('continues fetching until a partial batch ends the loop', async () => {
    const log = makeLog();
    const opts = { ...baseOpts, batchSize: 2 };
    // batch 1: 2 rows (full batch — loop continues)
    // batch 2: 1 row (partial — loop exits after this)
    const fullBatch = [
      makeTokenRow({ token: Buffer.alloc(32, 0x01) }),
      makeTokenRow({ token: Buffer.alloc(32, 0x02) }),
    ];
    const partialBatch = [makeTokenRow({ token: Buffer.alloc(32, 0x03) })];
    const query = jest
      .fn()
      .mockResolvedValueOnce([{ TABLE_ROWS: 3 }]) // estimateTotalTokens
      .mockResolvedValueOnce(fullBatch) // fetchBatch #1
      .mockResolvedValueOnce(undefined) // batchUpsert #1
      .mockResolvedValueOnce(partialBatch) // fetchBatch #2
      .mockResolvedValueOnce(undefined); // batchUpsert #2
    await run(query, relayIndexes, log, opts);

    const fetchCalls = query.mock.calls.filter(([sql]) =>
      sql?.includes?.('FROM refreshTokens')
    );
    const insertCalls = query.mock.calls.filter(([sql]) =>
      sql?.includes?.('INSERT INTO accountAuthorizations')
    );
    expect(fetchCalls).toHaveLength(2);
    expect(insertCalls).toHaveLength(2);
    expect(log.info).toHaveBeenCalledWith(
      'backfill.complete',
      expect.objectContaining({ tokensScanned: 3, upsertsAttempted: 3 })
    );
  });

  it('advances the cursor between batches using the last token in the previous batch', async () => {
    const log = makeLog();
    const opts = { ...baseOpts, batchSize: 1 };
    const firstToken = Buffer.alloc(32, 0x11);
    const secondToken = Buffer.alloc(32, 0x22);
    const query = jest
      .fn()
      .mockResolvedValueOnce([{ TABLE_ROWS: 2 }])
      .mockResolvedValueOnce([makeTokenRow({ token: firstToken })])
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([makeTokenRow({ token: secondToken })])
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([]);
    await run(query, relayIndexes, log, opts);

    // Second fetchBatch should be called with the first token as its cursor.
    const fetchCalls = query.mock.calls.filter(([sql]) =>
      sql?.includes?.('FROM refreshTokens')
    );
    expect(fetchCalls.length).toBeGreaterThanOrEqual(2);
    const secondFetchCursor = fetchCalls[1][1][0];
    expect(secondFetchCursor).toEqual(firstToken);
  });

  it('propagates batchUpsert errors and logs upsert_batch_failed', async () => {
    const log = makeLog();
    const tokenRow = makeTokenRow();
    const upsertError = new Error('connection lost');
    const query = jest
      .fn()
      .mockResolvedValueOnce([{ TABLE_ROWS: 1 }])
      .mockResolvedValueOnce([tokenRow])
      .mockRejectedValueOnce(upsertError);

    await expect(run(query, relayIndexes, log, baseOpts)).rejects.toThrow(
      'connection lost'
    );
    expect(log.error).toHaveBeenCalledWith(
      'backfill.upsert_batch_failed',
      expect.objectContaining({ err: 'connection lost' })
    );
  });

  it('retries batchUpsert on a transient error and succeeds', async () => {
    const log = makeLog();
    const tokenRow = makeTokenRow();
    const transient = Object.assign(new Error('reset'), {
      code: 'ECONNRESET',
    });
    const query = jest
      .fn()
      .mockResolvedValueOnce([{ TABLE_ROWS: 1 }]) // estimateTotalTokens
      .mockResolvedValueOnce([tokenRow]) // fetchBatch
      .mockRejectedValueOnce(transient) // batchUpsert (1st attempt) — fail
      .mockResolvedValueOnce(undefined); // batchUpsert (2nd attempt) — succeed

    await run(query, relayIndexes, log, {
      ...baseOpts,
      retryAttempts: 3,
      retryInitialDelayMs: 1,
    });

    const insertCalls = query.mock.calls.filter(([sql]) =>
      sql?.includes?.('INSERT INTO accountAuthorizations')
    );
    expect(insertCalls).toHaveLength(2);
    expect(log.warn).toHaveBeenCalledWith(
      'backfill.retry',
      expect.objectContaining({ op: 'batchUpsert', code: 'ECONNRESET' })
    );
    expect(log.info).toHaveBeenCalledWith(
      'backfill.complete',
      expect.objectContaining({ upsertsAttempted: 1 })
    );
  });
});
