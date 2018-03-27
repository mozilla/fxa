/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
const mocks = require('../mocks')

const SOME_DISALLOWED_GRAPHEMES = [
  '\t', '\n', '\r', ' ', '"', '&', '\'', '/', ':', ';',
  '=', '?', '@', '\\', '~', 'ß', 'π', '💩'
]

describe('require:', () => {
  let log, SafeUrl

  beforeEach(() => {
    log = mocks.mockLog()
    SafeUrl = require('../../lib/safe-url')(log)
  })

  it('returned the expected interface', () => {
    assert.equal(typeof SafeUrl, 'function')
    assert.equal(SafeUrl.length, 2)
  })

  describe('instantiate:', () => {
    let safeUrl

    beforeEach(() => {
      safeUrl = new SafeUrl('/foo/:bar', 'baz')
    })

    it('returned the expected interface', () => {
      assert.equal(typeof safeUrl.render, 'function')
      assert.equal(safeUrl.render.length, 0)
    })

    it('interpolates correctly', () => {
      assert.equal(safeUrl.render({ bar: 'wibble' }), '/foo/wibble')
    })

    it('did not call log.error', () => {
      assert.equal(log.error.callCount, 0)
    })

    it('logs an error and throws when param is missing', () => {
      assert.throws(() => safeUrl.render({}))
      assert.equal(log.error.callCount, 1)
      assert.deepEqual(log.error.args[0][0], {
        op: 'safeUrl.mismatch',
        keys: [],
        expected: [ 'bar' ],
        caller: 'baz'
      })
    })

    it('logs an error and throws when param has wrong key', () => {
      assert.throws(() => safeUrl.render({ qux: 'wibble' }))
      assert.equal(log.error.callCount, 1)
      assert.deepEqual(log.error.args[0][0], {
        op: 'safeUrl.unexpected',
        key: 'qux',
        expected: [ 'bar' ],
        caller: 'baz'
      })
    })

    it('logs an error and throws when param is empty string', () => {
      assert.throws(() => safeUrl.render({ bar: '' }))
      assert.equal(log.error.callCount, 1)
      assert.deepEqual(log.error.args[0][0], {
        op: 'safeUrl.bad',
        key: 'bar',
        value: '',
        caller: 'baz'
      })
    })

    it('logs an error and throws when param is object', () => {
      assert.throws(() => safeUrl.render({ bar: {} }))
      assert.equal(log.error.callCount, 1)
      assert.deepEqual(log.error.args[0][0], {
        op: 'safeUrl.bad',
        key: 'bar',
        value: {},
        caller: 'baz'
      })
    })

    SOME_DISALLOWED_GRAPHEMES.forEach(grapheme => {
      it(`logs an error and throws when param contains ${grapheme}`, () => {
        assert.throws(() => safeUrl.render({ bar: `wibble${grapheme}` }))
        assert.equal(log.error.callCount, 1)
        assert.deepEqual(log.error.args[0][0], {
          op: 'safeUrl.unsafe',
          key: 'bar',
          value: `wibble${grapheme}`,
          caller: 'baz'
        })
      })
    })
  })

  describe('instantiate with two params', () => {
    let safeUrl

    beforeEach(() => {
      safeUrl = new SafeUrl('/foo/:bar/:baz')
    })

    it('interpolates correctly', () => {
      assert.equal(safeUrl.render({ bar: 'wibble', baz: 'blee' }), '/foo/wibble/blee')
    })
  })
})

