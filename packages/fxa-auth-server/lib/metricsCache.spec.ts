/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


import { MetricsRedis, MetricsRedisConfig } from './metricsCache';

// Mock typedi so Container.has() always returns false, preventing DI lookups.
jest.mock('typedi', () => ({
  Container: { has: jest.fn().mockReturnValue(false), get: jest.fn() },
  Token: jest.fn(),
}));

// Mock RedisShared so the constructor does not create a real ioredis connection.
// We replace `this.redis` in beforeEach anyway, but this prevents side effects.
jest.mock('fxa-shared/db/redis', () => {
  class RedisShared {
    redis: any = {};
    constructor() {
      // no-op
    }
  }
  return { RedisShared, Config: {} };
});

describe('MetricsRedis', () => {
  let metricsRedis: MetricsRedis;
  let redisStub: {
    exists: jest.Mock;
    set: jest.Mock;
    get: jest.Mock;
    del: jest.Mock;
  };

  const KEY = `testKey${Date.now()}`;
  const metricsContext = {
    deviceId: 'eb3a368713e94801b0f3a67df6d059e0',
    entrypoint: 'preferences',
    flowBeginTime: 1711393758313,
    flowId:
      '4083592c5736512a96cea28ad68ae9c7ecc8f96298d394fe3430687531e703d2',
    flowCompleteSignal: 'account.signed',
    flowType: 'login',
    service: 'sync',
  };

  const enabledConfig: MetricsRedisConfig = {
    redis: {
      metrics: {
        enabled: true,
        prefix: 'metrics:',
        lifetime: 60,
      } as any,
    },
  };

  beforeEach(() => {
    redisStub = {
      exists: jest.fn(),
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
    };

    metricsRedis = new MetricsRedis(enabledConfig);
    // Replace the internal redis client with our stub.
    (metricsRedis as any).redis = redisStub;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('#add', () => {
    it('should add data to the cache', async () => {
      redisStub.exists.mockResolvedValue(0);
      redisStub.set.mockResolvedValue('OK');

      await metricsRedis.add(KEY, metricsContext);

      expect(redisStub.exists).toHaveBeenCalledWith(KEY);
      expect(redisStub.set).toHaveBeenCalledWith(
        KEY,
        JSON.stringify(metricsContext),
        'EX',
        60
      );
    });

    it('should throw an error if key already exists', async () => {
      redisStub.exists.mockResolvedValue(1);

      await expect(metricsRedis.add(KEY, metricsContext)).rejects.toThrow(
        'Key already exists'
      );
    });

    it('should fail silently if the cache is not enabled', async () => {
      redisStub.exists.mockResolvedValue(0);
      (metricsRedis as any).enabled = false;

      await metricsRedis.add(KEY, metricsContext);

      expect(redisStub.set).not.toHaveBeenCalled();
    });
  });

  describe('#del', () => {
    it('should delete data from the cache', async () => {
      redisStub.del.mockResolvedValue(1);

      await metricsRedis.del(KEY);

      expect(redisStub.del).toHaveBeenCalledWith(KEY);
    });

    it('should fail silently if the cache is not enabled', async () => {
      (metricsRedis as any).enabled = false;

      await metricsRedis.del(KEY);

      expect(redisStub.del).not.toHaveBeenCalled();
    });
  });

  describe('#get', () => {
    it('should fetch data from the cache', async () => {
      redisStub.get.mockResolvedValue(JSON.stringify(metricsContext));

      const result = await metricsRedis.get(KEY);

      expect(redisStub.get).toHaveBeenCalledWith(KEY);
      expect(result).toEqual(metricsContext);
    });

    it('should return an empty object if an error occurs', async () => {
      redisStub.get.mockRejectedValue(new Error('Test error'));

      const result = await metricsRedis.get(KEY);

      expect(redisStub.get).toHaveBeenCalledWith(KEY);
      expect(result).toEqual({});
    });

    it('should return an empty object if not enabled', async () => {
      (metricsRedis as any).enabled = false;

      const result = await metricsRedis.get(KEY);

      expect(redisStub.get).not.toHaveBeenCalled();
      expect(result).toEqual({});
    });
  });
});
