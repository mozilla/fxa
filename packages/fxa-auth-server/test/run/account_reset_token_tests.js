/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var log = { trace: function() {} }

var tokens = require('../../tokens')(log)
var AccountResetToken = tokens.AccountResetToken

var ACCOUNT = {
  uid: 'xxx'
}


test(
  're-creation from tokenData works',
  function (t) {
    var token = null;
    return AccountResetToken.create(ACCOUNT)
      .then(
        function (x) {
          token = x
        }
      )
      .then(
        function () {
          return AccountResetToken.fromHex(token.data, ACCOUNT)
        }
      )
      .then(
        function (token2) {
          t.deepEqual(token.data, token2.data)
          t.deepEqual(token.id, token2.id)
          t.deepEqual(token.authKey, token2.authKey)
          t.deepEqual(token.bundleKey, token2.bundleKey)
          t.deepEqual(token.uid, token2.uid)
        }
      )
  }
)

test(
  'accountResetToken key derivations are test-vector compliant',
  function (t) {
    var token = null;
    var tokenData = 'c0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedf'
    return AccountResetToken.fromHex(tokenData, ACCOUNT)
      .then(
        function (x) {
          token = x
          t.equal(token.data.toString('hex'), tokenData)
          t.equal(token.id.toString('hex'), '46ec557e56e531a058620e9344ca9c75afac0d0bcbdd6f8c3c2f36055d9540cf')
          t.equal(token.authKey.toString('hex'), '716ebc28f5122ef48670a48209190a1605263c3188dfe45256265929d1c45e48')
          t.equal(token.bundleKey.toString('hex'), 'aa5906d2318c6e54ecebfa52f10df4c036165c230cc78ee859f546c66ea3c126')
        }
      )
  }
)
