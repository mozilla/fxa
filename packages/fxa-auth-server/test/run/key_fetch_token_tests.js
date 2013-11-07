/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('tap').test
var crypto = require('crypto')
var log = { trace: function() {} }

var tokens = require('../../tokens')(log)
var KeyFetchToken = tokens.KeyFetchToken

var ACCOUNT = {
  uid: 'xxx',
  kA: '0000000000000000000000000000000000000000000000000000000000000000',
  wrapKb: '0000000000000000000000000000000000000000000000000000000000000000',
  verified: true
}


test(
  're-creation from tokendata works',
  function (t) {
    var token = null;
    KeyFetchToken.create(ACCOUNT)
      .then(
        function (x) {
          token = x
        }
      )
      .then(
        function () {
          return KeyFetchToken.fromHex(token.data, ACCOUNT)
        }
      )
      .then(
        function (token2) {
          t.equal(token.data, token2.data)
          t.equal(token.id, token2.id)
          t.equal(token.authKey, token2.authKey)
          t.equal(token.bundleKey, token2.bundleKey)
          t.equal(token.uid, token2.uid)
          t.equal(token.kA, token2.kA)
          t.equal(token.wrapKb, token2.wrapKb)
          t.equal(token.verified, token2.verified)
        }
      )
      .done(
        function () {
          t.end()
        },
        function (err) {
          t.fail(JSON.stringify(err))
          t.end()
        }
      )
  }
)


test(
  'bundle / unbundle of keys works',
  function (t) {
    var token = null;
    var kAHex = crypto.randomBytes(32).toString('hex')
    var wrapKbHex = crypto.randomBytes(32).toString('hex')
    KeyFetchToken.create(ACCOUNT)
      .then(
        function (x) {
          token = x
          return x.bundleKeys(kAHex, wrapKbHex)
        }
      )
      .then(
        function (b) {
          return token.unbundleKeys(b)
        }
      )
      .then(
        function (ub) {
          t.equal(ub.kA, kAHex)
          t.equal(ub.wrapKb, wrapKbHex)
        }
      )
      .done(
        function () {
          t.end()
        },
        function (err) {
          t.fail(JSON.stringify(err))
          t.end()
        }
      )
  }
)
