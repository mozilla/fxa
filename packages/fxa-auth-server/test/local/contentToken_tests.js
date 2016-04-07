/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var extend = require('util')._extend

var test = require('../ptaptest')
var contentToken = require('../../lib/crypto/contentToken')

var EXPIRY_30_MINUTES = 1000 * 60 * 30
var TEST_IP = '127.0.0.1'
// Token generated from default settings
var DEFAULT_TOKEN = '31343539393831323734393931dffbe6f5beefa2ead4427c5de811a570a8e539d6'
var HEADERS = {
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.110 Safari/537.36'
}

var defaultConfig = {
  required: true,
  key: 'YOU MUST CHANGE ME',
  expiry: Date.now()
}

test(
  'contentToken basic',
  function (t) {
    return contentToken(DEFAULT_TOKEN, TEST_IP, HEADERS, defaultConfig)
      .then(
        function (valid) {
          t.ok(valid, 'token is valid')
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
    return contentToken(DEFAULT_TOKEN, TEST_IP, HEADERS, defaultConfig)
      .then(
        function (valid) {
          t.notOk(valid, 'token is not valid')
        }
      )
  }
)

test(
  'contentToken returns valid if feature disabled',
  function (t) {
    var HEADERS = {
      'user-agent': 'MSIE'
    }
    return contentToken(DEFAULT_TOKEN, TEST_IP, HEADERS, {
      required: false
    })
    .then(
      function (valid) {
        t.ok(valid, 'token is valid, feature is disabled')
      }
    )
  }
)

test(
  'contentToken fails if token is bad length',
  function (t) {
    return contentToken(DEFAULT_TOKEN.substr(0, 3), TEST_IP, HEADERS, defaultConfig)
      .then(
        function (valid) {
          t.notOk(valid, 'token is not valid')
        }
      )
  }
)

test(
  'contentToken is not valid for wrong ip',
  function (t) {
    return contentToken(DEFAULT_TOKEN, '127.0.2.2', HEADERS, defaultConfig)
      .then(
        function (valid) {
          t.notOk(valid, 'token is not valid for bad ip')
        }
      )
  }
)

test(
  'contentToken fails if bad key',
  function (t) {
    var config = extend({}, defaultConfig)
    config.key = 'something else'
    return contentToken(DEFAULT_TOKEN, TEST_IP, HEADERS, config)
      .then(
        function (valid) {
          t.notOk(valid, 'token is not valid for bad key')
        }
      )
  }
)

test(
  'contentToken if timestamp is NaN',
  function (t) {
    var config = extend({}, defaultConfig)
    config.expiry = EXPIRY_30_MINUTES

    return contentToken(DEFAULT_TOKEN, TEST_IP, HEADERS, config)
      .then(
        function (valid) {
          t.notOk(valid, 'token is not valid, it expired')
        }
      )
  }
)

test(
  'contentToken fails if wrong token',
  function (t) {
    return contentToken('31343539393831323734393931f00f00f00eefa2ead4427c5de811a570a8e539d6', TEST_IP, HEADERS, defaultConfig)
      .then(
        function (valid) {
          t.notOk(valid, 'token is not valid for bad key')
        }
      )
  }
)

test(
  'contentToken allow firefox os devices',
  function (t) {
    var HEADERS = {
      'user-agent': 'Mozilla/5.0 (TV; rv:44.0) Gecko/44.0 Firefox/44.0'
    }

    var config = extend({}, defaultConfig)
    config.allowedUARegex = [/\((?:Mobile|Tablet|TV);.+Firefox/]

    return contentToken(DEFAULT_TOKEN, TEST_IP, HEADERS, config)
      .then(
        function (valid) {
          t.ok(valid, 'token is valid')
        }
      )
  }
)

test(
  'contentToken blocks fennec UAs',
  function (t) {
    var HEADERS = {
      'user-agent': 'Mozilla/5.0 (Android 4.4; Mobile; rv:41.0) Gecko/41.0 Firefox/41.0'
    }

    var config = extend({}, defaultConfig)
    config.allowedUARegex = [/\((?:Mobile|Tablet|TV);.+Firefox/]

    return contentToken(DEFAULT_TOKEN, TEST_IP, HEADERS, config)
      .then(
        function (valid) {
          t.notOk(valid, 'token is valid')
        }
      )
  }
)
