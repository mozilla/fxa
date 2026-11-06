/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Redis from 'ioredis';
import type { StatsD } from 'hot-shots';
import { LUA_SCRIPTS } from './lua-scripts';
import { RedisShared, unpackSessionTokens } from './redis';

jest.mock('ioredis', () =>
  jest.fn().mockImplementation(() => {
    const redis = {
      on: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(() => Promise.resolve(1)),
      defineCommand: jest.fn((name: string) => {
        (redis as Record<string, unknown>)[name] = jest.fn();
      }),
    };
    return redis;
  })
);

describe('RedisShared', () => {
  beforeEach(() => {
    (Redis as unknown as jest.Mock).mockClear();
  });

  it('defines one command for each embedded Lua script', () => {
    const shared = new RedisShared({ host: 'localhost', port: 6379 });

    expect(Redis).toHaveBeenCalledTimes(1);
    const defineCommand = shared.redis.defineCommand as jest.Mock;
    expect(defineCommand).toHaveBeenCalledTimes(4);
    for (const [name, scriptName] of [
      ['getAccessToken', 'getAccessToken_1'],
      ['getAccessTokens', 'getAccessTokens_1'],
      ['pruneSessionTokens', 'pruneSessionTokens_1'],
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
