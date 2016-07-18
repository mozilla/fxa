/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('tap').test
var butil = require('../../lib/crypto/butil')

test(
  'buffersAreEqual returns false if lengths are different',
  function (t) {
    t.equal(butil.buffersAreEqual(Buffer(2), Buffer(4)), false)
    t.end()
  }
)

test(
  'buffersAreEqual returns true if buffers have same bytes',
  function (t) {
    var b1 = Buffer('abcd', 'hex')
    var b2 = Buffer('abcd', 'hex')
    t.equal(butil.buffersAreEqual(b1, b2), true)
    t.end()
  }
)

test(
  'xorBuffers throws an Error if lengths are different',
  function (t) {
    try {
      butil.xorBuffers(Buffer(2), Buffer(4))
    }
    catch (e) {
      return t.end()
    }
    t.fail('did not throw')
  }
)

test(
  'xorBuffers works',
  function (t) {
    var b1 = Buffer('e5', 'hex')
    var b2 = Buffer('5e', 'hex')
    t.deepEqual(butil.xorBuffers(b1, b2), Buffer('bb', 'hex'))
    t.end()
  }
)

test(
  'bufferize works',
  function (t) {
    var argument = { foo: 'bar', baz: 'f00d' }
    var result = butil.bufferize(argument)
    t.notEqual(result, argument)
    t.equal(Object.keys(result).length, Object.keys(argument).length)
    t.equal(typeof result.foo, 'string')
    t.equal(result.foo, argument.foo)
    t.ok(Buffer.isBuffer(result.baz))
    t.equal(result.baz.length, 2)
    t.equal(result.baz[0], 0xf0)
    t.equal(result.baz[1], 0x0d)
    t.end()
  }
)

test(
  'bufferize works in-place',
  function (t) {
    var argument = { foo: 'beef', bar: 'baz' }
    var result = butil.bufferize(argument, { inplace: true })
    t.equal(result, argument)
    t.equal(Object.keys(result).length, 2)
    t.ok(Buffer.isBuffer(result.foo))
    t.equal(result.foo.length, 2)
    t.equal(result.foo[0], 0xbe)
    t.equal(result.foo[1], 0xef)
    t.equal(typeof result.bar, 'string')
    t.equal(result.bar, 'baz')
    t.end()
  }
)

test(
  'bufferize ignores exceptions',
  function (t) {
    var argument = { foo: 'bar', baz: 'f00d', qux: 'beef' }
    var result = butil.bufferize(argument, { ignore: [ 'baz' ] })
    t.notEqual(argument, result)
    t.equal(Object.keys(result).length, Object.keys(argument).length)
    t.equal(typeof result.foo, 'string')
    t.equal(result.foo, argument.foo)
    t.equal(typeof result.baz, 'string')
    t.equal(result.baz, argument.baz)
    t.ok(Buffer.isBuffer(result.qux))
    t.equal(result.qux.length, 2)
    t.equal(result.qux[0], 0xbe)
    t.equal(result.qux[1], 0xef)
    t.end()
  }
)

