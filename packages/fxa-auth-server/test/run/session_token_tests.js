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
