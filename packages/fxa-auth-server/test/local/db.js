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

  let results, pool, redis, log, tokens, db

  beforeEach(() => {
    results = {}
    pool = {
      get: sinon.spy(() => P.resolve(results.pool)),
      post: sinon.spy(() => P.resolve()),
      put: sinon.spy(() => P.resolve())
    }
    redis = {
      getAsync: sinon.spy(() => P.resolve(results.redis)),
      setAsync: sinon.spy(() => P.resolve())
    }
    log = mocks.mockLog()
    tokens = require(`${LIB_DIR}/tokens`)(log, { tokenLifetimes })
    const DB = proxyquire(`${LIB_DIR}/db`, {
      './pool': function () { return pool },
      redis: { createClient: () => redis }
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
      results.redis = []
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

  let results, pool, redis, log, tokens, db

  beforeEach(() => {
    results = {}
    pool = {
      get: sinon.spy(() => P.resolve(results.pool)),
      post: sinon.spy(() => P.resolve()),
      put: sinon.spy(() => P.resolve())
    }
    redis = {
      getAsync: sinon.spy(() => P.resolve(results.redis)),
      setAsync: sinon.spy(() => P.resolve())
    }
    log = mocks.mockLog()
    tokens = require(`${LIB_DIR}/tokens`)(log, { tokenLifetimes })
    const DB = proxyquire(`${LIB_DIR}/db`, {
      './pool': function () { return pool },
      redis: { createClient: () => redis }
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
      results.redis = []
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
      .then(result => db = result)
  })

  afterEach(() => {
    pool.get.reset()
    pool.post.reset()
    pool.del.reset()

    redis.getAsync.reset()
    redis.setAsync.reset()
    redis.del.reset()
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

