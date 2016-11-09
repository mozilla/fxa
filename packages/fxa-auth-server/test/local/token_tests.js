/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
var crypto = require('crypto')
var hkdf = require('../../lib/crypto/hkdf')
var mocks = require('../mocks')
var P = require('../../lib/promise')
var sinon = require('sinon')

var Bundle = {
  bundle: sinon.spy(),
  unbundle: sinon.spy()
}
var log = mocks.spyLog()
var modulePath = '../../lib/tokens/token'

describe('Token', () => {

  describe('NODE_ENV=dev', () => {
    let Token
    before(() => {
      delete require.cache[require.resolve(modulePath)]
      delete require.cache[require.resolve('../../config')]
      process.env.NODE_ENV = 'dev'
      Token = require(modulePath)(log, crypto, P, hkdf, Bundle, null)
    })

    it('Token constructor was exported', () => {
      assert.equal(typeof Token, 'function', 'Token is function')
      assert.equal(Token.name, 'Token', 'function is called Token')
      assert.equal(Token.length, 2, 'function expects two arguments')
    })

    it('Token constructor sets createdAt', () => {
      var now = Date.now() - 1
      var token = new Token({}, { createdAt: now })

      assert.equal(token.createdAt, now, 'token.createdAt is correct')
    })

    it('Token constructor does not set createdAt if it is negative', () => {
      var notNow = -Date.now()
      var token = new Token({}, { createdAt: notNow })

      assert.ok(token.createdAt > 0, 'token.createdAt seems correct')
    })

    it('Token constructor does not set createdAt if it is in the future', () => {
      var notNow = Date.now() + 1000
      var token = new Token({}, { createdAt: notNow })

      assert.ok(token.createdAt > 0 && token.createdAt < notNow, 'token.createdAt seems correct')
    })
  })

  describe('NODE_ENV=prod', () => {
    let Token
    before(() => {
      delete require.cache[require.resolve(modulePath)]
      delete require.cache[require.resolve('../../config')]
      process.env.NODE_ENV = 'prod'
      Token = require(modulePath)(log, crypto, P, hkdf, Bundle, null)
    })

    it('Token constructor does not set createdAt', () => {
      var notNow = Date.now() - 1
      var token = new Token({}, { createdAt: notNow })

      assert.ok(token.createdAt > notNow, 'token.createdAt seems correct')
    })
  })

})
