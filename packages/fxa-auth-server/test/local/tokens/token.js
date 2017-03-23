/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
const config = require('../../../config').getProperties()
var random = require('../../../lib/crypto/random')
var hkdf = require('../../../lib/crypto/hkdf')
var mocks = require('../../mocks')
var P = require('../../../lib/promise')
var sinon = require('sinon')

var Bundle = {
  bundle: sinon.spy(),
  unbundle: sinon.spy()
}
var log = mocks.spyLog()
var modulePath = '../../../lib/tokens/token'

describe('Token', () => {

  describe('NODE_ENV=dev', () => {
    let Token
    before(() => {
      config.isProduction = false
      Token = require(modulePath)(log, config, random, P, hkdf, Bundle, null)
    })

    it('Token constructor was exported', () => {
      assert.equal(typeof Token, 'function', 'Token is function')
      assert.equal(Token.name, 'Token', 'function is called Token')
      assert.equal(Token.length, 2, 'function expects two arguments')
    })

    it('Token constructor has expected factory methods', () => {
      assert.equal(typeof Token.createNewToken, 'function', 'Token.createNewToken is function')
      assert.equal(Token.createNewToken.length, 2, 'function expects two arguments')
      assert.equal(typeof Token.createTokenFromHexData, 'function', 'Token.createTokenFromHexData is function')
      assert.equal(Token.createTokenFromHexData.length, 3, 'function expects three arguments')
    })

    it('Token constructor sets createdAt', () => {
      var now = Date.now() - 1
      var token = new Token({}, { createdAt: now })

      assert.equal(token.createdAt, now, 'token.createdAt is correct')
    })

    it('Token constructor defaults createdAt to zero if not given a value', () => {
      var token = new Token({}, {})
      assert.equal(token.createdAt, 0, 'token.createdAt is correct')
    })

    it('Token.createNewToken defaults createdAt to the current time', () => {
      var now = Date.now()
      return Token.createNewToken(Token, {}).then(token => {
        assert.ok(token.createdAt >= now && token.createdAt <= Date.now(), 'token.createdAt seems correct')
      })
    })

    it('Token.createNewToken accepts an override for createdAt', () => {
      var now = Date.now() - 1
      return Token.createNewToken(Token, { createdAt: now }).then(token => {
        assert.equal(token.createdAt, now, 'token.createdAt is correct')
      })
    })

    it('Token.createNewToken ignores a negative value for createdAt', () => {
      var now = Date.now()
      var notNow = -now
      return Token.createNewToken(Token, { createdAt: notNow }).then(token => {
        assert.ok(token.createdAt >= now && token.createdAt <= Date.now(), 'token.createdAt seems correct')
      })
    })

    it('Token.createNewToken ignores a createdAt timestamp in the future', () => {
      var now = Date.now()
      var notNow = Date.now() + 1000
      return Token.createNewToken(Token, { createdAt: notNow }).then(token => {
        assert.ok(token.createdAt >= now && token.createdAt <= Date.now(), 'token.createdAt seems correct')
      })
    })

    it('Token.createTokenFromHexData accepts a value for createdAt', () => {
      var now = Date.now() - 20
      return Token.createTokenFromHexData(Token, 'ABCD', { createdAt: now }).then(token => {
        assert.equal(token.createdAt, now, 'token.createdAt is correct')
      })
    })

    it('Token.createTokenFromHexData defaults to zero if not given a value for createdAt', () => {
      return Token.createTokenFromHexData(Token, 'ABCD', { other: 'data' }).then(token => {
        assert.equal(token.createdAt, 0, 'token.createdAt is correct')
      })
    })
  })

  describe('NODE_ENV=prod', () => {
    let Token
    before(() => {
      config.isProduction = true
      Token = require(modulePath)(log, config, random, P, hkdf, Bundle, null)
    })

    it('Token.createNewToken defaults createdAt to the current time', () => {
      var now = Date.now()
      return Token.createNewToken(Token, {}).then(token => {
        assert.ok(token.createdAt >= now && token.createdAt <= Date.now(), 'token.createdAt seems correct')
      })
    })

    it('Token.createNewToken does not accept an override for createdAt', () => {
      var now = Date.now() - 1
      return Token.createNewToken(Token, { createdAt: now }).then(token => {
        assert.ok(token.createdAt > now && token.createdAt <= Date.now(), 'token.createdAt seems correct')
      })
    })

    it('Token.createTokenFromHexData accepts a value for createdAt', () => {
      var now = Date.now() - 20
      return Token.createTokenFromHexData(Token, 'ABCD', { createdAt: now }).then(token => {
        assert.equal(token.createdAt, now, 'token.createdAt is correct')
      })
    })

    it('Token.createTokenFromHexData defaults to zero if not given a value for createdAt', () => {
      return Token.createTokenFromHexData(Token, 'ABCD', { other: 'data' }).then(token => {
        assert.equal(token.createdAt, 0, 'token.createdAt is correct')
      })
    })
  })

})
