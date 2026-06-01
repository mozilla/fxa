/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { StatsD } from 'hot-shots';

import {
  ServiceConfig,
  UpsertRow,
  buildServiceConfig,
  inferServiceForToken,
  resolveTargetRows,
  batchUpsert,
  fetchBatch,
  estimateTotalTokens,
  withRetry,
  run,
} from './backfill-account-authorizations';

const VPN_SCOPE = 'https://identity.mozilla.com/apps/vpn';
const SMARTWINDOW_SCOPE = 'https://identity.mozilla.com/apps/smartwindow';
const RELAY_SCOPE = 'https://identity.mozilla.com/apps/relay';
const SYNC_SCOPE = 'https://identity.mozilla.com/apps/oldsync';

const VPN_ALLOWED_CLIENT_ID = '1111222233334444';
const VPN_OTHER_CLIENT_ID = '9999888877776666';
const SMART_CLIENT_ID = 'abababababababab';

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

function defaultCfg(
  overrides: {
    scopes?: Record<string, string>;
    allowed?: Record<string, string[]>;
  } = {}
): ServiceConfig {
  return buildServiceConfig(
    overrides.scopes ?? {
      vpn: VPN_SCOPE,
      smartwindow: SMARTWINDOW_SCOPE,
      relay: RELAY_SCOPE,
      sync: SYNC_SCOPE,
    },
    overrides.allowed ?? { vpn: [VPN_ALLOWED_CLIENT_ID] }
  );
}

function makeToken(
  overrides: Partial<{
    userId: Buffer;
    clientId: Buffer;
    scope: string;
    createdAt: Date;
    token: Buffer;
  }> = {}
) {
  return {
    token: Buffer.alloc(32, 0x01),
    userId: Buffer.alloc(16, 0xaa),
    clientId: Buffer.from(VPN_ALLOWED_CLIENT_ID, 'hex'),
    scope: VPN_SCOPE,
    createdAt: new Date(1000),
    ...overrides,
  };
}

describe('buildServiceConfig', () => {
  it('builds inverse scope→service map', () => {
    const cfg = defaultCfg();
    expect(cfg.scopeToService.get(VPN_SCOPE)).toBe('vpn');
    expect(cfg.scopeToService.get(SMARTWINDOW_SCOPE)).toBe('smartwindow');
  });

  it('lowercases clientIds in the allowlist', () => {
    const cfg = buildServiceConfig(
      { vpn: VPN_SCOPE },
      { vpn: ['ABCDEF0011223344'] }
    );
    expect(cfg.allowedClients.get('vpn')?.has('abcdef0011223344')).toBe(true);
  });

  it('omits services with no allowlist entry (unrestricted)', () => {
    const cfg = defaultCfg();
    expect(cfg.allowedClients.has('smartwindow')).toBe(false);
  });
});

describe('inferServiceForToken', () => {
  const scopeMap = defaultCfg().scopeToService;

  it('returns "" when no scope matches a configured service URL', () => {
    expect(inferServiceForToken(['openid', 'profile'], scopeMap)).toBe('');
  });

  it('returns the service when exactly one scope matches a service URL', () => {
    expect(inferServiceForToken([VPN_SCOPE, 'profile'], scopeMap)).toBe('vpn');
  });

  it('returns "" when two scopes match service URLs (ambiguous)', () => {
    expect(inferServiceForToken([VPN_SCOPE, SMARTWINDOW_SCOPE], scopeMap)).toBe(
      ''
    );
  });

  it('returns "" for an empty scope list', () => {
    expect(inferServiceForToken([], scopeMap)).toBe('');
  });
});

