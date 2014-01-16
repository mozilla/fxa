/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var log = { trace: function() {} }

var timestamp = Date.now()

var PasswordForgotToken = require('../../tokens/password_forgot_token')(
  log,
  require('util').inherits,
  require('../../tokens')(log),
  require('crypto'),
  1000 * 60 * 15
)


var ACCOUNT = {
  uid: 'xxx',
  email: Buffer('test@example.com').toString('hex')
}


test(
  're-creation from tokenData works',
  function (t) {
    var token = null;
    return PasswordForgotToken.create(ACCOUNT)
      .then(
        function (x) {
          token = x
        }
      )
      .then(
        function () {
          return PasswordForgotToken.fromHex(token.data, ACCOUNT)
        }
      )
      .then(
        function (token2) {
          t.deepEqual(token.data, token2.data)
          t.deepEqual(token.id, token2.id)
          t.deepEqual(token.authKey, token2.authKey)
          t.deepEqual(token.bundleKey, token2.bundleKey)
          t.deepEqual(token.uid, token2.uid)
          t.deepEqual(token.email, token2.email)
        }
      )
  }
)


test(
  'ttl "works"',
  function (t) {
    return PasswordForgotToken.create(ACCOUNT)
      .then(
        function (token) {
          token.createdAt = timestamp
          t.equal(token.ttl(timestamp), 900)
          t.equal(token.ttl(timestamp + 1000), 899)
          t.equal(token.ttl(timestamp + 2000), 898)
        }
      )
  }
)


test(
  'failAttempt decrements `tries`',
  function (t) {
    return PasswordForgotToken.create(ACCOUNT)
      .then(
        function (x) {
          t.equal(x.tries, 3)
          t.equal(x.failAttempt(), false)
          t.equal(x.tries, 2)
          t.equal(x.failAttempt(), false)
          t.equal(x.tries, 1)
          t.equal(x.failAttempt(), true)
        }
      )
  }
)
