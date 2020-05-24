/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const ua = require('node-uap');
const safe = require('./safe');

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
  'Windows Phone',
]);

const MOBILE_UA_OS_FAMILIES = new Set(['Firefox iOS']);

// $1 = 'Firefox' indicates Firefox Sync, 'Mobile' indicates Sync mobile library
// $2 = OS
// $3 = application version
// $4 = form factor
// $5 = OS version
// $6 = application name
const SYNC_USER_AGENT = /^(Firefox|Mobile)-(\w+)-(?:FxA(?:ccounts)?|Sync)\/([^\sb]*)(?:b\S+)? ?(?:\(([\w\s]+); [\w\s]+ ([^\s()]+)\))?(?: \((.+)\))?$/;

module.exports = function (userAgentString) {
  const matches = SYNC_USER_AGENT.exec(userAgentString);
  if (matches && matches.length > 2) {
    // Always parse known Sync user-agents ourselves,
    // because node-uap makes a pig's ear of it.
    return {
      browser: safe.name(matches[6] || matches[1]),
      browserVersion: safe.version(matches[3]),
      os: safe.name(matches[2]),
      osVersion: safe.version(matches[5]),
      deviceType: marshallDeviceType(matches[4]),
      formFactor: safe.name(matches[4]),
    };
  }

  const userAgentData = ua.parse(userAgentString);
  return {
    browser: safe.name(getFamily(userAgentData.ua)),
    browserVersion: safe.version(userAgentData.ua.toVersionString()),
    os: safe.name(getFamily(userAgentData.os)),
    osVersion: safe.version(userAgentData.os.toVersionString()),
    deviceType: getDeviceType(userAgentData) || null,
    formFactor: safe.name(getFormFactor(userAgentData)),
  };
};

function getFamily(data) {
  if (data.family && data.family !== 'Other') {
    return data.family;
  }
}

function getDeviceType(data) {
  if (getFamily(data.device) || isMobileOS(data)) {
    if (isTablet(data)) {
      return 'tablet';
    } else {
      return 'mobile';
    }
  }
}

function isMobileOS(data) {
  return (
    MOBILE_OS_FAMILIES.has(data.os.family) ||
    MOBILE_UA_OS_FAMILIES.has(data.ua.family)
  );
}

function isTablet(data) {
  return (
    isIpad(data) ||
    isAndroidTablet(data) ||
    isKindle(data) ||
    isGenericTablet(data)
  );
}

function isIpad(data) {
  return /iPad/.test(data.device.family) || isDesktopUaOnIpadFirefox(data);
}

// iPads using FF iOS 13+ send a desktop UA.
// The OS shows as a Mac, but 'Firefox iOS' in the UA family.
function isDesktopUaOnIpadFirefox(data) {
  return (
    /Mac/.test(data.os.family) && MOBILE_UA_OS_FAMILIES.has(data.ua.family)
  );
}

function isAndroidTablet(data) {
  return (
    data.os.family === 'Android' &&
    data.userAgent.indexOf('Mobile') === -1 &&
    data.userAgent.indexOf('AndroidSync') === -1
  );
}

function isKindle(data) {
  return /Kindle/.test(data.device.family);
}

function isGenericTablet(data) {
  return data.device.brand === 'Generic' && data.device.model === 'Tablet';
}

function getFormFactor(data) {
  if (isDesktopUaOnIpadFirefox(data)) {
    return 'iPad';
  } else if (data.device.brand !== 'Generic') {
    return getFamily(data.device);
  }
}

function marshallDeviceType(formFactor) {
  if (/iPad/.test(formFactor) || /tablet/i.test(formFactor)) {
    return 'tablet';
  }

  return 'mobile';
}
