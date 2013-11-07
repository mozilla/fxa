/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('tap').test
var log = { trace: function() {} }

var timestamp = Date.now()
// increment timestamp by 500ms each time now is called
function now() { return (timestamp += 500) }

var ForgotPasswordToken = require('../../tokens/forgot_password_token')(
  log,
  require('util').inherits,
  now,
  require('../../tokens')(log),
  require('crypto')
)


var ACCOUNT = {
  uid: 'xxx',
  email: Buffer('test@example.com').toString('hex')
}


test(
  're-creation from tokendata works',
  function (t) {
    var token = null;
    ForgotPasswordToken.create(ACCOUNT)
      .then(
        function (x) {
          token = x
        }
      )
      .then(
        function () {
          return ForgotPasswordToken.fromHex(token.data, ACCOUNT)
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
  'ttl "works"',
  function (t) {
    ForgotPasswordToken.create(ACCOUNT)
      .then(
        function (token) {
          token.created = timestamp
          t.equal(token.ttl(), 900)
          t.equal(token.ttl(), 899)
          t.equal(token.ttl(), 899)
          t.equal(token.ttl(), 898)
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
  'failAttempt decrements `tries`',
  function (t) {
    ForgotPasswordToken.create(ACCOUNT)
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
