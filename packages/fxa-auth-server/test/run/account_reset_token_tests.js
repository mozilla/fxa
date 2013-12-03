/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var crypto = require('crypto')
var log = { trace: function() {} }

var tokens = require('../../tokens')(log)
var AccountResetToken = tokens.AccountResetToken

var ACCOUNT = {
  uid: 'xxx'
}


test(
  're-creation from tokendata works',
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
  'bundle / unbundle of account data works',
  function (t) {
    var token = null;
    var wrapKb = crypto.randomBytes(32)
    var verifier = crypto.randomBytes(256).toString('hex')
    return AccountResetToken.create(ACCOUNT)
      .then(
        function (x) {
          token = x
          return token.bundleAccountData(wrapKb, verifier)
        }
      )
      .then(
        function (b) {
          return token.unbundleAccountData(b)
        }
      )
      .then(
        function (ub) {
          t.deepEqual(ub.wrapKb, wrapKb)
          t.equal(ub.verifier, verifier)
        }
      )
  }
)


test(
  'accountResetToken key derivations are test-vector compliant',
  function (t) {
    var token = null;
    var tokendata = 'c0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedf'
    return AccountResetToken.fromHex(tokendata, ACCOUNT)
      .then(
        function (x) {
          token = x
          t.equal(token.data.toString('hex'), tokendata)
          t.equal(token.id.toString('hex'), '46ec557e56e531a058620e9344ca9c75afac0d0bcbdd6f8c3c2f36055d9540cf')
          t.equal(token.authKey.toString('hex'), '716ebc28f5122ef48670a48209190a1605263c3188dfe45256265929d1c45e48')
          t.equal(token.bundleKey.toString('hex'), 'aa5906d2318c6e54ecebfa52f10df4c036165c230cc78ee859f546c66ea3c126')
        }
      )
      .then(
        function () {
          var wrapKb = Buffer('404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f', 'hex')
          var newSRPv = '1'
          while (newSRPv.length !== 512) {
            newSRPv += newSRPv
          }
          return token.bundleAccountData(wrapKb, newSRPv)
        }
      )
      .then(
        function (bundle) {
          t.equal(bundle,
                  'dcfcaabfd9b65212cb32c255204030739a420ac89c3d9370cda55abe437d16f4' +
                  'c47cf26738dcb1a12e491b8f7d522635a4ce03b624dde3b0f323c5e4efe95e97' +
                  'b0a5ecd56e9c0e6203b7b321b9653c4ad055ff8badf34a468761a90194175dea' +
                  'cdba973c8c46badd3053cdccf7793390c269d98a1cdf17bfdc0d0ee79bc7ca8b' +
                  '8dba1a13f071914a48aa9603d93221470a2cfc64d521f32d33229922a7e3ab28' +
                  'e4104db6b814c7ff7fd4a0f2bf4315ab7e2721fae21faabd0e56238f9ef33661' +
                  '3b2c70e482239cc5e1b87a739bb9eefd090f82c3be9c96ee3c81c76dbbe6e6d8' +
                  'be135d82ded68f8576ab61a2167d31dd050bb345ee048a342034b215550dfde2' +
                  '5ed0954df87ff48930ecf92dc35f23185c215566aeb3d9fcce327f403471785f' +
                  '1d3572fe0b4bdf66f2b2657cb2ee56fc80f7a82708cafd821952e1f01761cb29')
        }
      )
  }
)
