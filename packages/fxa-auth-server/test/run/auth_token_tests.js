/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('tap').test
var crypto = require('crypto')
var log = { trace: function() {} }

var tokens = require('../../tokens')(log)
var AuthToken = tokens.AuthToken

var ACCOUNT = {
  uid: 'xxx'
}


test(
  're-creation from tokendata works',
  function (t) {
    var token = null;
    AuthToken.create(ACCOUNT)
      .then(
        function (x) {
          token = x
        }
      )
      .then(
        function () {
          return AuthToken.fromHex(token.data, ACCOUNT)
        }
      )
      .then(
        function (token2) {
          t.equal(token.data, token2.data)
          t.equal(token.id, token2.id)
          t.equal(token.authKey, token2.authKey)
          t.equal(token.bundleKey, token2.bundleKey)
          t.equal(token.uid, token2.uid)
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
  'bundle / unbundle of session data works',
  function (t) {
    var token = null;
    var keyFetchTokenHex = crypto.randomBytes(32).toString('hex')
    var sessionTokenHex = crypto.randomBytes(32).toString('hex')
    AuthToken.create(ACCOUNT)
      .then(
        function (x) {
          token = x
          return x.bundleSession(keyFetchTokenHex, sessionTokenHex)
        }
      )
      .then(
        function (b) {
          return token.unbundleSession(b)
        }
      )
      .then(
        function (ub) {
          t.equal(ub.keyFetchToken, keyFetchTokenHex)
          t.equal(ub.sessionToken, sessionTokenHex)
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
  'bundle / unbundle of account reset data works',
  function (t) {
    var token = null;
    var keyFetchTokenHex = crypto.randomBytes(32).toString('hex')
    var resetTokenHex = crypto.randomBytes(32).toString('hex')
    AuthToken.create(ACCOUNT)
      .then(
        function (x) {
          token = x
          return x.bundleAccountReset(keyFetchTokenHex, resetTokenHex)
        }
      )
      .then(
        function (b) {
          return token.unbundleAccountReset(b)
        }
      )
      .then(
        function (ub) {
          t.equal(ub.keyFetchToken, keyFetchTokenHex)
          t.equal(ub.accountResetToken, resetTokenHex)
        }
      )
      .done(
        function () {
          t.end()
        },
        function (err) {
          console.log(err)
          t.fail(JSON.stringify(err))
          t.end()
        }
      )
  }
)
