/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('assert')
const random = require('./random')

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

// some sanity checks, hard to test, private to this mdoule
assert.equal(ALPHABET.length, 32, 'ALPHABET is 32 characters')
assert.equal(ALPHABET.indexOf('I'), -1, 'should not contain I')
assert.equal(ALPHABET.indexOf('L'), -1, 'should not contain L')
assert.equal(ALPHABET.indexOf('O'), -1, 'should not contain O')
assert.equal(ALPHABET.indexOf('U'), -1, 'should not contain U')

function base32(len) {
  return random(len)
    .then(bytes => {
      const out = []

      for (let i = 0; i < len; i++) {
        out.push(ALPHABET[bytes[i] % 32])
      }

      return out.join('')
    })
}

module.exports = (len) => {
  return () => {
    return base32(len)
  }
}
