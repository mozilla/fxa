/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

/* eslint-disable no-global-assign */

'use strict';

const { assert } = require('chai');
const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');

describe('feature-flags/index:', () => {
  let origSetTimeout,
    origClearTimeout,
    redis,
    redisFactory,
    log,
    resolve,
    reject,
    initialise;

  beforeEach(done => {
    origSetTimeout = setTimeout;
    origClearTimeout = clearTimeout;
    setTimeout = sinon.spy(() => 'wibble');
    clearTimeout = sinon.spy();
    redis = {
      get: sinon.spy(
        () =>
          new Promise((res, rej) => {
            resolve = res;
            reject = rej;
          })
      ),
      close: sinon.spy(),
    };
    redisFactory = sinon.spy(() => redis);
    log = {};
    initialise = proxyquire('../../feature-flags', {
      '../redis': redisFactory,
    });
    setImmediate(done);
  });

  afterEach(() => {
    setTimeout = origSetTimeout;
    clearTimeout = origClearTimeout;
  });

  it('returned the expected interface', () => {
    assert.isFunction(initialise);
    assert.lengthOf(initialise, 3);
  });

  it('did not initialise redis', () => {
    assert.equal(redisFactory.callCount, 0);
  });

  it('did not call setTimeout', () => {
    assert.equal(setTimeout.callCount, 0);
  });

  it('does not throw if args are valid', () => {
    assert.doesNotThrow(() => initialise({ interval: 300000 }, log));
  });

  it('throws if interval is zero', () => {
    assert.throws(() => initialise({ interval: 0 }, log));
  });

  it('throws if interval is NaN', () => {
    assert.throws(() => initialise({ interval: NaN }, log));
  });

  it('throws if interval is Infinity', () => {
    assert.throws(() =>
      initialise({ interval: Number.POSITIVE_INFINITY }, log)
    );
    assert.throws(() =>
      initialise({ interval: Number.NEGATIVE_INFINITY }, log)
    );
  });

  it('throws if log argument is missing', () => {
    assert.throws(() => initialise({ interval: 300000 }));
  });

  describe('initialise, successful get:', () => {
    let featureFlags;

    beforeEach(done => {
      featureFlags = initialise(
        {
          interval: 300000,
          redis: {
            enabled: false,
            host: '127.0.0.1',
            port: 6379,
            prefix: 'wibble:',
          },
        },
        log
      );
      resolve(JSON.stringify({ foo: 'bar' }));
      setImmediate(done);
    });

    it('returned the expected interface', () => {
      assert.isObject(featureFlags);
      assert.isFunction(featureFlags.get);
      assert.lengthOf(featureFlags.get, 0);
      assert.isFunction(featureFlags.terminate);
      assert.lengthOf(featureFlags.terminate, 0);
    });

    it('initialised redis', () => {
      assert.equal(redisFactory.callCount, 1);
      const args = redisFactory.args[0];
      assert.lengthOf(args, 2);
      assert.deepEqual(args[0], {
        enabled: true,
        host: '127.0.0.1',
        port: 6379,
        prefix: 'featureFlags:',
      });
      assert.equal(args[1], log);
    });

    it('called redis.get', () => {
      assert.equal(redis.get.callCount, 1);
      const args = redis.get.args[0];
      assert.lengthOf(args, 1);
      assert.equal(args[0], 'current');
    });

    it('called setTimeout', () => {
      assert.equal(setTimeout.callCount, 1);
      const args = setTimeout.args[0];
      assert.lengthOf(args, 2);
      assert.isFunction(args[0]);
      assert.equal(args[1], 300000);
    });

    it('featureFlags.get resolves', async () => {
      let result;
      try {
        result = await featureFlags.get();
      } catch (err) {}
      assert.deepEqual(result, { foo: 'bar' });
    });

    it('did not call clearTimeout', () => {
      assert.equal(clearTimeout.callCount, 0);
    });

    describe('terminate:', () => {
      beforeEach(() => {
        return featureFlags.terminate();
      });

      it('called clearTimeout', () => {
        assert.equal(clearTimeout.callCount, 1);
        const args = clearTimeout.args[0];
        assert.lengthOf(args, 1);
        assert.equal(args[0], 'wibble');
      });

      it('called redis.close', () => {
        assert.equal(redis.close.callCount, 1);
        assert.lengthOf(redis.close.args[0], 0);
      });

      describe('terminate:', () => {
        beforeEach(() => {
          featureFlags.terminate();
        });

        it('did not call clearTimeout a second time', () => {
          assert.equal(clearTimeout.callCount, 1);
        });

        it('called redis.close', () => {
          assert.equal(redis.close.callCount, 2);
        });
      });
    });
  });

  describe('initialise without defaults, failed get:', () => {
    let featureFlags;

    beforeEach(done => {
      featureFlags = initialise({ interval: 300000 }, log);
      reject(new Error('Not implemented'));
      setImmediate(done);
    });

    it('returned the expected interface', () => {
      assert.isObject(featureFlags);
      assert.isFunction(featureFlags.get);
      assert.lengthOf(featureFlags.get, 0);
      assert.isFunction(featureFlags.terminate);
      assert.lengthOf(featureFlags.terminate, 0);
    });

    it('initialised redis', () => {
      assert.equal(redisFactory.callCount, 1);
    });

    it('called redis.get', () => {
      assert.equal(redis.get.callCount, 1);
    });

    it('called setTimeout', () => {
      assert.equal(setTimeout.callCount, 1);
    });

    it('featureFlags.get rejects', async () => {
      let rejected = false;
      try {
        await featureFlags.get();
      } catch (err) {
        rejected = true;
      }
      assert.equal(rejected, true);
    });

    it('did not call clearTimeout', () => {
      assert.equal(clearTimeout.callCount, 0);
    });
  });

  describe('initialise with defaults, immediate failed get:', () => {
    let featureFlags;

    beforeEach(done => {
      featureFlags = initialise({ interval: 300000 }, log, { foo: 'bar' });
      reject(new Error('Not implemented'));
      setImmediate(done);
    });

    it('initialised redis', () => {
      assert.equal(redisFactory.callCount, 1);
    });

    it('called redis.get', () => {
      assert.equal(redis.get.callCount, 1);
    });

    it('called setTimeout', () => {
      assert.equal(setTimeout.callCount, 1);
    });

    it('featureFlags.get returns defaults', async () => {
      assert.deepEqual(await featureFlags.get(), { foo: 'bar' });
    });

    describe('call refresh:', () => {
      beforeEach(done => {
        setTimeout.args[0][0]();
        setImmediate(done);
      });

      it('featureFlags.get returns original data', async () => {
        assert.deepEqual(await featureFlags.get(), { foo: 'bar' });
      });

      describe('resolve refresh:', () => {
        beforeEach(done => {
          resolve(JSON.stringify({ baz: 'qux' }));
          setImmediate(done);
        });

        it('featureFlags.get returns refreshed data', async () => {
          assert.deepEqual(await featureFlags.get(), { baz: 'qux' });
        });
      });

      it('did not call clearTimeout', () => {
        assert.equal(clearTimeout.callCount, 0);
      });
    });
  });

  describe('initialise with defaults, delayed failed get:', () => {
    let featureFlags;

    beforeEach(done => {
      featureFlags = initialise({ interval: 300000 }, log, { foo: 'bar' });
      setImmediate(done);
    });

    it('initialised redis', () => {
      assert.equal(redisFactory.callCount, 1);
    });

    it('called redis.get', () => {
      assert.equal(redis.get.callCount, 1);
    });

    it('did not call setTimeout', () => {
      assert.equal(setTimeout.callCount, 0);
    });

    it('featureFlags.get returns defaults after reject occurs', async () => {
      setImmediate(() => reject(new Error('Not implemented')));
      assert.deepEqual(await featureFlags.get(), { foo: 'bar' });
      assert.equal(setTimeout.callCount, 1);
    });
  });
});
