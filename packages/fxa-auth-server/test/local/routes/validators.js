/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')

const validators = require('../../../lib/routes/validators')

describe('redirectTo() validator', () => {
  describe('with no base hostname', () => {
    const v = validators.redirectTo()

    it('accepts a well-formed https:// URL', function () {
      const res = v.validate('https://example.com/path')
      assert.ok(! res.error)
      assert.equal(res.value, 'https://example.com/path')
    })

    it('accepts a well-formed http:// URL', function () {
      const res = v.validate('http://example.com/path')
      assert.ok(! res.error)
      assert.equal(res.value, 'http://example.com/path')
    })

    it('rejects a non-URL string', function () {
      const res = v.validate('not a url')
      assert.ok(res.error)
      assert.equal(res.value, 'not a url')
    })

    it('rejects a non-http(s) URL', function () {
      const res = v.validate('mailto:test@example.com')
      assert.ok(res.error)
      assert.equal(res.value, 'mailto:test@example.com')
    })

    it('normalizes trisky quoted chars in the hostname', function () {
      const res = v.validate('https://example.com%2Eevil.com')
      assert.ok(! res.error)
      assert.equal(res.value, 'https://example.com/%2Eevil.com')
    })
  })

  describe('with a base hostname', () => {
    const v = validators.redirectTo('mozilla.com')

    it('accepts a well-formed https:// URL at the base hostname', function () {
      const res = v.validate('https://test.mozilla.com/path')
      assert.ok(! res.error)
      assert.equal(res.value, 'https://test.mozilla.com/path')
    })

    it('accepts a well-formed http:// URL at the base hostname', function () {
      const res = v.validate('http://test.mozilla.com/path')
      assert.ok(! res.error)
      assert.equal(res.value, 'http://test.mozilla.com/path')
    })

    it('rejects a non-URL string', function () {
      const res = v.validate('not a url')
      assert.ok(res.error)
      assert.equal(res.value, 'not a url')
    })

    it('rejects a non-http(s) URL at the base hostname', function () {
      const res = v.validate('irc://irc.mozilla.com/#fxa')
      assert.ok(res.error)
      assert.equal(res.value, 'irc://irc.mozilla.com/#fxa')
    })

    it('rejects a well-formed https:// URL at a different hostname', function () {
      const res = v.validate('https://test.example.com/path')
      assert.ok(res.error)
      assert.equal(res.value, 'https://test.example.com/path')
    })

    it('accepts a well-formed http:// URL at a different hostname', function () {
      const res = v.validate('http://test.example.com/path')
      assert.ok(res.error)
      assert.equal(res.value, 'http://test.example.com/path')
    })

    it('normalizes trisky quoted chars after the base hostname', function () {
      const res = v.validate('https://mozilla.com%2Eevil.com')
      assert.ok(! res.error)
      assert.equal(res.value, 'https://mozilla.com/%2Eevil.com')
    })

    it('rejects trisky quoted chars before the base hostname', function () {
      const res = v.validate('https://evil.com%2Emozilla.com')
      assert.ok(res.error)
      assert.equal(res.value, 'https://evil.com%2Emozilla.com')
    })
  })
})
