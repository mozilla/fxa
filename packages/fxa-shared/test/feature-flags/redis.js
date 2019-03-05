/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

describe('feature-flags/redis:', () => {
  let flags, getError, log, redisClient, redis, initialise;

  beforeEach(() => {
    log = {
      error: sinon.spy(),
      info: sinon.spy(),
      warn: sinon.spy(),
    };
    redisClient = {
      get: sinon.spy(async () => {
        if (getError) {
          throw getError;
        }

        return JSON.stringify(flags);
      })
    };
    redis = sinon.spy(() => redisClient);
    initialise = proxyquire('../../feature-flags/redis', {
      '../redis': redis
    });
  });

  it('returned the expected interface', () => {
    assert.isFunction(initialise);
    assert.lengthOf(initialise, 2);
  });

  it('did not initialise redis', () => {
    assert.equal(redis.callCount, 0);
  });

  describe('initialise:', () => {
    let impl;

    beforeEach(() => {
      impl = initialise({
        enabled: false,
        host: '127.0.0.1',
        port: 6379,
        prefix: 'wibble:',
      }, log);
    });

    it('returned the expected interface', () => {
      assert.isObject(impl);
      assert.isFunction(impl.get);
      assert.lengthOf(impl.get, 0);
    });

    it('initialised redis', () => {
      assert.equal(redis.callCount, 1);
      const args = redis.args[0];
      assert.lengthOf(args, 2);
      assert.deepEqual(args[0], {
        enabled: true,
        host: '127.0.0.1',
        port: 6379,
        prefix: 'featureFlags:',
      });
      assert.equal(args[1], log);
    });

    describe('get:', () => {
      let result;

      beforeEach(async () => {
        flags = {
          foo: 'bar',
          baz: 'qux',
        };
        result = await impl.get();
      });

      it('returned the expected result', () => {
        assert.deepEqual(result, flags);
      });

      it('called redis.get', () => {
        assert.equal(redisClient.get.callCount, 1);
        const args = redisClient.get.args[0];
        assert.lengthOf(args, 1);
        assert.equal(args[0], 'current');
      });
    });

    describe('get error:', () => {
      let error;

      beforeEach(async () => {
        getError = 'wibble';
        try {
          await impl.get();
        } catch (e) {
          error = e;
        }
      });

      it('rejected', () => {
        assert.equal(error, 'wibble');
      });

      it('called redis.get', () => {
        assert.equal(redisClient.get.callCount, 1);
      });
    });
  });
});