describe('resolveTargetRows', () => {
  it('returns a single row for a token with one service scope and allowlisted clientId', () => {
    const result = resolveTargetRows(makeToken(), defaultCfg());
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toMatchObject({
      service: 'vpn',
      scope: VPN_SCOPE,
    });
    expect(result.allowlistDenied).toEqual([]);
  });

  it('emits rows with service="" for a token whose scopes match two service URLs (ambiguous)', () => {
    // Two service-scope URLs is the runtime's "inferred.length !== 1" branch:
    // serviceValue stays '' and every row inherits service=''. Skipping --service
    // (no filter) ensures the rows are still emitted, just with service=''.
    const result = resolveTargetRows(
      makeToken({
        scope: `${VPN_SCOPE} ${SMARTWINDOW_SCOPE}`,
        clientId: Buffer.from(VPN_ALLOWED_CLIENT_ID, 'hex'),
      }),
      defaultCfg()
    );
    expect(result.rows).toHaveLength(2);
    expect(result.rows.every((r) => r.service === '')).toBe(true);
  });

  it('records all scopes with service="" for a token whose scopes match no service URL', () => {
    const result = resolveTargetRows(
      makeToken({ scope: 'profile openid' }),
      defaultCfg()
    );
    expect(result.rows).toHaveLength(2);
    expect(result.rows.every((r) => r.service === '')).toBe(true);
    expect(result.allowlistDenied).toEqual([]);
  });

  it('attributes every scope on the token to the single inferred service', () => {
    // Runtime semantics: a request with scope='profile <vpn-scope-url> openid'
    // infers serviceValue='vpn' (one scope matches the vpn URL) and writes
    // every row with service='vpn' — profile and openid inherit the request's
    // service.
    const result = resolveTargetRows(
      makeToken({ scope: `profile ${VPN_SCOPE} openid` }),
      defaultCfg()
    );
    expect(result.rows).toHaveLength(3);
    expect(result.rows.every((r) => r.service === 'vpn')).toBe(true);
    expect(result.rows.map((r) => r.scope).sort()).toEqual(
      [VPN_SCOPE, 'openid', 'profile'].sort()
    );
  });

  it('rejects a token whose clientId is not in allowedClientsForService', () => {
    const result = resolveTargetRows(
      makeToken({ clientId: Buffer.from(VPN_OTHER_CLIENT_ID, 'hex') }),
      defaultCfg()
    );
    expect(result.rows).toHaveLength(0);
    expect(result.allowlistDenied).toEqual(['vpn']);
  });

  it('allows any clientId for services with no allowlist entry', () => {
    const result = resolveTargetRows(
      makeToken({
        clientId: Buffer.from(SMART_CLIENT_ID, 'hex'),
        scope: SMARTWINDOW_SCOPE,
      }),
      defaultCfg()
    );
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].service).toBe('smartwindow');
  });

  it('carries the token clientId through to each row', () => {
    const clientId = Buffer.from(VPN_ALLOWED_CLIENT_ID, 'hex');
    const result = resolveTargetRows(makeToken({ clientId }), defaultCfg());
    expect(result.rows[0].clientId).toEqual(clientId);
  });

  it('sets firstAuthorizedTosAt and lastAuthorizedTosAt to token.createdAt.getTime()', () => {
    const createdAt = new Date('2024-06-15T12:00:00Z');
    const result = resolveTargetRows(makeToken({ createdAt }), defaultCfg());
    expect(result.rows[0].firstAuthorizedTosAt).toBe(createdAt.getTime());
    expect(result.rows[0].lastAuthorizedTosAt).toBe(createdAt.getTime());
  });

  it('honors --service filter, dropping tokens whose inferred service does not match', () => {
    // Smartwindow token + --service vpn → inferred='smartwindow' ≠ 'vpn' →
    // whole token skipped, no rows emitted.
    const result = resolveTargetRows(
      makeToken({
        scope: SMARTWINDOW_SCOPE,
        clientId: Buffer.from(SMART_CLIENT_ID, 'hex'),
      }),
      defaultCfg(),
      'vpn'
    );
    expect(result.rows).toHaveLength(0);
    expect(result.allowlistDenied).toEqual([]);
  });

  it('--service filter keeps all scopes on a matching token (including non-service scopes)', () => {
    // VPN client signed in with vpn-scope-url + profile + openid →
    // inferred='vpn' matches filter → all three scopes emitted with
    // service='vpn'. profile and openid are NOT dropped — they inherit
    // the request's service like runtime would write them.
    const result = resolveTargetRows(
      makeToken({
        scope: `profile ${VPN_SCOPE} openid`,
        clientId: Buffer.from(VPN_ALLOWED_CLIENT_ID, 'hex'),
      }),
      defaultCfg(),
      'vpn'
    );
    expect(result.rows).toHaveLength(3);
    expect(result.rows.every((r) => r.service === 'vpn')).toBe(true);
  });

  it('--service filter drops tokens whose inferred service is ""', () => {
    // 123done-style token + --service vpn → inferred='' ≠ 'vpn' → skip.
    const result = resolveTargetRows(
      makeToken({
        scope: 'openid profile',
        clientId: Buffer.from('dcdb5ae7add825d2', 'hex'),
      }),
      defaultCfg(),
      'vpn'
    );
    expect(result.rows).toHaveLength(0);
  });

  it('produces rows for every configured service by default (no default skip)', () => {
    const allowedClient = Buffer.from(VPN_ALLOWED_CLIENT_ID, 'hex');
    const relayResult = resolveTargetRows(
      makeToken({ scope: RELAY_SCOPE, clientId: allowedClient }),
      defaultCfg()
    );
    expect(relayResult.rows.map((r) => r.service)).toEqual(['relay']);

    const syncResult = resolveTargetRows(
      makeToken({ scope: SYNC_SCOPE, clientId: allowedClient }),
      defaultCfg()
    );
    expect(syncResult.rows.map((r) => r.service)).toEqual(['sync']);
  });

  it('does not claim service ownership for a scope that is a prefix of a service scope', () => {
    const result = resolveTargetRows(
      makeToken({ scope: 'https://identity.mozilla.com/apps/vp' }),
      defaultCfg()
    );
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].service).toBe('');
    expect(result.rows[0].scope).toBe('https://identity.mozilla.com/apps/vp');
  });

  it('does not claim service ownership for a scope that has the service scope as a prefix', () => {
    const result = resolveTargetRows(
      makeToken({ scope: `${VPN_SCOPE}-extra` }),
      defaultCfg()
    );
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].service).toBe('');
    expect(result.rows[0].scope).toBe(`${VPN_SCOPE}-extra`);
  });

  it('returns no rows for an empty scope string', () => {
    const result = resolveTargetRows(makeToken({ scope: '' }), defaultCfg());
    expect(result.rows).toHaveLength(0);
  });

  it('123done-style: openid+profile token with no service produces two service="" rows', () => {
    const result = resolveTargetRows(
      makeToken({
        scope: 'openid profile',
        clientId: Buffer.from('dcdb5ae7add825d2', 'hex'), // arbitrary RP, no allowlist
      }),
      defaultCfg()
    );
    expect(result.rows).toHaveLength(2);
    expect(result.rows.every((r) => r.service === '')).toBe(true);
    expect(result.allowlistDenied).toEqual([]);
  });
});

