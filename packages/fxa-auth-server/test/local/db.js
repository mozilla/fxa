/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const LIB_DIR = '../../lib'

const assert = require('insist')
const mocks = require('../mocks')
const P = require(`${LIB_DIR}/promise`)
const proxyquire = require('proxyquire')
const sinon = require('sinon')

describe('db, session tokens expire:', () => {
  const tokenLifetimes = {
    sessionTokenWithoutDevice: 2419200000
  }

  let results, pool, log, tokens, db

  beforeEach(() => {
    results = {}
    pool = {
      get: sinon.spy(() => P.resolve(results.pool)),
      post: sinon.spy(() => P.resolve()),
      put: sinon.spy(() => P.resolve())
    }
    log = mocks.mockLog()
    tokens = require(`${LIB_DIR}/tokens`)(log, { tokenLifetimes })
    const DB = proxyquire(`${LIB_DIR}/db`, {
      './pool': function () { return pool }
    })({ tokenLifetimes, redis: {} }, log, tokens, {})
    return DB.connect({})
      .then(result => db = result)
  })

  describe('sessions:', () => {
    let sessions

    beforeEach(() => {
      const now = Date.now()
      results.pool = [
        { createdAt: now, tokenId: 'foo' },
        { createdAt: now - tokenLifetimes.sessionTokenWithoutDevice - 1, tokenId: 'bar' },
        { createdAt: now - tokenLifetimes.sessionTokenWithoutDevice + 1000, tokenId: 'baz' },
        { createdAt: now - tokenLifetimes.sessionTokenWithoutDevice - 1, tokenId: 'qux', deviceId: 'wibble' }
      ]
      return db.sessions()
        .then(result => sessions = result)
    })

    it('returned the correct result', () => {
      assert(Array.isArray(sessions))
      assert.equal(sessions.length, 3)
      assert.equal(sessions[0].id, 'foo')
      assert.equal(sessions[1].id, 'baz')
      assert.equal(sessions[2].id, 'qux')
    })
  })
})

describe('db, session tokens do not expire:', () => {
  const tokenLifetimes = {
    sessionTokenWithoutDevice: 0
  }

  let results, pool, log, tokens, db

  beforeEach(() => {
    results = {}
    pool = {
      get: sinon.spy(() => P.resolve(results.pool)),
      post: sinon.spy(() => P.resolve()),
      put: sinon.spy(() => P.resolve())
    }
    log = mocks.mockLog()
    tokens = require(`${LIB_DIR}/tokens`)(log, { tokenLifetimes })
    const DB = proxyquire(`${LIB_DIR}/db`, {
      './pool': function () { return pool }
    })({ tokenLifetimes, redis: {} }, log, tokens, {})
    return DB.connect({})
      .then(result => db = result)
  })

  describe('sessions:', () => {
    let sessions

    beforeEach(() => {
      const now = Date.now()
      results.pool = [
        { createdAt: now, tokenId: 'foo' },
        { createdAt: now - tokenLifetimes.sessionTokenWithoutDevice - 1, tokenId: 'bar' },
        { createdAt: now - tokenLifetimes.sessionTokenWithoutDevice + 1000, tokenId: 'baz' },
        { createdAt: now - tokenLifetimes.sessionTokenWithoutDevice - 1, tokenId: 'qux', deviceId: 'wibble' }
      ]
      return db.sessions()
        .then(result => sessions = result)
    })

    it('returned the correct result', () => {
      assert.equal(sessions.length, 4)
      assert.equal(sessions[0].id, 'foo')
      assert.equal(sessions[1].id, 'bar')
      assert.equal(sessions[2].id, 'baz')
      assert.equal(sessions[3].id, 'qux')
    })
  })
})

