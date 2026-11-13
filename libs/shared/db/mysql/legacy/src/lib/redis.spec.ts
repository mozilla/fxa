/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Redis from 'ioredis';
import type { StatsD } from 'hot-shots';
import type { ILogger } from '@fxa/shared/log';
import { LUA_SCRIPTS } from './lua-scripts';
import { RedisShared, unpackSessionTokens } from './redis';

jest.mock('ioredis', () =>
  jest.fn().mockImplementation(() => {
    const tx = { set: jest.fn(), del: jest.fn(), exec: jest.fn() };
    const pruneClient = {
      on: jest.fn(),
      watch: jest.fn(() => Promise.resolve('OK')),
      unwatch: jest.fn(() => Promise.resolve('OK')),
      get: jest.fn(),
      multi: jest.fn(() => tx),
      quit: jest.fn(() => Promise.resolve('OK')),
      disconnect: jest.fn(),
      tx,
    };
    const redis = {
      on: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(() => Promise.resolve(1)),
      quit: jest.fn(() => Promise.resolve('OK')),
      duplicate: jest.fn(() => pruneClient),
      pruneClient,
      defineCommand: jest.fn((name: string) => {
        (redis as Record<string, unknown>)[name] = jest.fn();
      }),
    };
    return redis;
  })
);

type MockPruneClient = {
  watch: jest.Mock;
  unwatch: jest.Mock;
  get: jest.Mock;
  multi: jest.Mock;
  quit: jest.Mock;
  disconnect: jest.Mock;
  tx: { set: jest.Mock; del: jest.Mock; exec: jest.Mock };
};
const pruneClientOf = (shared: RedisShared) =>
  (shared.redis as unknown as { pruneClient: MockPruneClient }).pruneClient;

