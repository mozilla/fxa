/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

var ua = require('node-uap')

var MOBILE_OS_FAMILIES = {
  'Android': null,
  'Bada': null,
  'BlackBerry OS': null,
  'BlackBerry Tablet OS': null,
  'Brew MP': null,
  'Firefox OS': null,
  'iOS': null,
  'Maemo': null,
  'MeeGo': null,
  'Symbian OS': null,
  'Symbian^3': null,
  'Symbian^3 Anna': null,
  'Symbian^3 Belle': null,
  'Windows CE': null,
  'Windows Mobile': null,
  'Windows Phone': null
}

var ELLIPSIS = '\u2026'

module.exports = function (userAgentString, log) {
  var userAgentData = ua.parse(userAgentString)

  this.uaBrowser = getFamily(userAgentData.ua) || null
  this.uaBrowserVersion = getVersion(userAgentData.ua) || null
  this.uaOS = getFamily(userAgentData.os) || null
  this.uaOSVersion = getVersion(userAgentData.os) || null
  this.uaDeviceType = getDeviceType(userAgentData) || null

  if (! this.uaBrowser && ! this.uaOS) {
    // In the worst case, fall back to a truncated user agent string
    this.uaBrowser = truncate(userAgentString || '', log)
  }

  return this
}

function getFamily (data) {
  if (data.family && data.family !== 'Other') {
    return data.family
  }
}

function getVersion (data) {
  if (! data.major) {
    return
  }

  if (! data.minor || parseInt(data.minor) === 0) {
    return data.major
  }

  return data.major + '.' + data.minor
}

function getDeviceType (data) {
  if (getFamily(data.device) || isMobileOS(data.os)) {
    return 'mobile'
  }
}

function isMobileOS (os) {
  return os.family in MOBILE_OS_FAMILIES
}

function truncate (userAgentString, log) {
  log.info({
    op: 'userAgent:truncate',
    userAgent: userAgentString
  })

  // Completely arbitrary truncation length. This should be a very rare
  // condition, so we just want something that is long enough to convey
  // some meaningful information without being too messy.
  var length = 60

  if (userAgentString.length < length) {
    return userAgentString
  }

  if (/.+\(.+\)/.test(userAgentString)) {
    var openingIndex = userAgentString.indexOf('(')
    var closingIndex = userAgentString.indexOf(')')

    if (openingIndex < closingIndex && closingIndex < 100) {
      // If there is a closing parenthesis within a reasonable length,
      // allow the string to be a bit longer than our arbitrary maximum.
      length = closingIndex + 1
    }
  }

  return userAgentString.substr(0, length) + ELLIPSIS
}

