/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import assert from 'assert';

import sinon from 'sinon';
import { MetricsRedis } from '../../lib/metricsCache';
import { RedisShared } from 'fxa-shared/db/redis';

describe('MetricsRedis', function () {
  let metricsRedis;
  let redisStub;
  const PREFIX = 'metrics:';
  const KEY = `testKey${Date.now()}`;
  const metricsContext = {
    deviceId: 'eb3a368713e94801b0f3a67df6d059e0',
    entrypoint: 'preferences',
    flowBeginTime: 1711393758313,
    flowId: '4083592c5736512a96cea28ad68ae9c7ecc8f96298d394fe3430687531e703d2',
    flowCompleteSignal: 'account.signed',
    flowType: 'login',
    service: 'sync',
  };

  beforeEach(() => {
    redisStub = sinon.createStubInstance(RedisShared);
    redisStub.exists = sinon.stub();
    redisStub.set = sinon.stub();
    redisStub.get = sinon.stub();
    redisStub.del = sinon.stub();
    metricsRedis = new MetricsRedis({
      redis: { metrics: { enabled: true, prefix: PREFIX, lifetime: 60 } },
    });
    metricsRedis.redis = redisStub;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('#add', function () {
    it('should add data to the cache', async () => {
      redisStub.exists.resolves(0);
      redisStub.set.resolves('OK');

      await metricsRedis.add(KEY, metricsContext);

      assert(metricsRedis.redis.exists.calledWith(KEY));
      assert(
        metricsRedis.redis.set.calledWith(
          KEY,
          JSON.stringify(metricsContext),
          'EX',
          60
        )
      );
    });

    it('should throw an error if key already exists', async () => {
      redisStub.exists.resolves(1);

      try {
        await metricsRedis.add(KEY, metricsContext);
        assert.fail('Expected error was not thrown');
      } catch (err) {
        assert.strictEqual(err.message, 'Key already exists');
      }
    });

    it('should fail silently if the cache is not enabled', async () => {
      redisStub.exists.resolves(0);
      metricsRedis.enabled = false;

      await metricsRedis.add(KEY, metricsContext);
      assert(metricsRedis.redis.set.notCalled);
    });
  });

  describe('#del', function () {
    it('should delete data from the cache', async () => {
      redisStub.del.resolves(1);
      await metricsRedis.del(KEY);
      assert(redisStub.del.calledWith(KEY));
    });

    it('should fail silently if the cache is not enabled', async () => {
      metricsRedis.enabled = false;
      await metricsRedis.del(KEY);
      assert(redisStub.del.notCalled);
    });
  });

  describe('#get', function () {
    it('should fetch data from the cache', async function () {
      redisStub.get.resolves(JSON.stringify(metricsContext));
      const result = await metricsRedis.get(KEY);
      assert(redisStub.get.calledWith(KEY));
      assert.deepStrictEqual(result, metricsContext);
    });

    it('should return an empty object if an error occurs', async function () {
      redisStub.get.rejects(new Error('Test error'));
      const result = await metricsRedis.get(KEY);
      assert(redisStub.get.calledWith(KEY));
      assert.deepStrictEqual(result, {});
    });

    it('should return an empty object if not enabled', async () => {
      metricsRedis.enabled = false;
      const result = await metricsRedis.get(KEY);
      assert(redisStub.get.notCalled);
      assert.deepStrictEqual(result, {});
    });
  });
});
