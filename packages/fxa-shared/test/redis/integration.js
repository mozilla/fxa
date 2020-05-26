/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../..';

const { assert } = require('chai');
const Promise = require(`${ROOT_DIR}/promise`);

describe('redis integration:', () => {
  let config, log, redis;

  before(() => {
    config = {
      enabled: true,
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      prefix: process.env.REDIS_PREFIX || 'fxa-shared-test:',
      maxConnections: process.env.REDIS_POOL_MAX_CONNECTIONS || 200,
      minConnections: process.env.REDIS_POOL_MIN_CONNECTIONS || 2,
    };
    log = { info() {}, warn() {}, error() {} };
    redis = require(`${ROOT_DIR}/redis`)(config, log);
  });

  after(() => redis.close());

  describe('set:', () => {
    before(() => {
      return redis.set('foo', 'bar');
    });

    it('get reads data', async () => {
      const results = await Promise.all([redis.get('foo'), redis.get('foo')]);
      results.forEach((result) => assert.equal(result, 'bar'));
    });
  });

  describe('concurrent sets:', () => {
    before(() => {
      return Promise.all([redis.set('foo', '1'), redis.set('foo', '2')]);
    });

    it('data was set', async () => {
      assert.match(await redis.get('foo'), /^(?:1|2)$/);
    });
  });

  describe('del:', () => {
    before(() => {
      return redis.del('foo');
    });

    it('data was deleted', async () => {
      assert.isNull(await redis.get('foo'));
    });
  });

  describe('update:', () => {
    before(async () => {
      await redis.set('foo', 'bar');
      await redis.update('foo', (oldValue) => `${oldValue}2`);
    });

    it('data was set', async () => {
      assert.equal(await redis.get('foo'), 'bar2');
    });
  });

  describe('update non-existent key:', () => {
    before(async () => {
      await redis.del('wibble');
      await redis.update('wibble', () => 'blee');
    });

    it('data was set', async () => {
      assert.equal(await redis.get('wibble'), 'blee');
    });
  });

  describe('update existing key to falsey value:', () => {
    before(() => {
      return redis.update('wibble', () => '');
    });

    it('data was deleted', async () => {
      assert.isNull(await redis.get('wibble'));
    });
  });

  describe('concurrent updates of the same key:', () => {
    const errors = [];
    let winner;

    before(() => {
      let resolve,
        sum = 0;
      const synchronisationPromise = new Promise((r) => (resolve = r));

      return Promise.all(
        [1, 2].map(async (value) => {
          try {
            await redis.update('foo', createUpdateHandler(value));
            winner = value;
          } catch (error) {
            errors.push(error);
          }
        })
      );

      function createUpdateHandler(value) {
        return async () => {
          sum += value;
          if (sum === 3) {
            resolve();
          }
          await synchronisationPromise;
          return value;
        };
      }
    });

    it('one update failed', () => {
      assert.lengthOf(errors, 1);
      assert.equal(errors[0].message, 'redis.watch.conflict');
    });

    it('the other update completed successfully', async () => {
      assert.equal(await redis.get('foo'), winner);
    });
  });

  describe('concurrent updates of different keys:', () => {
    before(() => {
      let resolve,
        values = '';
      const synchronisationPromise = new Promise((r) => (resolve = r));

      return Promise.all([
        redis.update('foo', createUpdateHandler('bar')),
        redis.update('baz', createUpdateHandler('qux')),
      ]);

      function createUpdateHandler(value) {
        return async () => {
          values += value;
          if (values.length === 6) {
            resolve();
          }
          await synchronisationPromise;
          return value;
        };
      }
    });

    it('first update completed successfully', async () => {
      assert.equal(await redis.get('foo'), 'bar');
    });

    it('second update completed successfully', async () => {
      assert.equal(await redis.get('baz'), 'qux');
    });
  });

  describe('reentrant updates of different keys:', () => {
    let redisPool, error;

    before(() => {
      redisPool = require(`${ROOT_DIR}/redis/pool`)(config, log).pool;
      return Promise.using(redisPool.acquire(), (connection) =>
        connection.update('foo', async (oldFoo) => {
          try {
            await connection.update('baz', (oldBaz) => `${oldBaz}2`);
          } catch (e) {
            error = e;
          }
          return `${oldFoo}2`;
        })
      );
    });

    after(() => redisPool.close());

    it('first update completed successfully', async () => {
      assert.equal(await redis.get('foo'), 'bar2');
    });

    it('second update failed', async () => {
      assert.ok(error);
      assert.equal(error.message, 'redis.update.conflict');
      assert.equal(await redis.get('baz'), 'qux');
    });
  });

  describe('set concurrently with update:', () => {
    let error;

    before(async () => {
      try {
        await redis.update('foo', async () => {
          await redis.set('foo', 'blee');
          return 'wibble';
        });
      } catch (e) {
        error = e;
      }
    });

    it('update failed', () => {
      assert.ok(error);
      assert.equal(error.message, 'redis.watch.conflict');
    });

    it('data was set', async () => {
      assert.equal(await redis.get('foo'), 'blee');
    });
  });

  describe('del concurrently with update:', () => {
    let error;

    before(async () => {
      try {
        await redis.set('foo', 'bar');
        await redis.update('foo', async () => {
          await redis.del('foo');
          return 'baz';
        });
      } catch (e) {
        error = e;
      }
    });

    it('update failed', () => {
      assert.ok(error);
      assert.equal(error.message, 'redis.watch.conflict');
    });

    it('data was deleted', async () => {
      assert.isNull(await redis.get('foo'));
    });
  });

  describe('zadd:', () => {
    let now, result;

    before(async () => {
      now = Date.now();
      result = await redis.zadd(
        'foorange',
        now,
        'wibble',
        now + 1,
        'blee',
        now - 1,
        'mirm'
      );
    });

    it('returned the correct result', () => {
      assert.equal(result, 3);
    });

    it('zrange reads data', async () => {
      assert.deepEqual(await redis.zrange('foorange', 0, -1), [
        'mirm',
        'wibble',
        'blee',
      ]);
      assert.deepEqual(await redis.zrange('foorange', 1, 1), ['wibble']);
    });

    it('zrevange reads data', async () => {
      assert.deepEqual(await redis.zrevrange('foorange', 0, -1), [
        'blee',
        'wibble',
        'mirm',
      ]);
    });

    it('zrangebyscore reads data', async () => {
      assert.deepEqual(
        await redis.zrangebyscore('foorange', now - 1, now + 1),
        ['mirm', 'wibble', 'blee']
      );
      assert.deepEqual(await redis.zrangebyscore('foorange', now, now + 1), [
        'wibble',
        'blee',
      ]);
    });

    it('zrevrangebyscore reads data', async () => {
      assert.deepEqual(
        await redis.zrevrangebyscore('foorange', now + 1, now - 1),
        ['blee', 'wibble', 'mirm']
      );
    });

    describe('zrem:', () => {
      let result;

      before(async () => {
        result = await redis.zrem('foorange', 'wibble');
      });

      it('returned the correct result', () => {
        assert.equal(result, 1);
      });

      it('zrange reads data', async () => {
        assert.deepEqual(await redis.zrange('foorange', 0, -1), [
          'mirm',
          'blee',
        ]);
      });
    });

    describe('zpoprangebyscore:', () => {
      let results;

      before(async () => {
        results = await Promise.all([
          redis.zpoprangebyscore('foorange', now - 1, now + 1),
          redis.zpoprangebyscore('foorange', now - 1, now + 1),
        ]);
      });

      it('returned the correct results', () => {
        if (results[0].length) {
          assert.deepEqual(results[0], ['mirm', 'blee']);
          assert.deepEqual(results[1], []);
        } else {
          assert.deepEqual(results[0], []);
          assert.deepEqual(results[1], ['mirm', 'blee']);
        }
      });

      it('sorted set is empty', async () => {
        assert.deepEqual(await redis.zrange('foorange', 0, -1), []);
      });
    });
  });
});