describe('db with redis disabled', () => {

  const tokenLifetimes = {
    sessionTokenWithoutDevice: 2419200000
  }

  let results, pool, redis, log, tokens, db

  beforeEach(() => {
    results = {}
    pool = {
      get: sinon.spy(() => P.resolve(results.pool)),
      post: sinon.spy(() => P.resolve()),
      del: sinon.spy(() => P.resolve())
    }

    redis = {
      on: sinon.spy(),
      getAsync: sinon.spy(() => P.resolve(results.redis)),
      setAsync: sinon.spy(() => P.resolve()),
      del: sinon.spy(() => P.resolve())
    }

    log = mocks.mockLog()
    tokens = require(`${LIB_DIR}/tokens`)(log, { tokenLifetimes })
    const DB = proxyquire(`${LIB_DIR}/db`, {
      './pool': function () { return pool },
      redis: { createClient: () => redis }
    })({ tokenLifetimes, redis: {enabled: false} }, log, tokens, {})
    return DB.connect({})
      .then(result => {
        assert.equal(redis.on.callCount, 0, 'redis.on was not called')

        db = result
      })
  })

  it('should not call redis when reading sessions', () => {
    results.pool = []
    return db.sessions('fakeUid')
      .then(result => {
        assert.equal(pool.get.lastCall.args[0], '/account/fakeUid/sessions')
        assert.equal(redis.getAsync.lastCall, null)
        assert.deepEqual(result, [])
      })
  })

  it('should not call redis when reading devices', () => {
    results.pool = []
    return db.devices('fakeUid')
      .then(result => {
        assert.equal(pool.get.lastCall.args[0], '/account/fakeUid/devices')
        assert.equal(redis.getAsync.lastCall, null)
        assert.deepEqual(result, [])
      })
  })

  it('should not call redis when deleting account', () => {
    results.pool = []
    return db.deleteAccount({uid: 'fakeUid'})
      .then(() => {
        assert.equal(pool.del.lastCall.args[0], '/account/fakeUid')
        assert.equal(redis.del.lastCall, null)
      })
  })

  it('should not call redis when deleting sessionTokens', () => {
    results.pool = []
    return db.deleteSessionToken({id: 'fakeId'})
      .then(() => {
        assert.equal(pool.del.lastCall.args[0], '/sessionToken/fakeId')
        assert.equal(redis.getAsync.lastCall, null)
        assert.equal(redis.setAsync.lastCall, null)
      })
  })

  it('should not call redis when resetting account', () => {
    results.pool = []
    return db.resetAccount({uid: 'fakeUid'}, {})
      .then(() => {
        assert.equal(pool.post.lastCall.args[0], '/account/fakeUid/reset')
        assert.equal(redis.del.lastCall, null)
      })
  })
})