describe('withRetry', () => {
  function retryCtx(overrides: { attempts?: number } = {}) {
    return {
      opName: 'test',
      attempts: overrides.attempts ?? 3,
      initialDelayMs: 1,
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
    const transient = Object.assign(new Error('reset'), { code: 'ECONNRESET' });
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
    const fatal = new Error('syntax error');
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

describe('batchUpsert', () => {
  const uid = Buffer.alloc(16, 0xaa);
  const clientId = Buffer.from(VPN_ALLOWED_CLIENT_ID, 'hex');

  it('does nothing and does not call query when rows is empty', async () => {
    const query = makeQuery();
    await batchUpsert(query, []);
    expect(query).not.toHaveBeenCalled();
  });

  it('inserts all six columns in order for a single row', async () => {
    const query = makeQuery();
    const row: UpsertRow = {
      uid,
      scope: VPN_SCOPE,
      service: 'vpn',
      clientId,
      firstAuthorizedTosAt: 1000,
      lastAuthorizedTosAt: 1000,
    };
    await batchUpsert(query, [row]);
    expect(query).toHaveBeenCalledTimes(1);
    const [sql, values] = query.mock.calls[0];
    expect(sql).toContain('INSERT INTO accountAuthorizations');
    expect(sql).toContain(
      '(uid, scope, service, clientId, firstAuthorizedTosAt, lastAuthorizedTosAt)'
    );
    expect(values).toEqual([uid, VPN_SCOPE, 'vpn', clientId, 1000, 1000]);
  });

  it('builds one 6-placeholder group per row', async () => {
    const query = makeQuery();
    const rows: UpsertRow[] = [
      {
        uid: Buffer.alloc(16, 0x01),
        scope: VPN_SCOPE,
        service: 'vpn',
        clientId,
        firstAuthorizedTosAt: 1000,
        lastAuthorizedTosAt: 1000,
      },
      {
        uid: Buffer.alloc(16, 0x02),
        scope: SMARTWINDOW_SCOPE,
        service: 'smartwindow',
        clientId,
        firstAuthorizedTosAt: 2000,
        lastAuthorizedTosAt: 2000,
      },
    ];
    await batchUpsert(query, rows);
    const [sql, values] = query.mock.calls[0];
    expect((sql.match(/\(\?, \?, \?, \?, \?, \?\)/g) ?? []).length).toBe(2);
    expect(values).toHaveLength(12);
  });

  it('uses LEAST for firstAuthorizedTosAt and GREATEST for lastAuthorizedTosAt', async () => {
    const query = makeQuery();
    await batchUpsert(query, [
      {
        uid,
        scope: VPN_SCOPE,
        service: 'vpn',
        clientId,
        firstAuthorizedTosAt: 1000,
        lastAuthorizedTosAt: 1000,
      },
    ]);
    const [sql] = query.mock.calls[0];
    expect(sql).toContain('LEAST(firstAuthorizedTosAt');
    expect(sql).toContain('GREATEST(lastAuthorizedTosAt');
  });
});

describe('fetchBatch', () => {
  const cursor = Buffer.alloc(32, 0x00);

  it('uses an exclusive lower bound (token > cursor)', async () => {
    const query = makeQuery([]);
    await fetchBatch(query, cursor, 50);
    const [sql] = query.mock.calls[0];
    expect(sql).toContain('token > ?');
  });

  it('passes batchSize as the LIMIT parameter', async () => {
    const query = makeQuery([]);
    await fetchBatch(query, cursor, 250);
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

describe('run', () => {
  const cfg = defaultCfg();

  const baseOpts = {
    dryRun: false,
    batchSize: 100,
    batchDelayMs: 0,
    retryInitialDelayMs: 1,
  };

  it('completes cleanly when the table is empty', async () => {
    const log = makeLog();
    const query = jest
      .fn()
      .mockResolvedValueOnce([{ TABLE_ROWS: 0 }])
      .mockResolvedValueOnce([]);
    await run(query, cfg, log, baseOpts);
    expect(log.info).toHaveBeenCalledWith(
      'backfill.complete',
      expect.objectContaining({ tokensScanned: 0, upsertsAttempted: 0 })
    );
  });

  it('does not call INSERT when dryRun is true', async () => {
    const log = makeLog();
    const query = jest
      .fn()
      .mockResolvedValueOnce([{ TABLE_ROWS: 1 }])
      .mockResolvedValueOnce([makeToken()]);
    await run(query, cfg, log, { ...baseOpts, dryRun: true });
    const insertCalls = query.mock.calls.filter(([sql]) =>
      sql?.includes?.('INSERT INTO')
    );
    expect(insertCalls).toHaveLength(0);
  });

  it('calls INSERT when dryRun is false and a token matches', async () => {
    const log = makeLog();
    const query = jest
      .fn()
      .mockResolvedValueOnce([{ TABLE_ROWS: 1 }])
      .mockResolvedValueOnce([makeToken()])
      .mockResolvedValueOnce(undefined);
    await run(query, cfg, log, baseOpts);
    const insertCalls = query.mock.calls.filter(([sql]) =>
      sql?.includes?.('INSERT INTO accountAuthorizations')
    );
    expect(insertCalls).toHaveLength(1);
  });

  it('warns when no rows are upserted and dryRun is false', async () => {
    const log = makeLog();
    // Empty scope produces no rows; without --service we'd otherwise emit
    // a row for every scope (including service='') so an "empty scope"
    // token is what actually exercises the no-rows-upserted warn path.
    const query = jest
      .fn()
      .mockResolvedValueOnce([{ TABLE_ROWS: 1 }])
      .mockResolvedValueOnce([makeToken({ scope: '' })]);
    await run(query, cfg, log, baseOpts);
    expect(log.warn).toHaveBeenCalledWith(
      'backfill.no_rows_upserted',
      expect.any(Object)
    );
  });

  it('does not warn about zero upserts when dryRun is true', async () => {
    const log = makeLog();
    const query = jest
      .fn()
      .mockResolvedValueOnce([{ TABLE_ROWS: 1 }])
      .mockResolvedValueOnce([makeToken({ scope: '' })]);
    await run(query, cfg, log, { ...baseOpts, dryRun: true });
    expect(log.warn).not.toHaveBeenCalledWith(
      'backfill.no_rows_upserted',
      expect.any(Object)
    );
  });

  it('logs per-service counts in backfill.complete', async () => {
    const log = makeLog();
    const query = jest
      .fn()
      .mockResolvedValueOnce([{ TABLE_ROWS: 1 }])
      .mockResolvedValueOnce([makeToken()])
      .mockResolvedValueOnce(undefined);
    await run(query, cfg, log, baseOpts);
    expect(log.info).toHaveBeenCalledWith(
      'backfill.complete',
      expect.objectContaining({
        countsByService: expect.objectContaining({ vpn: 1 }),
        upsertsAttempted: 1,
      })
    );
  });

  it('continues fetching until a partial batch ends the loop', async () => {
    const log = makeLog();
    const opts = { ...baseOpts, batchSize: 2 };
    const fullBatch = [
      makeToken({ token: Buffer.alloc(32, 0x01) }),
      makeToken({ token: Buffer.alloc(32, 0x02) }),
    ];
    // Second batch returns rows.length < batchSize, which is what stops
    // the loop — there's no third fetch mocked because the early-break in
    // run() fires before another fetch is issued.
    const partialBatch = [makeToken({ token: Buffer.alloc(32, 0x03) })];
    const query = jest
      .fn()
      .mockResolvedValueOnce([{ TABLE_ROWS: 3 }])
      .mockResolvedValueOnce(fullBatch)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(partialBatch)
      .mockResolvedValueOnce(undefined);
    await run(query, cfg, log, opts);

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

  it('advances the cursor between batches using the last token of the previous batch', async () => {
    const log = makeLog();
    const opts = { ...baseOpts, batchSize: 1 };
    const firstToken = Buffer.alloc(32, 0x11);
    const secondToken = Buffer.alloc(32, 0x22);
    const query = jest
      .fn()
      .mockResolvedValueOnce([{ TABLE_ROWS: 2 }])
      .mockResolvedValueOnce([makeToken({ token: firstToken })])
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([makeToken({ token: secondToken })])
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([]);
    await run(query, cfg, log, opts);

    const fetchCalls = query.mock.calls.filter(([sql]) =>
      sql?.includes?.('FROM refreshTokens')
    );
    expect(fetchCalls.length).toBeGreaterThanOrEqual(2);
    const secondFetchCursor = fetchCalls[1][1][0];
    expect(secondFetchCursor).toEqual(firstToken);
  });

  it('propagates batchUpsert errors and logs upsert_batch_failed', async () => {
    const log = makeLog();
    const upsertError = new Error('connection lost');
    const query = jest
      .fn()
      .mockResolvedValueOnce([{ TABLE_ROWS: 1 }])
      .mockResolvedValueOnce([makeToken()])
      .mockRejectedValueOnce(upsertError);

    await expect(run(query, cfg, log, baseOpts)).rejects.toThrow(
      'connection lost'
    );
    expect(log.error).toHaveBeenCalledWith(
      'backfill.upsert_batch_failed',
      expect.objectContaining({ err: 'connection lost' })
    );
  });

  it('retries batchUpsert on a transient error and succeeds', async () => {
    const log = makeLog();
    const transient = Object.assign(new Error('reset'), { code: 'ECONNRESET' });
    const query = jest
      .fn()
      .mockResolvedValueOnce([{ TABLE_ROWS: 1 }])
      .mockResolvedValueOnce([makeToken()])
      .mockRejectedValueOnce(transient)
      .mockResolvedValueOnce(undefined);

    await run(query, cfg, log, {
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

  it('counts and emits a stat when a token is denied by the allowlist gate', async () => {
    const log = makeLog();
    const statsd: Pick<StatsD, 'increment' | 'timing'> = {
      increment: jest.fn() as unknown as StatsD['increment'],
      timing: jest.fn() as unknown as StatsD['timing'],
    };
    const deniedToken = makeToken({
      clientId: Buffer.from(VPN_OTHER_CLIENT_ID, 'hex'),
    });
    const query = jest
      .fn()
      .mockResolvedValueOnce([{ TABLE_ROWS: 1 }])
      .mockResolvedValueOnce([deniedToken]);
    await run(query, cfg, log, {
      ...baseOpts,
      statsd: statsd as unknown as StatsD,
    });
    // statsd increments are aggregated per batch — one call carrying the
    // count rather than one call per skipped token.
    expect(statsd.increment).toHaveBeenCalledWith(
      'account_authz.backfill.tokens_skipped',
      1,
      { reason: 'client_not_allowed' }
    );
  });
});
