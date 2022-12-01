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
  ua: ParsedUa;
  os: ParsedOs;
  device: ParsedDevice;
};

// Safe wrapper around node-uap, which prevents unsafe input from
// leaking back to the result data.

// @ts-ignore
import * as ua from 'node-uap';

// We know this won't match "Symbian^3", "UI/WKWebView" or "Mail.ru" but
// it's simpler and safer to limit to alphanumerics, underscore and space.
const VALID_FAMILY = /^[\w ]{1,32}$/;

const VALID_VERSION = /^[\w.]{1,16}$/;

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

export const isToVersionStringSupported = (
  result: ParsedUserAgentProperties
): boolean => {
  if (!result) {
    result = exports.parse(
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

function safeFamily(parent: ParsedUa) {
  if (!VALID_FAMILY.test(parent.family as string)) {
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

export default { parse, isToVersionStringSupported };
