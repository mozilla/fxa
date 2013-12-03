/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var crypto = require('crypto')
var log = { trace: function() {} }

var tokens = require('../../tokens')(log)
var KeyFetchToken = tokens.KeyFetchToken

var ACCOUNT = {
  uid: 'xxx',
  kA: Buffer('0000000000000000000000000000000000000000000000000000000000000000', 'hex'),
  wrapKb: Buffer('0000000000000000000000000000000000000000000000000000000000000000', 'hex'),
  verified: true
}


test(
  're-creation from tokendata works',
  function (t) {
    var token = null;
    return KeyFetchToken.create(ACCOUNT)
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
          t.deepEqual(token.data, token2.data)
          t.deepEqual(token.id, token2.id)
          t.deepEqual(token.authKey, token2.authKey)
          t.deepEqual(token.bundleKey, token2.bundleKey)
          t.deepEqual(token.uid, token2.uid)
          t.deepEqual(token.kA, token2.kA)
          t.deepEqual(token.wrapKb, token2.wrapKb)
          t.equal(token.verified, token2.verified)
        }
      )
  }
)


test(
  'bundle / unbundle of keys works',
  function (t) {
    var token = null;
    var kA = crypto.randomBytes(32)
    var wrapKb = crypto.randomBytes(32)
    return KeyFetchToken.create(ACCOUNT)
      .then(
        function (x) {
          token = x
          return x.bundleKeys(kA, wrapKb)
        }
      )
      .then(
        function (b) {
          return token.unbundleKeys(b)
        }
      )
      .then(
        function (ub) {
          t.deepEqual(ub.kA, kA)
          t.deepEqual(ub.wrapKb, wrapKb)
        }
      )
  }
)


test(
  'keyFetchToken key derivations are test-vector compliant',
  function (t) {
    var token = null;
    var tokendata = '808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9f'
    return KeyFetchToken.fromHex(tokendata, ACCOUNT)
      .then(
        function (x) {
          token = x
          t.equal(token.data.toString('hex'), tokendata)
          t.equal(token.id.toString('hex'), '3d0a7c02a15a62a2882f76e39b6494b500c022a8816e048625a495718998ba60')
          t.equal(token.authKey.toString('hex'), '87b8937f61d38d0e29cd2d5600b3f4da0aa48ac41de36a0efe84bb4a9872ceb7')
          t.equal(token.bundleKey.toString('hex'), '14f338a9e8c6324d9e102d4e6ee83b209796d5c74bb734a410e729e014a4a546')
        }
      )
      .then(
        function () {
          var kA = Buffer('202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f', 'hex')
          var wrapKb = Buffer('404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f', 'hex')
          return token.bundleKeys(kA, wrapKb)
        }
      )
      .then(
        function (bundle) {
          t.equal(bundle,
                  'ee5c58845c7c9412b11bbd20920c2fddd83c33c9cd2c2de2' +
                  'd66b222613364636c2c0f8cfbb7c630472c0bd88451342c6' +
                  'c05b14ce342c5ad46ad89e84464c993c3927d30230157d08' +
                  '17a077eef4b20d976f7a97363faf3f064c003ada7d01aa70')
        }
      )
  }
)
