/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const test = require('tap').test
const base32 = require('../../lib/crypto/base32')

test('base32 takes 1 integer argument, returns a function', (t) => {
  t.equal(typeof base32, 'function')
  t.equal(base32.length, 1)
  const gen = base32(10)
  t.equal(typeof gen, 'function')
  t.equal(gen.length, 0)
  t.end()
})

test('base32 output', (t) => {
  const gen = base32(10)
  const code = gen()
  t.equal(code.length, 10, 'matches length')
  t.ok(/^[0-9A-Z]+$/.test(code), 'no lowercase letters')
  t.equal(code.indexOf('I'), -1, 'no I')
  t.equal(code.indexOf('L'), -1, 'no L')
  t.equal(code.indexOf('O'), -1, 'no O')
  t.equal(code.indexOf('U'), -1, 'no U')
  t.end()
})
