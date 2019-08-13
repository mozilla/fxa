/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

'use strict';

const LIB_DIR = '../../lib';

const { assert } = require('chai');
const error = require(`${LIB_DIR}/error`);
const mocks = require('../mocks');
const P = require(`${LIB_DIR}/promise`);
const proxyquire = require('proxyquire');
const sinon = require('sinon');

describe('lib/redis:', () => {
  let config, log, mockError, redis, fxaShared, wrapper;

  beforeEach(() => {
    config = {};
    log = mocks.mockLog();
    redis = {
      foo: sinon.spy(() => {
        if (mockError) {
          return P.reject(mockError);
        }

        return P.resolve('bar');
      }),
      baz: sinon.spy(),
      wibble: 'blee',
    };
    fxaShared = sinon.spy(() => redis);
    wrapper = proxyquire(`${LIB_DIR}/redis`, {
      '../../fxa-shared/redis': fxaShared,
    })(config, log);
  });

  it('returned the wrapped interface', () => {
    assert.isObject(wrapper);
    assert.notEqual(wrapper, redis);
    assert.lengthOf(Object.keys(wrapper), 3);

    assert.isFunction(wrapper.foo);
    assert.notEqual(wrapper.foo, redis.foo);
    assert.lengthOf(wrapper.foo, 0);

    assert.isFunction(wrapper.baz);
    assert.notEqual(wrapper.baz, redis.baz);
    assert.lengthOf(wrapper.baz, 0);

    assert.equal(wrapper.wibble, 'blee');
  });

  it('called fxa-shared', () => {
    assert.equal(fxaShared.callCount, 1);
    const args = fxaShared.args[0];
    assert.lengthOf(args, 2);
    assert.equal(args[0], config);
    assert.equal(args[1], log);
  });

  it('did not call any redis methods', () => {
    assert.equal(redis.foo.callCount, 0);
    assert.equal(redis.baz.callCount, 0);
  });

  describe('successful method call:', () => {
    let result;

    beforeEach(async () => {
      result = await wrapper.foo('mock arg 1', 'mock arg 2');
    });

    it('returned the expected result', () => {
      assert.equal(result, 'bar');
    });

    it('called the underlying redis method', () => {
      assert.equal(redis.foo.callCount, 1);
      const args = redis.foo.args[0];
      assert.lengthOf(args, 2);
      assert.equal(args[0], 'mock arg 1');
      assert.equal(args[1], 'mock arg 2');
    });

    it('did not call the other redis method', () => {
      assert.equal(redis.baz.callCount, 0);
    });
  });

  describe('conflicting method call:', () => {
    let result, err;

    beforeEach(async () => {
      try {
        mockError = new Error('redis.watch.conflict');
        result = await wrapper.foo();
      } catch (e) {
        err = e;
      }
    });

    it('rejected with 409 conflict', () => {
      assert.isUndefined(result);
      assert.isObject(err);
      assert.equal(err.errno, error.ERRNO.REDIS_CONFLICT);
      assert.equal(err.message, 'Redis WATCH detected a conflicting update');
      assert.equal(err.output.statusCode, 409);
      assert.equal(err.output.payload.error, 'Conflict');
    });

    it('called the underlying redis method', () => {
      assert.equal(redis.foo.callCount, 1);
    });
  });

  describe('failing method call:', () => {
    let result, err;

    beforeEach(async () => {
      try {
        mockError = new Error('wibble');
        result = await wrapper.foo();
      } catch (e) {
        err = e;
      }
    });

    it('rejected with 500 error', () => {
      assert.isUndefined(result);
      assert.isObject(err);
      assert.equal(err.errno, error.ERRNO.UNEXPECTED_ERROR);
      assert.equal(err.message, 'Unspecified error');
      assert.equal(err.output.statusCode, 500);
      assert.equal(err.output.payload.error, 'Internal Server Error');
    });

    it('called the underlying redis method', () => {
      assert.equal(redis.foo.callCount, 1);
    });
  });
});