describe('RedisShared', () => {
  beforeEach(() => {
    (Redis as unknown as jest.Mock).mockClear();
  });

  it('defines one command for each embedded Lua script', () => {
    const shared = new RedisShared({ host: 'localhost', port: 6379 });

    expect(Redis).toHaveBeenCalledTimes(1);
    const defineCommand = shared.redis.defineCommand as jest.Mock;
    expect(defineCommand).toHaveBeenCalledTimes(3);
    expect(defineCommand).not.toHaveBeenCalledWith(
      'pruneSessionTokens',
      expect.anything()
    );
    for (const [name, scriptName] of [
      ['getAccessToken', 'getAccessToken_1'],
      ['getAccessTokens', 'getAccessTokens_1'],
      ['touchSessionToken', 'touchSessionToken_1'],
    ]) {
      expect(defineCommand).toHaveBeenCalledWith(name, {
        lua: LUA_SCRIPTS[scriptName],
        numberOfKeys: 1,
      });
    }
  });

  describe('getSessionTokens', () => {
    it('unpacks the stored blob from a plain GET', async () => {
      const shared = new RedisShared({ host: 'localhost', port: 6379 });
      (shared.redis.get as jest.Mock).mockResolvedValue(
        JSON.stringify({ t1: [1, null, 'Firefox'] })
      );

      expect(await shared.getSessionTokens('uid')).toEqual({
        t1: { lastAccessTime: 1, location: null, uaBrowser: 'Firefox' },
      });
      expect(shared.redis.get).toHaveBeenCalledWith('uid');
    });

    it('deletes an unparseable blob and returns no tokens', async () => {
      const shared = new RedisShared({ host: 'localhost', port: 6379 });
      (shared.redis.get as jest.Mock).mockResolvedValue('not json');

      expect(await shared.getSessionTokens('uid')).toEqual({});
      expect(shared.redis.del).toHaveBeenCalledWith('uid');
    });

    describe('metrics', () => {
      const newSharedWithMetrics = () => {
        const metrics = { increment: jest.fn(), histogram: jest.fn() };
        const shared = new RedisShared(
          { host: 'localhost', port: 6379 },
          undefined,
          metrics as unknown as StatsD
        );
        return { shared, metrics };
      };

      it('counts a successful unpack', async () => {
        const { shared, metrics } = newSharedWithMetrics();
        (shared.redis.get as jest.Mock).mockResolvedValue('{}');

        await shared.getSessionTokens('uid');

        expect(metrics.increment).toHaveBeenCalledWith(
          'redis.getSessionTokens.unpack.success'
        );
        expect(metrics.increment).not.toHaveBeenCalledWith(
          'redis.getSessionTokens.unpack.err'
        );
      });

      it('counts a failed unpack', async () => {
        const { shared, metrics } = newSharedWithMetrics();
        (shared.redis.get as jest.Mock).mockResolvedValue('not json');

        await shared.getSessionTokens('uid');

        expect(metrics.increment).toHaveBeenCalledWith(
          'redis.getSessionTokens.unpack.err'
        );
        expect(metrics.increment).not.toHaveBeenCalledWith(
          'redis.getSessionTokens.unpack.success'
        );
      });

      it('counts a failed GET', async () => {
        const { shared, metrics } = newSharedWithMetrics();
        (shared.redis.get as jest.Mock).mockRejectedValue(new Error('down'));

        expect(await shared.getSessionTokens('uid')).toEqual({});
        expect(metrics.increment).toHaveBeenCalledWith(
          'redis.getSessionTokens.error'
        );
      });
    });
  });

  describe('pruneSessionTokens', () => {
    const blob = JSON.stringify({ t1: [1], t2: [2] });

    it('sets the remaining tokens in a watched transaction', async () => {
      const shared = new RedisShared({ host: 'localhost', port: 6379 });
      const client = pruneClientOf(shared);
      client.get.mockResolvedValue(blob);
      client.tx.exec.mockResolvedValue([[null, 'OK']]);

      expect(await shared.pruneSessionTokens('uid', ['t2'])).toBe('OK');
      expect(client.watch).toHaveBeenCalledWith('uid');
      expect(client.tx.set).toHaveBeenCalledWith(
        'uid',
        JSON.stringify({ t1: [1] })
      );
      expect(client.tx.del).not.toHaveBeenCalled();
    });

    it('deletes the key when no tokens remain', async () => {
      const shared = new RedisShared({ host: 'localhost', port: 6379 });
      const client = pruneClientOf(shared);
      client.get.mockResolvedValue(blob);
      client.tx.exec.mockResolvedValue([[null, 1]]);

      expect(await shared.pruneSessionTokens('uid', ['t1', 't2'])).toBe(1);
      expect(client.tx.del).toHaveBeenCalledWith('uid');
      expect(client.tx.set).not.toHaveBeenCalled();
    });

    it('deletes a missing key, as the Lua script did', async () => {
      const shared = new RedisShared({ host: 'localhost', port: 6379 });
      const client = pruneClientOf(shared);
      client.get.mockResolvedValue(null);
      client.tx.exec.mockResolvedValue([[null, 0]]);

      expect(await shared.pruneSessionTokens('uid')).toBe(0);
      expect(client.tx.del).toHaveBeenCalledWith('uid');
    });

    it('deletes an unparseable blob', async () => {
      const shared = new RedisShared({ host: 'localhost', port: 6379 });
      const client = pruneClientOf(shared);
      client.get.mockResolvedValue('not json');
      client.tx.exec.mockResolvedValue([[null, 1]]);

      expect(await shared.pruneSessionTokens('uid', ['t1'])).toBe(1);
      expect(client.tx.del).toHaveBeenCalledWith('uid');
    });

    const withMetrics = () => {
      const metrics = { increment: jest.fn() };
      const shared = new RedisShared(
        { host: 'localhost', port: 6379 },
        undefined,
        metrics as unknown as StatsD
      );
      return { metrics, shared, client: pruneClientOf(shared) };
    };

    it('skips the prune when another client changes the key after WATCH', async () => {
      const { metrics, shared, client } = withMetrics();
      client.get.mockResolvedValue(blob);
      client.tx.exec.mockResolvedValue(null);

      expect(await shared.pruneSessionTokens('uid', ['t1'])).toBeUndefined();
      expect(client.tx.exec).toHaveBeenCalledTimes(1);
      expect(metrics.increment).toHaveBeenCalledWith(
        'redis.pruneSessionTokens.conflict'
      );
    });

    it('records Redis errors, clears the WATCH, and does not reject', async () => {
      const { metrics, shared, client } = withMetrics();
      client.get.mockRejectedValue(new Error('down'));

      expect(await shared.pruneSessionTokens('uid', ['t1'])).toBeUndefined();
      expect(client.multi).not.toHaveBeenCalled();
      expect(client.unwatch).toHaveBeenCalled();
      expect(metrics.increment).toHaveBeenCalledWith(
        'redis.pruneSessionTokens.error'
      );
    });

    it('records an error from a queued command in the transaction', async () => {
      const { metrics, shared, client } = withMetrics();
      client.get.mockResolvedValue(blob);
      client.tx.exec.mockResolvedValue([[new Error('OOM'), null]]);

      expect(await shared.pruneSessionTokens('uid', ['t1'])).toBeUndefined();
      expect(metrics.increment).toHaveBeenCalledWith(
        'redis.pruneSessionTokens.error'
      );
    });

    it('skips a prune that arrives while another is running', async () => {
      const { metrics, shared, client } = withMetrics();
      client.get.mockResolvedValue(blob);
      client.tx.exec.mockResolvedValue([[null, 'OK']]);

      const results = await Promise.all([
        shared.pruneSessionTokens('a', ['t1']),
        shared.pruneSessionTokens('b', ['t1']),
      ]);

      expect(results).toEqual(['OK', undefined]);
      expect(client.watch).toHaveBeenCalledTimes(1);
      expect(metrics.increment).toHaveBeenCalledWith(
        'redis.pruneSessionTokens.skipped'
      );
      expect(await shared.pruneSessionTokens('b', ['t1'])).toBe('OK');
    });

    it('uses one dedicated connection with a command timeout', async () => {
      const shared = new RedisShared({ host: 'localhost', port: 6379 });
      const client = pruneClientOf(shared);
      client.get.mockResolvedValue(blob);
      client.tx.exec.mockResolvedValue([[null, 'OK']]);

      await shared.pruneSessionTokens('a', ['t1']);
      await shared.pruneSessionTokens('b', ['t1']);

      expect(shared.redis.duplicate).toHaveBeenCalledTimes(1);
      expect(shared.redis.duplicate).toHaveBeenCalledWith({
        commandTimeout: 1000,
      });
    });
  });

  describe('close', () => {
    const prune = async (shared: RedisShared) => {
      const client = pruneClientOf(shared);
      client.get.mockResolvedValue(null);
      client.tx.exec.mockResolvedValue([[null, 0]]);
      await shared.pruneSessionTokens('uid', ['t1']);
      return client;
    };

    it('quits both connections after a prune', async () => {
      const shared = new RedisShared({ host: 'localhost', port: 6379 });
      const client = await prune(shared);

      await shared.close();

      expect(client.quit).toHaveBeenCalledTimes(1);
      expect(client.disconnect).not.toHaveBeenCalled();
      expect(shared.redis.quit).toHaveBeenCalledTimes(1);
    });

    it('disconnects the prune connection and still quits the main one when the prune quit rejects', async () => {
      const log = { error: jest.fn() };
      const shared = new RedisShared(
        { host: 'localhost', port: 6379 },
        log as unknown as ILogger
      );
      const client = await prune(shared);
      const error = new Error('timeout');
      client.quit.mockRejectedValue(error);

      await shared.close();

      expect(client.disconnect).toHaveBeenCalledTimes(1);
      expect(log.error).toHaveBeenCalledWith('RedisShared', {
        msg: 'RedisShared: prune connection quit failed',
        error,
      });
      expect(shared.redis.quit).toHaveBeenCalledTimes(1);
    });
  });

  describe('claimLastAccessTimeWrite', () => {
    it('claims the write by setting an expiring marker key', async () => {
      const shared = new RedisShared({ host: 'localhost', port: 6379 });
      (shared.redis.set as jest.Mock).mockResolvedValue('OK');

      expect(await shared.claimLastAccessTimeWrite('t1', 300)).toBe(true);
      expect(shared.redis.set).toHaveBeenCalledWith(
        'lastAccessTime:t1',
        1,
        'EX',
        300,
        'NX'
      );
    });

    it('declines the write when the marker key already exists', async () => {
      const shared = new RedisShared({ host: 'localhost', port: 6379 });
      (shared.redis.set as jest.Mock).mockResolvedValue(null);

      expect(await shared.claimLastAccessTimeWrite('t1', 300)).toBe(false);
    });

    it('declines the write when Redis does not answer in time', async () => {
      jest.useFakeTimers();
      const shared = new RedisShared({
        host: 'localhost',
        port: 6379,
        timeoutMs: 50,
      });
      (shared.redis.set as jest.Mock).mockReturnValue(new Promise(() => {}));

      const claimed = shared.claimLastAccessTimeWrite('t1', 300);
      jest.advanceTimersByTime(50);
      expect(await claimed).toBe(false);
      jest.useRealTimers();
    });

    it('declines the write when Redis errors', async () => {
      const shared = new RedisShared({ host: 'localhost', port: 6379 });
      (shared.redis.set as jest.Mock).mockRejectedValue(new Error('down'));

      expect(await shared.claimLastAccessTimeWrite('t1', 300)).toBe(false);
    });
  });
});

