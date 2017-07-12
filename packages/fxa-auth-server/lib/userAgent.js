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

// $1 = 'Firefox' indicates Firefox Sync, 'Mobile' indicates Sync mobile library
// $2 = OS
// $3 = application version
// $4 = form factor
// $5 = OS version
// $6 = application name
const SYNC_USER_AGENT = /^(Firefox|Mobile)-(\w+)-(?:FxA(?:ccounts)?|Sync)\/([^\sb]*)(?:b\S+)? ?(?:\(([\w\s]+); [\w\s]+ ([^\s()]+)\))?(?: \((.+)\))?$/

module.exports = function (userAgentString) {
  const matches = SYNC_USER_AGENT.exec(userAgentString)
  if (matches && matches.length > 2) {
    // Always parse known Sync user-agents ourselves,
    // because node-uap makes a pig's ear of it.
    this.uaBrowser = matches[6] || matches[1]
    this.uaBrowserVersion = matches[3] || null
    this.uaOS = matches[2]
    this.uaOSVersion = matches[5]
    this.uaDeviceType = marshallFormFactor(matches[4])
  } else {
    const userAgentData = ua.parse(userAgentString)

    this.uaBrowser = getFamily(userAgentData.ua) || null
    this.uaBrowserVersion = getVersion(userAgentData.ua) || null
    this.uaOS = getFamily(userAgentData.os) || null
    this.uaOSVersion = getVersion(userAgentData.os) || null
    this.uaDeviceType = getDeviceType(userAgentData) || null
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

