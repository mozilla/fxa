/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('insist')
const base32 = require('../../lib/crypto/base32')

describe('base32', () => {
  it('takes 1 integer argument, returns a function', () => {
    assert.equal(typeof base32, 'function')
    assert.equal(base32.length, 1)
    const gen = base32(10)
    assert.equal(typeof gen, 'function')
    assert.equal(gen.length, 0)
  })

  it('should have correct output', () => {
    const gen = base32(10)
    return gen().then(code => {
      assert.equal(code.length, 10, 'matches length')
      assert.ok(/^[0-9A-Z]+$/.test(code), 'no lowercase letters')
      assert.equal(code.indexOf('I'), -1, 'no I')
      assert.equal(code.indexOf('L'), -1, 'no L')
      assert.equal(code.indexOf('O'), -1, 'no O')
      assert.equal(code.indexOf('U'), -1, 'no U')
    })
  })
})
