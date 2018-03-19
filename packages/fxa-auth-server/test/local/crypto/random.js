/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')

const random = require('../../../lib/crypto/random')

describe('random', () => {

  it('should generate random bytes', () => {
    return random(16)
      .then(bytes => {
        assert(Buffer.isBuffer(bytes))
        assert.equal(bytes.length, 16)

        return random(32)
      })
      .then(bytes => {
        assert(Buffer.isBuffer(bytes))
        assert.equal(bytes.length, 32)
      })
  })

  it('should generate several random bytes buffers', () => {
    return random(16, 8)
      .then(bufs => {
        assert.equal(bufs.length, 2)

        const a = bufs[0]
        const b = bufs[1]

        assert(Buffer.isBuffer(a))
        assert.equal(a.length, 16)

        assert(Buffer.isBuffer(b))
        assert.equal(b.length, 8)
      })
  })

  describe('hex', () => {
    it('should generate a random hex string', () => {
      return random.hex(16)
        .then(str => {
          assert.equal(typeof str, 'string')
          assert(/^[0-9a-f]+$/g.test(str))
          assert.equal(str.length, 32)

          return random.hex(32)
        })
        .then(str => {
          assert.equal(typeof str, 'string')
          assert.equal(str.length, 64)
        })
    })

    it('should generate several random hex strings', () => {
      return random.hex(16, 8)
        .then(strs => {
          assert.equal(strs.length, 2)

          const a = strs[0]
          const b = strs[1]

          assert.equal(typeof a, 'string')
          assert(/^[0-9a-f]+$/g.test(a))
          assert.equal(a.length, 32)

          assert.equal(typeof b, 'string')
          assert(/^[0-9a-f]+$/g.test(b))
          assert.equal(b.length, 16)
        })
    })
  })
})
