/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

var ua = require('ua-parser')

module.exports = function (userAgentString) {
  var userAgentData = ua.parse(userAgentString)

  this.uaBrowser = getFamily(userAgentData.ua)
  this.uaBrowserVersion = getVersion(userAgentData.ua)
  this.uaOS = getFamily(userAgentData.os)
  this.uaOSVersion = getVersion(userAgentData.os)
  this.uaDeviceType = getDeviceType(userAgentData)

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
  if (getFamily(data.device)) {
    return 'mobile'
  }
}

