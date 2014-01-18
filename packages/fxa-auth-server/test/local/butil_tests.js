/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

require('ass')
var test = require('tap').test
var butil = require('../../crypto/butil')

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
