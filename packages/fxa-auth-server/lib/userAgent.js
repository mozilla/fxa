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
  'Kindle',
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
    return {
      browser: matches[6] || matches[1],
      browserVersion: matches[3] || null,
      os: matches[2],
      osVersion: matches[5],
      deviceType: marshallDeviceType(matches[4]),
      formFactor: matches[4] || null
    }
  }

  const userAgentData = ua.parse(userAgentString)
  return {
    browser: getFamily(userAgentData.ua) || null,
    browserVersion: getVersion(userAgentData.ua) || null,
    os: getFamily(userAgentData.os) || null,
    osVersion: getVersion(userAgentData.os) || null,
    deviceType: getDeviceType(userAgentData) || null,
    formFactor: getFormFactor(userAgentData) || null
  }
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
  return isIpad(data) || isAndroidTablet(data) || isKindle(data) || isGenericTablet(data)
}

function isIpad (data) {
  return /iPad/.test(data.device.family)
}

function isAndroidTablet (data) {
  return data.os.family === 'Android' &&
    data.userAgent.indexOf('Mobile') === -1 &&
    data.userAgent.indexOf('AndroidSync') === -1
}

function isKindle (data) {
  return /Kindle/.test(data.device.family)
}

function isGenericTablet (data) {
  return data.device.brand === 'Generic' && data.device.model === 'Tablet'
}

function getFormFactor (data) {
  if (data.device.brand !== 'Generic') {
    return getFamily(data.device)
  }
}

function marshallDeviceType (formFactor) {
  if (/iPad/.test(formFactor) || /tablet/i.test(formFactor)) {
    return 'tablet'
  }

  return 'mobile'
}

