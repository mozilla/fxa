/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var extend = require('util')._extend

var test = require('../ptaptest')
var contentToken = require('../../lib/crypto/contentToken')

// Token generated from default settings
var DEFAULT_TOKEN = '3134353939393439353832393581370469b241f38edcd281c3b69bc835ba1b9810'
var HEADERS = {
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.110 Safari/537.36'
}

var testConfig = {
  required: true,
  key: 'YOU MUST CHANGE ME',
  expiry: Date.now()
}

test(
  'contentToken basic',
  function (t) {
    return contentToken(DEFAULT_TOKEN, HEADERS, testConfig)
      .then(
        function (result) {
          t.ok(result.valid, 'token is valid')
          t.equal(result.reason, 'Valid HMAC')
        }
      )
  }
)

test(
  'contentToken fails against bad headers',
  function (t) {
    var HEADERS = {
      'user-agent': 'MSIE'
    }
    return contentToken(DEFAULT_TOKEN, HEADERS, testConfig)
      .then(
        function (result) {
          t.notOk(result.valid, 'token is not valid')
          t.equal(result.reason, 'Invalid HMAC')
        }
      )
  }
)

test(
  'contentToken fails if token is bad length',
  function (t) {
    return contentToken(DEFAULT_TOKEN.substr(0, 3), HEADERS, testConfig)
      .then(function (result) {
        t.notOk(result.valid, 'token is not valid')
        t.equal(result.reason, 'Incorrect token length')
      })
  }
)

test(
  'contentToken fails if bad key',
  function (t) {
    var config = extend({}, testConfig)
    config.key = 'something else'
    return contentToken(DEFAULT_TOKEN, HEADERS, config)
      .then(function (result) {
        t.notOk(result.valid, 'token is not valid for bad key')
        t.equal(result.reason, 'Invalid HMAC')
      })
  }
)

test(
  'contentToken if timestamp expired',
  function (t) {
    var config = extend({}, testConfig)
    config.expiry = 1

    return contentToken(DEFAULT_TOKEN, HEADERS, config)
      .then(function (result) {
        t.notOk(result.valid, 'token is not valid, it expired')
        t.equal(result.reason, 'Token expired')
      })
  }
)

test(
  'contentToken fails if wrong token',
  function (t) {
    return contentToken('31343539393831323734393931f00f00f00eefa2ead4427c5de811a570a8e539d6', HEADERS, testConfig)
      .then(function (result) {
        t.notOk(result.valid, 'token is not valid for bad key')
        t.equal(result.reason, 'Invalid HMAC')
      })
  }
)
