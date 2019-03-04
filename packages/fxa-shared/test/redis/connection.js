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
      warn: sinon.spy()
    };
    redisClient = {
      on: sinon.spy(),
      getAsync: sinon.spy(() => Promise.resolve('mock get result')),
      setAsync: sinon.spy(() => Promise.resolve()),
      delAsync: sinon.spy(() => Promise.resolve()),
      watchAsync: sinon.spy(() => Promise.resolve()),
      multi: sinon.spy(() => redisMulti),
      unwatch: sinon.spy(),
      quit: sinon.spy()
    };
    redisMulti = {
      execAsync: sinon.spy(() => Promise.resolve(true)),
      set: sinon.spy(),
      del: sinon.spy()
    };
    connection = redisConnection(log, redisClient);
    getValue = sinon.spy(() => 'mock value');
  });

  it('redisConnection.isValid returns true', () => {
    assert.isTrue(connection.isValid());
  });

  describe('redisConnection.get:', () => {
    let result;

    beforeEach(async () => {
      result = await connection.get('wibble');
    });

    it('returned the get result', () => {
      assert.equal(result, 'mock get result');
    });

    it('called redisClient.get correctly', () => {
      assert.equal(redisClient.getAsync.callCount, 1);
      const args = redisClient.getAsync.args[0];
      assert.lengthOf(args, 1);
      assert.equal(args[0], 'wibble');
    });
  });

  describe('redisConnection.set:', () => {
    beforeEach(() => {
      return connection.set('wibble', 'blee');
    });

    it('called redisClient.set correctly', () => {
      assert.equal(redisClient.setAsync.callCount, 1);
      const args = redisClient.setAsync.args[0];
      assert.lengthOf(args, 2);
      assert.equal(args[0], 'wibble');
      assert.equal(args[1], 'blee');
    });
  });

  describe('redisConnection.del:', () => {
    beforeEach(() => {
      return connection.del('wibble');
    });

    it('called redisClient.del correctly', () => {
      assert.equal(redisClient.delAsync.callCount, 1);
      const args = redisClient.delAsync.args[0];
      assert.lengthOf(args, 1);
      assert.equal(args[0], 'wibble');
    });
  });

  describe('redisConnection.update:', () => {
    beforeEach(() => {
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

  describe('redisConnection.destroy:', () => {
    let resolved;

    beforeEach(done => {
      connection.destroy()
        .then(() => resolved = true);
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
        connection.destroy()
          .then(() => innerResolved = true);
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

  describe('redisClient.get error:', () => {
    beforeEach(() => {
      redisClient.getAsync = sinon.spy(() => Promise.reject({ message: 'mock get error' }));
    });

    describe('redisConnection.get:', () => {
      let error;

      beforeEach(() => {
        return connection.get('wibble')
          .catch(e => error = e);
      });

      it('rejected', () => {
        assert.deepEqual(error, { message: 'mock get error' });
      });

      it('called redisClient.get', () => {
        assert.equal(redisClient.getAsync.callCount, 1);
      });
    });

    describe('redisConnection.update:', () => {
      let error;

      beforeEach(() => {
        return connection.update('wibble', getValue)
          .catch(e => error = e);
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
        assert.deepEqual(args[1], { key: 'wibble', error: 'mock get error' });
      });

      it('called redisClient.unwatch correctly', () => {
        assert.equal(redisClient.unwatch.callCount, 1);
        assert.lengthOf(redisClient.unwatch.args[0], 0);
      });
    });
  });

  describe('redisClient.set error:', () => {
    beforeEach(() => {
      redisClient.setAsync = sinon.spy(() => Promise.reject({ message: 'mock set error' }));
    });

    describe('redisConnection.set:', () => {
      let error;

      beforeEach(() => {
        return connection.set('wibble', 'blee')
          .catch(e => error = e);
      });

      it('rejected', () => {
        assert.deepEqual(error, { message: 'mock set error' });
      });

      it('called redisClient.set', () => {
        assert.equal(redisClient.setAsync.callCount, 1);
      });
    });
  });

  describe('redisClient.del error:', () => {
    beforeEach(() => {
      redisClient.delAsync = sinon.spy(() => Promise.reject({ message: 'mock del error' }));
    });

    describe('redisConnection.set:', () => {
      let error;

      beforeEach(() => {
        return connection.del('wibble')
          .catch(e => error = e);
      });

      it('rejected', () => {
        assert.deepEqual(error, { message: 'mock del error' });
      });

      it('called redisClient.del', () => {
        assert.equal(redisClient.delAsync.callCount, 1);
      });
    });
  });

  describe('redisMulti.exec error:', () => {
    beforeEach(() => {
      redisMulti.execAsync = sinon.spy(() => Promise.reject({ message: 'mock exec error' }));
    });

    describe('redisConnection.update:', () => {
      let error;

      beforeEach(() => {
        return connection.update('wibble', getValue)
          .catch(e => error = e);
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
      redisMulti.execAsync = sinon.spy(() => Promise.resolve(null));
    });

    describe('redisConnection.update:', () => {
      let error;

      beforeEach(() => {
        return connection.update('wibble', getValue)
          .catch(e => error = e);
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
