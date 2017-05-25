/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const ua = require('node-uap')

const MOBILE_OS_FAMILIES = new Set([
  'Android',
  'Bada',
  'BlackBerry OS',
  'BlackBerry Tablet OS',
  'Brew MP',
  'Firefox OS',
  'iOS',
  'Maemo',
  'MeeGo',
  'Symbian OS',
  'Symbian^3',
  'Symbian^3 Anna',
  'Symbian^3 Belle',
  'Windows CE',
  'Windows Mobile',
  'Windows Phone'
])

const ELLIPSIS = '\u2026'

// $1 = 'Firefox' indicates Firefox Sync, 'Mobile' indicates Sync mobile library
// $2 = OS
// $3 = application version
// $4 = form factor
// $5 = OS version
// $6 = application name
const SYNC_USER_AGENT = /^(Firefox|Mobile)-(\w+)-(?:FxA(?:ccounts)?|Sync)\/([^\sb]*)(?:b\S+)? ?(?:\(([\w\s]+); [\w\s]+ ([^\s()]+)\))?(?: \((.+)\))?$/

module.exports = function (userAgentString, log) {
  const userAgentData = ua.parse(userAgentString)

  this.uaBrowser = getFamily(userAgentData.ua) || null
  this.uaBrowserVersion = getVersion(userAgentData.ua) || null
  this.uaOS = getFamily(userAgentData.os) || null
  this.uaOSVersion = getVersion(userAgentData.os) || null
  this.uaDeviceType = getDeviceType(userAgentData) || null

  if (! this.uaBrowser) {
    const matches = SYNC_USER_AGENT.exec(userAgentString)
    if (matches && matches.length > 2) {
      this.uaBrowser = matches[6] || matches[1]
      this.uaBrowserVersion = matches[3] || null
      this.uaOS = matches[2]
      this.uaOSVersion = matches[5]
      if (! this.uaDeviceType) {
        this.uaDeviceType = marshallFormFactor(matches[4])
      }
    } else if (! this.uaOS) {
      // In the worst case, fall back to a truncated user agent string
      this.uaBrowser = truncate(userAgentString || '', log)
    }
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
    if (isTablet(data)) {
      return 'tablet'
    } else {
      return 'mobile'
    }
  }
}

function isMobileOS (os) {
  return MOBILE_OS_FAMILIES.has(os.family)
}

function isTablet(data) {
  // 'tablets' are iPads and Android devices with no word 'Mobile' in them.
  // Ref: https://webmasters.googleblog.com/2011/03/mo-better-to-also-detect-mobile-user.html
  if (getFamily(data.device)) {
    if (data.device.family === 'iPad' ||
       (data.os && data.os.family === 'Android' && data.userAgent.indexOf('Mobile') === -1)
    ) {
      return true
    }
  }

  return false
}

function marshallFormFactor (formFactor) {
  if (/iPad/.test(formFactor) || /tablet/i.test(formFactor)) {
    return 'tablet'
  }

  return 'mobile'
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

