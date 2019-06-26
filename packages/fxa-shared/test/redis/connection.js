/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../..';

const { assert } = require('chai');
const Promise = require(`${ROOT_DIR}/promise`);
const redisConnection = require(`${ROOT_DIR}/redis/connection`);
const sinon = require('sinon');

describe('redis/connection:', () => {
  let log, redisClient, redisMulti, connection, getValue;

  beforeEach(() => {
    log = {
      error: sinon.spy(),
      info: sinon.spy(),
      warn: sinon.spy(),
    };
    redisClient = {
      on: sinon.spy(),
      watchAsync: sinon.spy(() => Promise.resolve()),
      multi: sinon.spy(() => redisMulti),
      unwatch: sinon.spy(),
      quit: sinon.spy(),
    };
    redisMulti = {
      execAsync: sinon.spy(() => Promise.resolve(true)),
      set: sinon.spy(),
      del: sinon.spy(),
      zrangebyscore: sinon.spy(),
      zremrangebyscore: sinon.spy(),
    };
    connection = redisConnection.create(log, redisClient);
    getValue = sinon.spy(() => 'mock value');
  });

  it('exported method names', () => {
    assert.isArray(redisConnection.methods);
    assert.include(redisConnection.methods, 'get');
    assert.include(redisConnection.methods, 'set');
    assert.include(redisConnection.methods, 'del');
    assert.include(redisConnection.methods, 'update');
    assert.include(redisConnection.methods, 'zadd');
    assert.include(redisConnection.methods, 'zpoprangebyscore');
    assert.include(redisConnection.methods, 'zrange');
    assert.include(redisConnection.methods, 'zrangebyscore');
    assert.include(redisConnection.methods, 'zrem');
  });

  it('redisConnection.isValid returns true', () => {
    assert.isTrue(connection.isValid());
  });

  describe('redisConnection.update:', () => {
    beforeEach(() => {
      redisClient.getAsync = sinon.spy(() =>
        Promise.resolve('mock get result')
      );
      redisClient.setAsync = sinon.spy();
      return connection.update('wibble', getValue);
    });

    it('called redisClient.watch correctly', () => {
      assert.equal(redisClient.watchAsync.callCount, 1);
      const args = redisClient.watchAsync.args[0];
      assert.lengthOf(args, 1);
      assert.equal(args[0], 'wibble');
    });

    it('called redisClient.get correctly', () => {
      assert.equal(redisClient.getAsync.callCount, 1);
      const args = redisClient.getAsync.args[0];
      assert.lengthOf(args, 1);
      assert.equal(args[0], 'wibble');
    });

    it('called getValue correctly', () => {
      assert.equal(getValue.callCount, 1);
      const args = getValue.args[0];
      assert.lengthOf(args, 1);
      assert.equal(args[0], 'mock get result');
    });

    it('called redisClient.multi correctly', () => {
      assert.equal(redisClient.multi.callCount, 1);
      assert.lengthOf(redisClient.multi.args[0], 0);
    });

    it('called redisMulti.set correctly', () => {
      assert.equal(redisMulti.set.callCount, 1);
      const args = redisMulti.set.args[0];
      assert.lengthOf(args, 2);
      assert.equal(args[0], 'wibble');
      assert.equal(args[1], 'mock value');
    });

    it('called redisMulti.exec correctly', () => {
      assert.equal(redisMulti.execAsync.callCount, 1);
      assert.lengthOf(redisMulti.execAsync.args[0], 0);
    });

    it('did not call redisMulti.del', () => {
      assert.equal(redisMulti.del.callCount, 0);
    });

    it('did not call redisClient.set', () => {
      assert.equal(redisClient.setAsync.callCount, 0);
    });

    it('did not call redisClient.unwatch', () => {
      assert.equal(redisClient.unwatch.callCount, 0);
    });

    it('did not call log.error', () => {
      assert.equal(log.error.callCount, 0);
    });
  });

  describe('redisConnection.update with falsey value:', () => {
    beforeEach(() => {
      redisClient.getAsync = sinon.spy(() =>
        Promise.resolve('mock get result')
      );
      redisClient.setAsync = sinon.spy();
      return connection.update('wibble', () => {});
    });

    it('called redisClient.watch', () => {
      assert.equal(redisClient.watchAsync.callCount, 1);
    });

    it('called redisClient.get', () => {
      assert.equal(redisClient.getAsync.callCount, 1);
    });

    it('called redisClient.multi', () => {
      assert.equal(redisClient.multi.callCount, 1);
    });

    it('called redisMulti.del correctly', () => {
      assert.equal(redisMulti.del.callCount, 1);
      const args = redisMulti.del.args[0];
      assert.lengthOf(args, 1);
      assert.equal(args[0], 'wibble');
    });

    it('called redisMulti.exec', () => {
      assert.equal(redisMulti.execAsync.callCount, 1);
    });

    it('did not call redisMulti.set', () => {
      assert.equal(redisMulti.set.callCount, 0);
    });

    it('did not call redisClient.set', () => {
      assert.equal(redisClient.setAsync.callCount, 0);
    });

    it('did not call redisClient.unwatch', () => {
      assert.equal(redisClient.unwatch.callCount, 0);
    });

    it('did not call log.error', () => {
      assert.equal(log.error.callCount, 0);
    });
  });

  describe('redisConnection.zpoprangebyscore:', () => {
    let result;

    beforeEach(async () => {
      redisMulti.execAsync = sinon.spy(() => Promise.resolve([['foo'], 1]));
      result = await connection.zpoprangebyscore('blee', 0, 1, true);
    });

    it('returned the correct result', () => {
      assert.deepEqual(result, ['foo']);
    });

    it('called redisClient.multi correctly', () => {
      assert.equal(redisClient.multi.callCount, 1);
      assert.lengthOf(redisClient.multi.args[0], 0);
    });

    it('called redisMulti.zrangebyscore correctly', () => {
      assert.equal(redisMulti.zrangebyscore.callCount, 1);
      const args = redisMulti.zrangebyscore.args[0];
      assert.lengthOf(args, 4);
      assert.equal(args[0], 'blee');
      assert.equal(args[1], 0);
      assert.equal(args[2], 1);
      assert.equal(args[3], 'WITHSCORES');
    });

    it('called redisMulti.zremrangebyscore correctly', () => {
      assert.equal(redisMulti.zremrangebyscore.callCount, 1);
      const args = redisMulti.zremrangebyscore.args[0];
      assert.lengthOf(args, 3);
      assert.equal(args[0], 'blee');
      assert.equal(args[1], 0);
      assert.equal(args[2], 1);
    });

    it('called redisMulti.exec correctly', () => {
      assert.equal(redisMulti.execAsync.callCount, 1);
      assert.lengthOf(redisMulti.execAsync.args[0], 0);
    });

    it('did not call redisMulti.set', () => {
      assert.equal(redisMulti.set.callCount, 0);
    });

    it('did not call redisMulti.del', () => {
      assert.equal(redisMulti.del.callCount, 0);
    });

    it('did not call redisClient.watch', () => {
      assert.equal(redisClient.watchAsync.callCount, 0);
    });

    it('did not call redisClient.unwatch', () => {
      assert.equal(redisClient.unwatch.callCount, 0);
    });

    it('did not call log.error', () => {
      assert.equal(log.error.callCount, 0);
    });
  });

  redisConnection.methods.forEach(method => {
    if (method === 'update' || method === 'zpoprangebyscore') {
      return;
    }

    const clientMethod = `${method}Async`;

    describe(`redisConnection.${method}:`, () => {
      let result;

      beforeEach(async () => {
        redisClient[clientMethod] = sinon.spy(() =>
          Promise.resolve(`mock ${method} result`)
        );
        result = await connection[method]('wibble', 'blee');
      });

      it(`returned the ${method} result`, () => {
        assert.equal(result, `mock ${method} result`);
      });

      it(`called redisClient.${method} correctly`, () => {
        assert.equal(redisClient[clientMethod].callCount, 1);
        const args = redisClient[clientMethod].args[0];
        assert.lengthOf(args, 2);
        assert.equal(args[0], 'wibble');
        assert.equal(args[1], 'blee');
      });
    });

    describe(`redisClient.${method} error:`, () => {
      beforeEach(() => {
        redisClient[clientMethod] = sinon.spy(() =>
          Promise.reject({ message: `mock ${method} error` })
        );
      });

      describe(`redisConnection.${method}:`, () => {
        let error;

        beforeEach(() => {
          return connection[method]('wibble', 'blee').catch(e => (error = e));
        });

        it('rejected', () => {
          assert.deepEqual(error, { message: `mock ${method} error` });
        });

        it(`called redisClient.${method}`, () => {
          assert.equal(redisClient[clientMethod].callCount, 1);
        });
      });

      if (method === 'get') {
        describe('redisConnection.update:', () => {
          let error;

          beforeEach(() => {
            return connection
              .update('wibble', getValue)
              .catch(e => (error = e));
          });

          it('rejected', () => {
            assert.deepEqual(error, { message: 'mock get error' });
          });

          it('called redisClient.watch', () => {
            assert.equal(redisClient.watchAsync.callCount, 1);
          });

          it('called redisClient.get', () => {
            assert.equal(redisClient.getAsync.callCount, 1);
          });

          it('did not call getValue', () => {
            assert.equal(getValue.callCount, 0);
          });

          it('did not call redisClient.multi', () => {
            assert.equal(redisClient.multi.callCount, 0);
          });

          it('did not call redisMulti.set', () => {
            assert.equal(redisMulti.set.callCount, 0);
          });

          it('did not call redisMulti.del', () => {
            assert.equal(redisMulti.del.callCount, 0);
          });

          it('did not call redisMulti.exec', () => {
            assert.equal(redisMulti.execAsync.callCount, 0);
          });

          it('called log.error correctly', () => {
            assert.equal(log.error.callCount, 1);
            const args = log.error.args[0];
            assert.lengthOf(args, 2);
            assert.equal(args[0], 'redis.update.error');
            assert.deepEqual(args[1], {
              key: 'wibble',
              error: 'mock get error',
            });
          });

          it('called redisClient.unwatch correctly', () => {
            assert.equal(redisClient.unwatch.callCount, 1);
            assert.lengthOf(redisClient.unwatch.args[0], 0);
          });
        });
      }
    });
  });

  describe('redisConnection.destroy:', () => {
    let resolved;

    beforeEach(done => {
      connection.destroy().then(() => (resolved = true));
      setImmediate(done);
    });

    it('called redisClient.quit correctly', () => {
      assert.equal(redisClient.quit.callCount, 1);
      assert.lengthOf(redisClient.quit.args[0], 0);
    });

    it('called redisClient.on correctly', () => {
      assert.equal(redisClient.on.callCount, 1);
      const args = redisClient.on.args[0];
      assert.lengthOf(args, 2);
      assert.equal(args[0], 'end');
      assert.isFunction(args[1]);
    });

    it('did not resolve', () => {
      assert.isUndefined(resolved);
    });

    it('redisConnection.isValid returns false', () => {
      assert.isFalse(connection.isValid());
    });

    describe('redisConnection.destroy:', () => {
      let innerResolved;

      beforeEach(done => {
        connection.destroy().then(() => (innerResolved = true));
        setImmediate(done);
      });

      it('did not call redisClient.quit a second time', () => {
        assert.equal(redisClient.quit.callCount, 1);
      });

      it('did not call redisClient.on a second time', () => {
        assert.equal(redisClient.on.callCount, 1);
      });

      it('did not resolve', () => {
        assert.isUndefined(innerResolved);
      });

      describe('end event handler:', () => {
        beforeEach(done => {
          redisClient.on.args[0][1]();
          setImmediate(done);
        });

        it('resolved the outer promise', () => {
          assert.isTrue(resolved);
        });

        it('resolved the inner promise', () => {
          assert.isTrue(innerResolved);
        });
      });
    });
  });

  describe('redisMulti.exec error:', () => {
    beforeEach(() => {
      redisClient.getAsync = sinon.spy(() =>
        Promise.resolve('mock get result')
      );
      redisMulti.execAsync = sinon.spy(() =>
        Promise.reject({ message: 'mock exec error' })
      );
    });

    describe('redisConnection.update:', () => {
      let error;

      beforeEach(() => {
        return connection.update('wibble', getValue).catch(e => (error = e));
      });

      it('rejected', () => {
        assert.deepEqual(error, { message: 'mock exec error' });
      });

      it('called redisClient.watch', () => {
        assert.equal(redisClient.watchAsync.callCount, 1);
      });

      it('called redisClient.get', () => {
        assert.equal(redisClient.getAsync.callCount, 1);
      });

      it('called getValue', () => {
        assert.equal(getValue.callCount, 1);
      });

      it('called redisClient.multi', () => {
        assert.equal(redisClient.multi.callCount, 1);
      });

      it('called redisMulti.set', () => {
        assert.equal(redisMulti.set.callCount, 1);
      });

      it('called redisMulti.exec', () => {
        assert.equal(redisMulti.execAsync.callCount, 1);
      });

      it('called redisClient.unwatch', () => {
        assert.equal(redisClient.unwatch.callCount, 1);
      });

      it('called log.error correctly', () => {
        assert.equal(log.error.callCount, 1);
        const args = log.error.args[0];
        assert.lengthOf(args, 2);
        assert.equal(args[0], 'redis.update.error');
        assert.deepEqual(args[1], { key: 'wibble', error: 'mock exec error' });
      });

      it('did not call redisMulti.del', () => {
        assert.equal(redisMulti.del.callCount, 0);
      });
    });
  });

  describe('redisMulti.exec returns null:', () => {
    beforeEach(() => {
      redisClient.getAsync = sinon.spy(() =>
        Promise.resolve('mock get result')
      );
      redisMulti.execAsync = sinon.spy(() => Promise.resolve(null));
    });

    describe('redisConnection.update:', () => {
      let error;

      beforeEach(() => {
        return connection.update('wibble', getValue).catch(e => (error = e));
      });

      it('rejected', () => {
        assert.instanceOf(error, Error);
        assert.equal(error.message, 'redis.watch.conflict');
      });

      it('called redisClient.watch', () => {
        assert.equal(redisClient.watchAsync.callCount, 1);
      });

      it('called redisClient.get', () => {
        assert.equal(redisClient.getAsync.callCount, 1);
      });

      it('called getValue', () => {
        assert.equal(getValue.callCount, 1);
      });

      it('called redisClient.multi', () => {
        assert.equal(redisClient.multi.callCount, 1);
      });

      it('called redisMulti.set', () => {
        assert.equal(redisMulti.set.callCount, 1);
      });

      it('called redisMulti.exec', () => {
        assert.equal(redisMulti.execAsync.callCount, 1);
      });

      it('called log.warn correctly', () => {
        assert.equal(log.error.callCount, 0);
        assert.equal(log.warn.callCount, 1);
        const args = log.warn.args[0];
        assert.lengthOf(args, 2);
        assert.equal(args[0], 'redis.watch.conflict');
        assert.deepEqual(args[1], { key: 'wibble' });
      });

      it('did not call redisMulti.del', () => {
        assert.equal(redisMulti.del.callCount, 0);
      });

      it('did not call redisClient.unwatch', () => {
        assert.equal(redisClient.unwatch.callCount, 0);
      });
    });
  });
});
