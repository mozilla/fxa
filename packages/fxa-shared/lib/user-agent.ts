/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type ParsedUa = {
  family: string | null;
  major: string | null;
  minor: string | null;
  patch: string | null;
  toVersionString: () => string;
};
export type ParsedOs = ParsedUa & {
  patchMinor: string | null;
};
export type ParsedDevice = {
  family: string | null;
  brand: string | null;
  model: string | null;
};
export type ParsedUserAgentProperties = {
  userAgent: string;
  ua: ParsedUa;
  os: ParsedOs;
  device: ParsedDevice;
};

export type UAScalarProperties = {
  browser: string | null;
  browserVersion: string | null;
  os: string | null;
  osVersion: string | null;
  deviceType: string | null;
  formFactor: string | null;
};

// Safe wrapper around node-uap, which prevents unsafe input from
// leaking back to the result data.

// @ts-ignore
import * as ua from 'node-uap';

// We know this won't match "Symbian^3", "UI/WKWebView" or "Mail.ru" but
// it's simpler and safer to limit to alphanumerics, underscore and space.
const VALID_FAMILY_OR_NAME = /^[\w ]{1,32}$/;

const VALID_VERSION = /^[\w.]{1,16}$/;

// $1 = 'Firefox' indicates Firefox Sync, 'Mobile' indicates Sync mobile library
// $2 = OS
// $3 = application version
// $4 = form factor
// $5 = OS version
// $6 = application name
const SYNC_USER_AGENT =
  /^(Firefox|Mobile)-(\w+)-(?:FxA(?:ccounts)?|Sync)\/([^\sb]*)(?:b\S+)? ?(?:\(([\w\s]+); [\w\s]+ ([^\s()]+)\))?(?: \((.+)\))?$/;

const MOBILE_OS_FAMILIES = new Set(['Android', 'iOS']);
const MOBILE_UA_OS_FAMILIES = new Set(['Firefox iOS']);

export const parse = (
  userAgentString: string | undefined
): ParsedUserAgentProperties => {
  const result = ua.parse(userAgentString);

  safeFamily(result.ua);
  safeVersion(result.ua);

  safeFamily(result.os);
  safeVersion(result.os);

  return result;
};

export const parseToScalars = (
  userAgentString: string | undefined
): UAScalarProperties => {
  const matches = SYNC_USER_AGENT.exec(userAgentString || '');
  if (matches && matches.length > 2) {
    // Always parse known Sync user-agents ourselves,
    // because node-uap makes a pig's ear of it.
    return {
      browser: safeReturnName(matches[6] || matches[1]),
      browserVersion: safeReturnVersion(matches[3]),
      os: safeReturnName(matches[2]),
      osVersion: safeReturnVersion(matches[5]),
      deviceType: marshallDeviceType(matches[4]),
      formFactor: safeReturnName(matches[4]),
    };
  }

  const parsed = parse(userAgentString);
  return {
    browser: safeReturnName(getFamily(parsed.ua)),
    browserVersion: safeReturnVersion(parsed.ua.toVersionString()),
    os: safeReturnName(getFamily(parsed.os)),
    osVersion: safeReturnVersion(parsed.os.toVersionString()),
    deviceType: getDeviceType(parsed) || null,
    formFactor: safeReturnName(getFormFactor(parsed)),
  };
};

export const isToVersionStringSupported = (
  result: ParsedUserAgentProperties
): boolean => {
  if (!result) {
    result = parse(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:65.0) Gecko/20100101 Firefox/65.0'
    );
  }
  if (!result || !result.os || !result.ua) {
    return false;
  }
  if (typeof result.os.toVersionString !== 'function') {
    return false;
  }
  if (typeof result.ua.toVersionString !== 'function') {
    return false;
  }
  return true;
};

function safeReturnString(str: string, regex: RegExp): string | null {
  return regex.test(str) ? str : null;
}

function safeReturnName(str: string): string | null {
  return safeReturnString(str, VALID_FAMILY_OR_NAME);
}

function safeReturnVersion(str: string): string | null {
  return safeReturnString(str, VALID_VERSION);
}

function safeFamily(parent: ParsedUa) {
  if (!VALID_FAMILY_OR_NAME.test(parent.family as string)) {
    parent.family = null;
  }
}

function safeVersion(parent: ParsedOs) {
  if (
    parent &&
    parent.toVersionString &&
    !VALID_VERSION.test(parent.toVersionString())
  ) {
    parent.major = parent.minor = parent.patch = parent.patchMinor = null;
  }
}

function getFamily(data: ParsedUa | ParsedOs | ParsedDevice) {
  return data.family && data.family !== 'Other' ? data.family : '';
}

function getDeviceType(data: ParsedUserAgentProperties) {
  if (getFamily(data.device) || isMobileOS(data)) {
    if (isTablet(data)) {
      return 'tablet';
    } else {
      return 'mobile';
    }
  }
  return null;
}

function isMobileOS(data: ParsedUserAgentProperties) {
  return (
    MOBILE_OS_FAMILIES.has(data.os.family || '') ||
    MOBILE_UA_OS_FAMILIES.has(data.ua.family || '')
  );
}

function isTablet(data: ParsedUserAgentProperties) {
  return isIpad(data) || isAndroidTablet(data) || isGenericTablet(data);
}

function isIpad(data: ParsedUserAgentProperties) {
  return (
    /iPad/.test(data.device.family || '') || isDesktopUaOnIpadFirefox(data)
  );
}

// iPads using FF iOS 13+ send a desktop UA.
// The OS shows as a Mac, but 'Firefox iOS' in the UA family.
function isDesktopUaOnIpadFirefox(data: ParsedUserAgentProperties) {
  return (
    /Mac/.test(data.os.family || '') &&
    MOBILE_UA_OS_FAMILIES.has(data.ua.family || '')
  );
}

function isAndroidTablet(data: ParsedUserAgentProperties) {
  return (
    data.os.family === 'Android' &&
    data.userAgent.indexOf('Mobile') === -1 &&
    data.userAgent.indexOf('AndroidSync') === -1
  );
}

function isGenericTablet(data: ParsedUserAgentProperties) {
  return data.device.brand === 'Generic' && data.device.model === 'Tablet';
}

function getFormFactor(data: ParsedUserAgentProperties) {
  if (isDesktopUaOnIpadFirefox(data)) {
    return 'iPad';
  } else if (data.device.brand !== 'Generic') {
    return getFamily(data.device);
  }
  return '';
}

function marshallDeviceType(formFactor: string) {
  if (/iPad/.test(formFactor) || /tablet/i.test(formFactor)) {
    return 'tablet';
  }

  return 'mobile';
}

export default {
  parse,
  parseToScalars,
  isToVersionStringSupported,
  safeName: safeReturnName,
  safeVersion: safeReturnVersion,
};
