/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* eslint-disable no-global-assign */

'use strict';

const { assert } = require('chai');
const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');

describe('feature-flags/index:', () => {
  let implementation, implementationFactory, initialise, origClearTimeout, origSetTimeout, resolve, reject;

  beforeEach(done => {
    origSetTimeout = setTimeout;
    origClearTimeout = clearTimeout;
    setTimeout = sinon.spy(() => 'wibble');
    clearTimeout = sinon.spy();
    implementation = {
      get: sinon.spy(() => new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      }))
    };
    implementationFactory = sinon.spy(() => implementation);
    initialise = proxyquire('../../feature-flags', {
      './foo': implementationFactory
    });
    setImmediate(done);
  });

  afterEach(() => {
    setTimeout = origSetTimeout;
    clearTimeout = origClearTimeout;
  });

  it('returned the expected interface', () => {
    assert.isFunction(initialise);
    assert.lengthOf(initialise, 2);
  });

  it('did not initialise implementation', () => {
    assert.equal(implementationFactory.callCount, 0);
  });

  it('did not call setTimeout', () => {
    assert.equal(setTimeout.callCount, 0);
  });

  it('does not throw if config is valid', () => {
    assert.doesNotThrow(() => initialise({
      implementation: 'foo',
      interval: 300000
    }));
  });

  it('throws if implementation does not exist', () => {
    assert.throws(() => initialise({
      implementation: 'wibble',
      interval: 300000
    }));
  });

  it('throws if interval is zero', () => {
    assert.throws(() => initialise({
      implementation: 'foo',
      interval: 0
    }));
  });

  it('throws if interval is NaN', () => {
    assert.throws(() => initialise({
      implementation: 'foo',
      interval: NaN
    }));
  });

  it('throws if interval is Infinity', () => {
    assert.throws(() => initialise({
      implementation: 'foo',
      interval: Number.POSITIVE_INFINITY
    }));
    assert.throws(() => initialise({
      implementation: 'foo',
      interval: Number.NEGATIVE_INFINITY
    }));
  });

  describe('initialise, successful get:', () => {
    let featureFlags;

    beforeEach(done => {
      featureFlags = initialise({
        implementation: 'foo',
        interval: 300000
      });
      resolve({ bar: 'baz' });
      setImmediate(done);
    });

    it('returned the expected interface', () => {
      assert.isObject(featureFlags);
      assert.isFunction(featureFlags.get);
      assert.lengthOf(featureFlags.get, 0);
      assert.isFunction(featureFlags.terminate);
      assert.lengthOf(featureFlags.terminate, 0);
    });

    it('initialised the implementation', () => {
      assert.equal(implementationFactory.callCount, 1);
      const args = implementationFactory.args[0];
      assert.lengthOf(args, 1);
      assert.deepEqual(args[0], {
        implementation: 'foo',
        interval: 300000
      });
    });

    it('called implementation.get', () => {
      assert.equal(implementation.get.callCount, 1);
      assert.lengthOf(implementation.get.args[0], 0);
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
      } catch (err) {
      }
      assert.deepEqual(result, { bar: 'baz' });
    });

    it('did not call clearTimeout', () => {
      assert.equal(clearTimeout.callCount, 0);
    });

    describe('terminate:', () => {
      beforeEach(() => {
        featureFlags.terminate();
      });

      it('called clearTimeout', () => {
        assert.equal(clearTimeout.callCount, 1);
        const args = clearTimeout.args[0];
        assert.lengthOf(args, 1);
        assert.equal(args[0], 'wibble');
      });

      describe('terminate:', () => {
        beforeEach(() => {
          featureFlags.terminate();
        });

        it('did not call clearTimeout', () => {
          assert.equal(clearTimeout.callCount, 1);
        });
      });
    });
  });

  describe('initialise without defaults, failed get:', () => {
    let featureFlags;

    beforeEach(done => {
      featureFlags = initialise({
        implementation: 'foo',
        interval: 300000
      });
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

    it('initialised the implementation', () => {
      assert.equal(implementationFactory.callCount, 1);
    });

    it('called implementation.get', () => {
      assert.equal(implementation.get.callCount, 1);
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
      featureFlags = initialise({
        implementation: 'foo',
        interval: 300000
      }, {
        foo: 'bar'
      });
      reject(new Error('Not implemented'));
      setImmediate(done);
    });

    it('initialised the implementation', () => {
      assert.equal(implementationFactory.callCount, 1);
    });

    it('called implementation.get', () => {
      assert.equal(implementation.get.callCount, 1);
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
          resolve({ baz: 'qux' });
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
      featureFlags = initialise({
        implementation: 'foo',
        interval: 300000
      }, {
        foo: 'bar'
      });
      setImmediate(done);
    });

    it('initialised the implementation', () => {
      assert.equal(implementationFactory.callCount, 1);
    });

    it('called implementation.get', () => {
      assert.equal(implementation.get.callCount, 1);
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
