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

var defaultConfig = {
  required: true,
  key: 'YOU MUST CHANGE ME',
  expiry: Date.now()
}

test(
  'contentToken basic',
  function (t) {
    return contentToken(DEFAULT_TOKEN, HEADERS, defaultConfig)
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
    return contentToken(DEFAULT_TOKEN, HEADERS, defaultConfig)
      .then(
        function (result) {
          t.notOk(result.valid, 'token is not valid')
          t.equal(result.reason, 'Invalid HMAC')
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
    return contentToken(DEFAULT_TOKEN, HEADERS, {
      required: false
    })
    .then(
      function (result) {
        t.ok(result.valid, 'token is valid, feature is disabled')
        t.equal(result.reason, 'Token verification not enabled')
      }
    )
  }
)

test(
  'contentToken fails if token is bad length',
  function (t) {
    return contentToken(DEFAULT_TOKEN.substr(0, 3), HEADERS, defaultConfig)
      .then(function (result) {
        t.notOk(result.valid, 'token is not valid')
        t.equal(result.reason, 'Bad request or token length')
      })
  }
)

test(
  'contentToken fails if bad key',
  function (t) {
    var config = extend({}, defaultConfig)
    config.key = 'something else'
    return contentToken(DEFAULT_TOKEN, HEADERS, config)
      .then(function (result) {
        t.notOk(result.valid, 'token is not valid for bad key')
        t.equal(result.reason, 'Invalid HMAC')
      })
  }
)

test(
  'contentToken if timestamp is NaN',
  function (t) {
    var config = extend({}, defaultConfig)
    config.expiry = 1

    return contentToken(DEFAULT_TOKEN, HEADERS, config)
      .then(function (result) {
        t.notOk(result.valid, 'token is not valid, it expired')
        t.equal(result.reason, 'Content token expired or bad duration')
      })
  }
)

test(
  'contentToken fails if wrong token',
  function (t) {
    return contentToken('31343539393831323734393931f00f00f00eefa2ead4427c5de811a570a8e539d6', HEADERS, defaultConfig)
      .then(function (result) {
        t.notOk(result.valid, 'token is not valid for bad key')
        t.equal(result.reason, 'Invalid HMAC')
      })
  }
)

test(
  'contentToken allow firefox os devices',
  function (t) {
    var HEADERS = {
      'user-agent': 'Mozilla/5.0 (TV; rv:44.0) Gecko/44.0 Firefox/44.0'
    }

    var config = extend({}, defaultConfig)
    config.allowedUARegex = ['\\((?:Mobile|Tablet|TV);.+Firefox']
    config.compiledRegexList = config.allowedUARegex.map(function(re) {
      return new RegExp(re)
    })

    return contentToken(DEFAULT_TOKEN, HEADERS, config)
      .then(function (result) {
        t.ok(result.valid, 'token is valid')
        t.equal(result.reason, 'Allowed user agent')
      })
  }
)

test(
  'contentToken blocks fennec UAs',
  function (t) {
    var HEADERS = {
      'user-agent': 'Mozilla/5.0 (Android 4.4; Mobile; rv:41.0) Gecko/41.0 Firefox/41.0'
    }

    var config = extend({}, defaultConfig)
    config.allowedUARegex = ['\\((?:Mobile|Tablet|TV);.+Firefox']
    config.compiledRegexList = config.allowedUARegex.map(function(re) {
      return new RegExp(re)
    })

    return contentToken(DEFAULT_TOKEN, HEADERS, config)
      .then(function (result) {
        t.notOk(result.valid, 'token is valid')
        t.equal(result.reason, 'Invalid HMAC')
      })
  }
)
