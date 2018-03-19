/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const LIB_DIR = '../../../lib'

const assert = require('insist')
const mocks = require('../../mocks')
const P = require(`${LIB_DIR}/promise`)
const proxyquire = require('proxyquire')
const sinon = require('sinon')

describe('redis disabled:', () => {
  let log, pool, result

  before(() => {
    log = mocks.mockLog()
    pool = { acquire: sinon.spy() }
    result = proxyquire(`${LIB_DIR}/redis`, {
      './pool': pool
    })({ enabled: false }, log)
  })

  it('did not call pool.acquire', () => {
    assert.equal(pool.acquire.callCount, 0)
  })

  it('called log.info correctly', () => {
    assert.equal(log.info.callCount, 1)
    const args = log.info.args[0]
    assert.equal(args.length, 1)
    assert.deepEqual(args[0], { op: 'redis.disabled' })
  })

  it('returned undefined', () => {
    assert.equal(result, undefined)
  })
})

describe('redis enabled:', () => {
  let config, log, connection, dispose, pool, initialisePool, redis

  beforeEach(() => {
    config = { enabled: true }
    log = mocks.mockLog()
    connection = {
      get: sinon.spy(() => 'mock get result'),
      set: sinon.spy(),
      del: sinon.spy(),
      update: sinon.spy()
    }
    dispose = sinon.spy()
    pool = { acquire: sinon.spy(() => P.resolve(connection).disposer(dispose)) }
    initialisePool = sinon.spy(() => pool)
    redis = proxyquire(`${LIB_DIR}/redis`, { './pool': initialisePool })(config, log)
  })

  it('called log.info correctly', () => {
    assert.equal(log.info.callCount, 1)
    const args = log.info.args[0]
    assert.equal(args.length, 1)
    assert.deepEqual(args[0], { op: 'redis.enabled', config })
  })

  it('initialised pool correctly', () => {
    assert.equal(initialisePool.callCount, 1)
    const args = initialisePool.args[0]
    assert.equal(args.length, 2)
    assert.equal(args[0], config)
    assert.equal(args[1], log)
  })

  it('returned interface', () => {
    assert.equal(Object.keys(redis).length, 4)
    assert.equal(typeof redis.get, 'function')
    assert.equal(typeof redis.set, 'function')
    assert.equal(typeof redis.del, 'function')
    assert.equal(typeof redis.update, 'function')
  })

  it('did not call pool.acquire', () => {
    assert.equal(pool.acquire.callCount, 0)
  })

  describe('redis.get:', () => {
    let result

    beforeEach(() => {
      return redis.get('foo')
        .then(r => result = r)
    })

    it('called pool.acquire correctly', () => {
      assert.equal(pool.acquire.callCount, 1)
      assert.equal(pool.acquire.args[0].length, 0)
    })

    it('called connection.get correctly', () => {
      assert.equal(connection.get.callCount, 1)
      const args = connection.get.args[0]
      assert.equal(args.length, 1)
      assert.equal(args[0], 'foo')
    })

    it('called dispose correctly', () => {
      assert.equal(dispose.callCount, 1)
      const args = dispose.args[0]
      assert.equal(args.length, 2)
      assert.equal(args[0], connection)
    })

    it('returned the get result', () => {
      assert.equal(result, 'mock get result')
    })

    it('did not call any other connection methods', () => {
      assert.equal(connection.set.callCount, 0)
      assert.equal(connection.del.callCount, 0)
      assert.equal(connection.update.callCount, 0)
    })
  })

  describe('redis.set:', () => {
    beforeEach(() => {
      return redis.set('wibble', 'blee')
    })

    it('called pool.acquire correctly', () => {
      assert.equal(pool.acquire.callCount, 1)
      assert.equal(pool.acquire.args[0].length, 0)
    })

    it('called connection.set correctly', () => {
      assert.equal(connection.set.callCount, 1)
      const args = connection.set.args[0]
      assert.equal(args.length, 2)
      assert.equal(args[0], 'wibble')
      assert.equal(args[1], 'blee')
    })

    it('called dispose correctly', () => {
      assert.equal(dispose.callCount, 1)
      const args = dispose.args[0]
      assert.equal(args.length, 2)
      assert.equal(args[0], connection)
    })

    it('did not call any other connection methods', () => {
      assert.equal(connection.get.callCount, 0)
      assert.equal(connection.del.callCount, 0)
      assert.equal(connection.update.callCount, 0)
    })
  })

  describe('redis.del:', () => {
    beforeEach(() => {
      return redis.del('foo')
    })

    it('called pool.acquire correctly', () => {
      assert.equal(pool.acquire.callCount, 1)
      assert.equal(pool.acquire.args[0].length, 0)
    })

    it('called connection.del correctly', () => {
      assert.equal(connection.del.callCount, 1)
      const args = connection.del.args[0]
      assert.equal(args.length, 1)
      assert.equal(args[0], 'foo')
    })

    it('called dispose correctly', () => {
      assert.equal(dispose.callCount, 1)
      const args = dispose.args[0]
      assert.equal(args.length, 2)
      assert.equal(args[0], connection)
    })

    it('did not call any other connection methods', () => {
      assert.equal(connection.get.callCount, 0)
      assert.equal(connection.set.callCount, 0)
      assert.equal(connection.update.callCount, 0)
    })
  })

  describe('redis.update:', () => {
    beforeEach(() => {
      return redis.update('bar', 'baz')
    })

    it('called pool.acquire correctly', () => {
      assert.equal(pool.acquire.callCount, 1)
      assert.equal(pool.acquire.args[0].length, 0)
    })

    it('called connection.update correctly', () => {
      assert.equal(connection.update.callCount, 1)
      const args = connection.update.args[0]
      assert.equal(args.length, 2)
      assert.equal(args[0], 'bar')
      assert.equal(args[1], 'baz')
    })

    it('called dispose correctly', () => {
      assert.equal(dispose.callCount, 1)
      const args = dispose.args[0]
      assert.equal(args.length, 2)
      assert.equal(args[0], connection)
    })

    it('did not call any other connection methods', () => {
      assert.equal(connection.get.callCount, 0)
      assert.equal(connection.set.callCount, 0)
      assert.equal(connection.del.callCount, 0)
    })
  })

  describe('connection methods fail:', () => {
    beforeEach(() => {
      connection.get = sinon.spy(() => P.reject('foo'))
      connection.set = sinon.spy(() => P.reject('bar'))
      connection.del = sinon.spy(() => P.reject('baz'))
      connection.update = sinon.spy(() => P.reject('qux'))
    })

    describe('redis.get:', () => {
      let error

      beforeEach(() => {
        return redis.get('wibble')
          .catch(e => error = e)
      })

      it('called dispose', () => {
        assert.equal(dispose.callCount, 1)
      })

      it('propagated the error', () => {
        assert.equal(error, 'foo')
      })
    })

    describe('redis.set:', () => {
      let error

      beforeEach(() => {
        return redis.set('wibble', 'blee')
          .catch(e => error = e)
      })

      it('called dispose', () => {
        assert.equal(dispose.callCount, 1)
      })

      it('propagated the error', () => {
        assert.equal(error, 'bar')
      })
    })

    describe('redis.del:', () => {
      let error

      beforeEach(() => {
        return redis.del('wibble')
          .catch(e => error = e)
      })

      it('called dispose', () => {
        assert.equal(dispose.callCount, 1)
      })

      it('propagated the error', () => {
        assert.equal(error, 'baz')
      })
    })

    describe('redis.update:', () => {
      let error

      beforeEach(() => {
        return redis.update('wibble', 'blee')
          .catch(e => error = e)
      })

      it('called dispose', () => {
        assert.equal(dispose.callCount, 1)
      })

      it('propagated the error', () => {
        assert.equal(error, 'qux')
      })
    })
  })
})