describe('redis enabled', () => {
  const tokenLifetimes = {
    sessionTokenWithoutDevice: 2419200000
  }

  let pool, redis, log, tokens, db

  beforeEach(() => {
    pool = {
      get: sinon.spy(() => P.resolve([])),
      post: sinon.spy(() => P.resolve()),
      del: sinon.spy(() => P.resolve())
    }
    redis = {
      on: sinon.spy(),
      getAsync: sinon.spy(() => P.resolve()),
      setAsync: sinon.spy(() => P.resolve()),
      del: sinon.spy(() => P.resolve())
    }
    const createClient = sinon.spy(() => redis)
    log = mocks.mockLog()
    tokens = require(`${LIB_DIR}/tokens`)(log, { tokenLifetimes })
    const DB = proxyquire(`${LIB_DIR}/db`, {
      './pool': function () { return pool },
      redis: { createClient }
    })({
      tokenLifetimes,
      redis: {
        enabled: true,
        host: 'foo',
        port: 'bar',
        sessionsKeyPrefix: 'baz'
      },
      lastAccessTimeUpdates: {
        enabled: true,
        sampleRate: 1,
        earliestSaneTimestamp: 1
      }
    }, log, tokens, {})
    return DB.connect({})
      .then(result => {
        assert.equal(createClient.callCount, 1, 'redis.createClient was called once')
        assert.equal(createClient.args[0].length, 1, 'redis.createClient was passed one argument')
        assert.deepEqual(createClient.args[0][0], {
          host: 'foo',
          port: 'bar',
          prefix: 'baz',
          enable_offline_queue: false
        }, 'redis.createClient was passed correct settings')

        assert.equal(redis.on.callCount, 1, 'redis.on was called once')
        assert.equal(redis.on.args[0].length, 2, 'redis.on was passed two arguments')
        assert.equal(redis.on.args[0][0], 'error', 'redis.on was called for the `error` event')
        assert.equal(typeof redis.on.args[0][1], 'function', 'redis.on was passed event handler')

        db = result
      })
  })

  it('should not call redis or the db in db.devices if uid is falsey', () => {
    return db.devices('')
      .then(
        result => assert.equal(result, 'db.devices should reject with error.unknownAccount'),
        err => {
          assert.equal(pool.get.callCount, 0)
          assert.equal(redis.getAsync.callCount, 0)
          assert.equal(err.errno, 102)
          assert.equal(err.message, 'Unknown account')
        }
      )
  })

  it('should call redis and the db in db.devices if uid is not falsey', () => {
    return db.devices('wibble')
      .then(() => {
        assert.equal(pool.get.callCount, 1)
        assert.equal(redis.getAsync.callCount, 1)
      })
  })

  describe('redis error:', () => {
    beforeEach(() => redis.on.args[0][1]({ message: 'foo', stack: 'bar' }))

    it('should log the error', () => {
      assert.equal(log.error.callCount, 1, 'log.error was called once')
      assert.equal(log.error.args[0].length, 1, 'log.error was passed one argument')
      assert.deepEqual(log.error.args[0][0], {
        op: 'db.redis.error',
        err: 'foo',
        stack: 'bar'
      }, 'log.error was passed the error details')
    })
  })

  describe('redis.get error:', () => {
    beforeEach(() => redis.getAsync = sinon.spy(() => P.reject({ message: 'wibble' })))

    it('db.sessions should log the error', () => {
      return db.sessions('blee')
        .then(() => {
          assert.equal(redis.getAsync.callCount, 1, 'redis.get was called once')
          assert.equal(redis.getAsync.args[0].length, 1, 'redis.get was passed one argument')
          assert.equal(redis.getAsync.args[0][0], 'blee', 'redis.get was passed uid')

          assert.equal(log.error.callCount, 1, 'log.error was called once')
          assert.equal(log.error.args[0].length, 1, 'log.error was passed one argument')
          assert.deepEqual(log.error.args[0][0], {
            op: 'db.redis.get.error',
            method: 'sessions',
            err: 'wibble'
          }, 'log.error was passed the error details')
        })
    })

    it('db.devices should log the error', () => {
      return db.devices('blee')
        .then(() => {
          assert.equal(redis.getAsync.callCount, 1, 'redis.get was called once')
          assert.equal(redis.getAsync.args[0].length, 1, 'redis.get was passed one argument')
          assert.equal(redis.getAsync.args[0][0], 'blee', 'redis.get was passed uid')

          assert.equal(log.error.callCount, 1, 'log.error was called once')
          assert.equal(log.error.args[0].length, 1, 'log.error was passed one argument')
          assert.deepEqual(log.error.args[0][0], {
            op: 'db.redis.get.error',
            method: 'devices',
            err: 'wibble'
          }, 'log.error was passed the error details')
        })
    })

    it('db.updateSessionToken should fail', () => {
      return db.updateSessionToken({ uid: 'blee' }, null, P.resolve({}))
        .then(
          () => assert.equal(false, 'db.updateSessionToken should reject'),
          err => {
            assert.deepEqual(err, { message: 'wibble' }, 'db.updateSessionToken rejected with error object')

            assert.equal(redis.getAsync.callCount, 1, 'redis.get was called once')
            assert.equal(redis.getAsync.args[0].length, 1, 'redis.get was passed one argument')
            assert.equal(redis.getAsync.args[0][0], 'blee', 'redis.get was passed uid')

            assert.equal(redis.setAsync.callCount, 0, 'redis.set was not called')
          }
        )
    })
  })

  describe('redis.set error:', () => {
    beforeEach(() => redis.setAsync = sinon.spy(() => P.reject({ message: 'wibble' })))

    it('db.updateSessionToken should fail', () => {
      return db.updateSessionToken({ uid: 'blee' }, null, P.resolve({}))
        .then(
          () => assert.equal(false, 'db.updateSessionToken should reject'),
          err => {
            assert.deepEqual(err, { message: 'wibble' }, 'db.updateSessionToken rejected with error object')

            assert.equal(redis.getAsync.callCount, 1, 'redis.get was called once')
            assert.equal(redis.setAsync.callCount, 1, 'redis.set was called once')
          }
        )
    })
  })
})

