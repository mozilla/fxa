/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('tap').test
var crypto = require('crypto')
var log = { trace: function() {} }

var tokens = require('../../tokens')(log)
var SessionToken = tokens.SessionToken


var ACCOUNT = {
  uid: 'xxx',
  email: Buffer('test@example.com').toString('hex'),
  emailCode: '123456',
  verified: true
}


test(
  're-creation from tokendata works',
  function (t) {
    var token = null;
    SessionToken.create(ACCOUNT)
      .then(
        function (x) {
          token = x
        }
      )
      .then(
        function () {
          return SessionToken.fromHex(token.data, ACCOUNT)
        }
      )
      .then(
        function (token2) {
          t.equal(token.data, token2.data)
          t.equal(token.id, token2.id)
          t.equal(token.authKey, token2.authKey)
          t.equal(token.bundleKey, token2.bundleKey)
          t.equal(token.uid, token2.uid)
          t.equal(token.email, token2.email)
          t.equal(token.emailCode, token2.emailCode)
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
  'sessionToken key derivations are test-vector compliant',
  function (t) {
    var token = null;
    var tokendata = 'a0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebf'
    SessionToken.fromHex(tokendata, ACCOUNT)
      .then(
        function (x) {
          token = x
          t.equal(token.data, tokendata)
          t.equal(token.id, 'c0a29dcf46174973da1378696e4c82ae10f723cf4f4d9f75e39f4ae3851595ab')
          t.equal(token.authKey, '9d8f22998ee7f5798b887042466b72d53e56ab0c094388bf65831f702d2febc0')
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
