/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

var crypto = require('crypto')
var hkdf = require('../../lib/crypto/hkdf')
var mocks = require('../mocks')
var P = require('../../lib/promise')
var sinon = require('sinon')
var test = require('tap').test

var Bundle = {
  bundle: sinon.spy(),
  unbundle: sinon.spy()
}
var log = mocks.spyLog()
var modulePath = '../../lib/tokens/token'

test('NODE_ENV=dev', function (t) {
  process.env.NODE_ENV = 'dev'
  var Token = require(modulePath)(log, crypto, P, hkdf, Bundle, null)

  t.plan(4)

  t.test('Token constructor was exported', function (t) {
    t.equal(typeof Token, 'function', 'Token is function')
    t.equal(Token.name, 'Token', 'function is called Token')
    t.equal(Token.length, 2, 'function expects two arguments')
    t.end()
  })

  t.test('Token constructor sets createdAt', function (t) {
    var now = Date.now() - 1
    var token = new Token({}, { createdAt: now })

    t.equal(token.createdAt, now, 'token.createdAt is correct')
    t.end()
  })

  t.test('Token constructor does not set createdAt if it is negative', function (t) {
    var notNow = -Date.now()
    var token = new Token({}, { createdAt: notNow })

    t.ok(token.createdAt > 0, 'token.createdAt seems correct')
    t.end()
  })

  t.test('Token constructor does not set createdAt if it is in the future', function (t) {
    var notNow = Date.now() + 1000
    var token = new Token({}, { createdAt: notNow })

    t.ok(token.createdAt > 0 && token.createdAt < notNow, 'token.createdAt seems correct')
    t.end()
  })
})

test('NODE_ENV=prod', function (t) {
  process.env.NODE_ENV = 'prod'
  delete require.cache[require.resolve(modulePath)]
  delete require.cache[require.resolve('../../config')]
  var Token = require(modulePath)(log, crypto, P, hkdf, Bundle, null)

  t.plan(1)

  t.test('Token constructor does not set createdAt', function (t) {
    var notNow = Date.now() - 1
    var token = new Token({}, { createdAt: notNow })

    t.ok(token.createdAt > notNow, 'token.createdAt seems correct')
    t.end()
  })
})

