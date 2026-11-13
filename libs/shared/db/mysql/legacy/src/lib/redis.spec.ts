/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Redis from 'ioredis';
import type { StatsD } from 'hot-shots';
import type { ILogger } from '@fxa/shared/log';
import { LUA_SCRIPTS } from './lua-scripts';
import { packSessionToken, RedisShared, unpackSessionTokens } from './redis';

jest.mock('ioredis', () =>
  jest.fn().mockImplementation(() => {
    const exec = jest.fn(() => Promise.resolve([[null, 'OK']]));
    const set = jest.fn(() => ({ exec }));
    const touchRedis = {
      on: jest.fn(),
      watch: jest.fn(() => Promise.resolve('OK')),
      unwatch: jest.fn(() => Promise.resolve('OK')),
      get: jest.fn(() => Promise.resolve(null)),
      multi: jest.fn(() => ({ set })),
      set,
      exec,
    };
    const redis = {
      on: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(() => Promise.resolve(1)),
      duplicate: jest.fn(() => touchRedis),
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
    expect(defineCommand).toHaveBeenCalledTimes(3);
    for (const [name, scriptName] of [
      ['getAccessToken', 'getAccessToken_1'],
      ['getAccessTokens', 'getAccessTokens_1'],
      ['pruneSessionTokens', 'pruneSessionTokens_1'],
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

  describe('touchSessionToken', () => {
    const newShared = () => {
      const log = { error: jest.fn() };
      const shared = new RedisShared(
        { host: 'localhost', port: 6379 },
        log as unknown as ILogger
      );
      const touchRedis = (shared.redis.duplicate as jest.Mock)();
      return { shared, touchRedis, log };
    };

    it('writes a new token when the key is missing', async () => {
      const { shared, touchRedis } = newShared();

      expect(
        await shared.touchSessionToken('uid', {
          id: 't1',
          lastAccessTime: 1,
          location: null,
          uaBrowser: 'Firefox',
        })
      ).toBe('OK');
      expect(touchRedis.watch).toHaveBeenCalledWith('uid');
      expect(touchRedis.set).toHaveBeenCalledWith(
        'uid',
        '{"t1":[1,null,"Firefox"]}'
      );
    });

    it('keeps the other tokens in the blob unchanged', async () => {
      const { shared, touchRedis } = newShared();
      touchRedis.get.mockResolvedValue(
        JSON.stringify({ t1: [1, null, 'Firefox'], t2: [7] })
      );

      await shared.touchSessionToken('uid', { id: 't1', lastAccessTime: 2 });

      expect(touchRedis.set).toHaveBeenCalledWith(
        'uid',
        '{"t1":[2,null,"Firefox"],"t2":[7]}'
      );
    });

    it('retries when another client changes the key after WATCH', async () => {
      const { shared, touchRedis } = newShared();
      touchRedis.get
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(JSON.stringify({ t2: [7] }));
      touchRedis.exec.mockResolvedValueOnce(null);

      expect(
        await shared.touchSessionToken('uid', { id: 't1', lastAccessTime: 1 })
      ).toBe('OK');
      expect(touchRedis.watch).toHaveBeenCalledTimes(2);
      expect(touchRedis.set).toHaveBeenLastCalledWith(
        'uid',
        '{"t2":[7],"t1":[1]}'
      );
    });

    it('gives up and logs after three failed transactions', async () => {
      const { shared, touchRedis, log } = newShared();
      touchRedis.exec.mockResolvedValue(null);

      expect(
        await shared.touchSessionToken('uid', { id: 't1', lastAccessTime: 1 })
      ).toBeNull();
      expect(touchRedis.exec).toHaveBeenCalledTimes(3);
      expect(log.error).toHaveBeenCalledWith('RedisShared', {
        msg: 'RedisShared: touchSessionToken gave up after write conflicts',
      });
    });

    it('rejects and releases the WATCH on an unparseable blob', async () => {
      const { shared, touchRedis } = newShared();
      touchRedis.get.mockResolvedValue('not json');

      await expect(
        shared.touchSessionToken('uid', { id: 't1', lastAccessTime: 1 })
      ).rejects.toThrow();
      expect(touchRedis.unwatch).toHaveBeenCalled();
      expect(touchRedis.multi).not.toHaveBeenCalled();
    });

    it('rejects and releases the WATCH when GET fails', async () => {
      const { shared, touchRedis } = newShared();
      touchRedis.get.mockRejectedValue(new Error('down'));

      await expect(
        shared.touchSessionToken('uid', { id: 't1', lastAccessTime: 1 })
      ).rejects.toThrow('down');
      expect(touchRedis.unwatch).toHaveBeenCalled();
      expect(touchRedis.multi).not.toHaveBeenCalled();
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

describe('packSessionToken', () => {
  it('packs the fields in property order and trims trailing gaps', () => {
    expect(
      packSessionToken({ id: 't1', lastAccessTime: 1, uaBrowser: 'x' }, null)
    ).toEqual([1, undefined, 'x']);
  });

  it('keeps the old value where the update is missing, null or false', () => {
    expect(
      packSessionToken(
        { lastAccessTime: 2, uaBrowser: null, uaOS: false, uaOSVersion: 0 },
        [1, null, 'Firefox', '130.0', 'Linux', '6']
      )
    ).toEqual([2, null, 'Firefox', '130.0', 'Linux', 0]);
  });

  it('packs a location object in location property order', () => {
    expect(
      packSessionToken(
        { location: { countryCode: 'DE', city: 'Berlin', state: 'Berlin' } },
        [5, ['Old', 'Old', 'OL', 'Oldland', 'OL']]
      )
    ).toEqual([5, ['Berlin', 'Berlin', undefined, undefined, 'DE']]);
  });

  it('round-trips through unpackSessionTokens', () => {
    const token = {
      lastAccessTime: 1,
      location: {
        city: 'a',
        state: 'b',
        stateCode: 'c',
        country: 'd',
        countryCode: 'e',
      },
      uaBrowser: 'Firefox',
      uaFormFactor: 'desktop',
    };
    const blob = JSON.stringify({ t1: packSessionToken(token, undefined) });
    expect(unpackSessionTokens(blob)).toEqual({
      t1: {
        ...token,
        uaBrowserVersion: null,
        uaOS: null,
        uaOSVersion: null,
        uaDeviceType: null,
      },
    });
  });
});
