/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('assert')
const butil = require('../../../lib/crypto/butil')

describe('butil', () => {

  describe('.buffersAreEqual', () => {

    it(
      'returns false if lengths are different',
      () => {
        assert.equal(butil.buffersAreEqual(Buffer(2), Buffer(4)), false)
      }
    )

    it(
      'returns true if buffers have same bytes',
      () => {
        const b1 = Buffer('abcd', 'hex')
        const b2 = Buffer('abcd', 'hex')
        assert.equal(butil.buffersAreEqual(b1, b2), true)
      }
    )

  })

  describe('.xorBuffers', () => {

    it(
      'throws an Error if lengths are different',
      () => {
        assert.throws(() => {
          butil.xorBuffers(Buffer(2), Buffer(4))
        })
      }
    )

    it(
      'should return a Buffer with bits ORed',
      () => {
        const b1 = Buffer('e5', 'hex')
        const b2 = Buffer('5e', 'hex')
        assert.deepEqual(butil.xorBuffers(b1, b2), Buffer('bb', 'hex'))
      }
    )

  })

  describe('.bufferize', () => {
    it(
      'should bufferize hex-looking values',
      () => {
        const argument = { foo: 'bar', baz: 'f00d' }
        const result = butil.bufferize(argument)
        assert.notEqual(result, argument)
        assert.equal(Object.keys(result).length, Object.keys(argument).length)
        assert.equal(typeof result.foo, 'string')
        assert.equal(result.foo, argument.foo)
        assert.ok(Buffer.isBuffer(result.baz))
        assert.equal(result.baz.length, 2)
        assert.equal(result.baz[0], 0xf0)
        assert.equal(result.baz[1], 0x0d)
      }
    )

    it(
      'should convert in-place',
      () => {
        const argument = { foo: 'beef', bar: 'baz' }
        const result = butil.bufferize(argument, { inplace: true })
        assert.equal(result, argument)
        assert.equal(Object.keys(result).length, 2)
        assert.ok(Buffer.isBuffer(result.foo))
        assert.equal(result.foo.length, 2)
        assert.equal(result.foo[0], 0xbe)
        assert.equal(result.foo[1], 0xef)
        assert.equal(typeof result.bar, 'string')
        assert.equal(result.bar, 'baz')
      }
    )

    it(
      'should ignore exceptions',
      () => {
        const argument = { foo: 'bar', baz: 'f00d', qux: 'beef' }
        const result = butil.bufferize(argument, { ignore: [ 'baz' ] })
        assert.notEqual(argument, result)
        assert.equal(Object.keys(result).length, Object.keys(argument).length)
        assert.equal(typeof result.foo, 'string')
        assert.equal(result.foo, argument.foo)
        assert.equal(typeof result.baz, 'string')
        assert.equal(result.baz, argument.baz)
        assert.ok(Buffer.isBuffer(result.qux))
        assert.equal(result.qux.length, 2)
        assert.equal(result.qux[0], 0xbe)
        assert.equal(result.qux[1], 0xef)
      }
    )
  })

})
