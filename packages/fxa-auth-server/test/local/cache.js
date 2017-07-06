/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const ROOT_DIR = '../..'

const assert = require('insist')
const crypto = require('crypto')
const Memcached = require('memcached')
const mocks = require('../mocks')
const P = require(`${ROOT_DIR}/lib/promise`)
const sinon = require('sinon')

const modulePath = `${ROOT_DIR}/lib/cache`

describe('cache:', () => {
  let sandbox, log, cache, token, digest

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
    log = mocks.spyLog()
    cache = require(modulePath)(log, {
      memcached: {
        address: '127.0.0.1:1121',
        idle: 500,
        lifetime: 30
      }
    }, 'wibble')
    token = {
      uid: Buffer.alloc(32, 'cd'),
      id: 'deadbeef'
    }
    const hash = crypto.createHash('sha256')
    hash.update(token.uid)
    hash.update(token.id)
    digest = hash.digest('base64')
  })

  afterEach(() => sandbox.restore())

  it('exports the correct interface', () => {
    assert.ok(cache)
    assert.equal(typeof cache, 'object')
    assert.equal(Object.keys(cache).length, 3)
    assert.equal(typeof cache.del, 'function')
    assert.equal(cache.del.length, 1)
    assert.equal(typeof cache.get, 'function')
    assert.equal(cache.get.length, 1)
    assert.equal(typeof cache.set, 'function')
    assert.equal(cache.set.length, 2)
  })

  describe('memcached resolves:', () => {
    beforeEach(() => {
      sandbox.stub(Memcached.prototype, 'delAsync', () => P.resolve())
      sandbox.stub(Memcached.prototype, 'getAsync', () => P.resolve('mock get result'))
      sandbox.stub(Memcached.prototype, 'setAsync', () => P.resolve())
    })

    describe('del:', () => {
      beforeEach(() => {
        return cache.del(digest)
      })

      it('calls memcached.delAsync correctly', () => {
        assert.equal(Memcached.prototype.delAsync.callCount, 1)
        const args = Memcached.prototype.delAsync.args[0]
        assert.equal(args.length, 1)
        assert.equal(args[0], digest)

        assert.equal(Memcached.prototype.getAsync.callCount, 0)
        assert.equal(Memcached.prototype.setAsync.callCount, 0)
        assert.equal(log.error.callCount, 0)
      })
    })

    describe('get:', () => {
      let result

      beforeEach(() => {
        return cache.get(digest)
          .then(r => result = r)
      })

      it('returns the correct result', () => {
        assert.equal(result, 'mock get result')
      })

      it('calls memcached.getAsync correctly', () => {
        assert.equal(Memcached.prototype.getAsync.callCount, 1)
        const args = Memcached.prototype.getAsync.args[0]
        assert.equal(args.length, 1)
        assert.equal(args[0], digest)

        assert.equal(Memcached.prototype.delAsync.callCount, 0)
        assert.equal(Memcached.prototype.setAsync.callCount, 0)
        assert.equal(log.error.callCount, 0)
      })
    })

    describe('set:', () => {
      beforeEach(() => {
        return cache.set(digest, 'wibble')
      })

      it('calls memcached.setAsync correctly', () => {
        assert.equal(Memcached.prototype.setAsync.callCount, 1)
        const args = Memcached.prototype.setAsync.args[0]
        assert.equal(args.length, 3)
        assert.equal(args[0], digest)
        assert.equal(args[1], 'wibble')
        assert.equal(args[2], 30)

        assert.equal(Memcached.prototype.delAsync.callCount, 0)
        assert.equal(Memcached.prototype.getAsync.callCount, 0)
        assert.equal(log.error.callCount, 0)
      })
    })
  })

  describe('memcached rejects:', () => {
    beforeEach(() => {
      sandbox.stub(Memcached.prototype, 'delAsync', () => P.reject('foo'))
      sandbox.stub(Memcached.prototype, 'getAsync', () => P.reject('bar'))
      sandbox.stub(Memcached.prototype, 'setAsync', () => P.reject('baz'))
    })

    describe('del:', () => {
      let error

      beforeEach(() => {
        return cache.del(digest)
          .catch(e => error = e)
      })

      it('propagates the error', () => {
        assert.equal(error, 'foo')
      })
    })

    describe('get:', () => {
      let error

      beforeEach(() => {
        return cache.get(digest)
          .catch(e => error = e)
      })

      it('propagates the error', () => {
        assert.equal(error, 'bar')
      })
    })

    describe('set:', () => {
      let error

      beforeEach(() => {
        return cache.set(digest, 'wibble')
          .catch(e => error = e)
      })

      it('propagates the error', () => {
        assert.equal(error, 'baz')
      })
    })
  })
})

describe('null cache:', () => {
  let sandbox, log, cache, token

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
    log = mocks.spyLog()
    cache = require(modulePath)(log, {
      memcached: {
        address: 'none',
        idle: 500,
        lifetime: 30
      }
    }, 'wibble')
    token = {
      uid: Buffer.alloc(32, 'cd'),
      id: 'deadbeef'
    }
    sandbox.stub(Memcached.prototype, 'delAsync', () => P.resolve())
    sandbox.stub(Memcached.prototype, 'getAsync', () => P.resolve())
    sandbox.stub(Memcached.prototype, 'setAsync', () => P.resolve())
  })

  afterEach(() => sandbox.restore())

  describe('del:', () => {
    beforeEach(() => {
      return cache.del(token)
    })

    it('did not call memcached.delAsync', () => {
      assert.equal(Memcached.prototype.delAsync.callCount, 0)
    })
  })

  describe('get:', () => {
    beforeEach(() => {
      return cache.get(token)
    })

    it('did not call memcached.getAsync', () => {
      assert.equal(Memcached.prototype.getAsync.callCount, 0)
    })
  })

  describe('set:', () => {
    beforeEach(() => {
      return cache.set(token, {})
    })

    it('did not call memcached.setAsync', () => {
      assert.equal(Memcached.prototype.setAsync.callCount, 0)
    })
  })
})