describe('unpackSessionTokens', () => {
  it('returns no tokens for a missing key', () => {
    expect(unpackSessionTokens(null)).toEqual({});
  });

  it('expands packed tokens and their packed location', () => {
    const blob = JSON.stringify({
      t1: [
        1700000000000,
        ['Berlin', 'Berlin', 'BE', 'Germany', 'DE'],
        'Firefox',
        '130.0',
        'Mac OS X',
        '14',
        null,
      ],
    });

    expect(unpackSessionTokens(blob)).toEqual({
      t1: {
        lastAccessTime: 1700000000000,
        location: {
          city: 'Berlin',
          state: 'Berlin',
          stateCode: 'BE',
          country: 'Germany',
          countryCode: 'DE',
        },
        uaBrowser: 'Firefox',
        uaBrowserVersion: '130.0',
        uaOS: 'Mac OS X',
        uaOSVersion: '14',
        uaDeviceType: null,
      },
    });
  });

  it('omits properties past the end of a short packed array', () => {
    expect(unpackSessionTokens(JSON.stringify({ t1: [5] }))).toEqual({
      t1: { lastAccessTime: 5 },
    });
  });

  it('passes unpacked object entries through unchanged', () => {
    const blob = JSON.stringify({ t1: { lastAccessTime: 5, uaOS: 'Linux' } });
    expect(unpackSessionTokens(blob)).toEqual({
      t1: { lastAccessTime: 5, uaOS: 'Linux' },
    });
  });

  it('throws when the blob is not a JSON object', () => {
    expect(() => unpackSessionTokens('not json')).toThrow();
    expect(() => unpackSessionTokens('null')).toThrow();
    expect(() => unpackSessionTokens('42')).toThrow();
  });
});
