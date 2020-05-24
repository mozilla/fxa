/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Safe wrapper around node-uap, which prevents unsafe input from
// leaking back to the result data.

'use strict';

const ua = require('node-uap');

// We know this won't match "Symbian^3", "UI/WKWebView" or "Mail.ru" but
// it's simpler and safer to limit to alphanumerics, underscore and space.
const VALID_FAMILY = /^[\w ]{1,32}$/;

const VALID_VERSION = /^[\w.]{1,16}$/;

exports.parse = (userAgentString) => {
  const result = ua.parse(userAgentString);

  safeFamily(result.ua);
  safeVersion(result.ua);

  safeFamily(result.os);
  safeVersion(result.os);

  return result;
};

exports.isToVersionStringSupported = (result) => {
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

function safeFamily(parent) {
  if (!VALID_FAMILY.test(parent.family)) {
    parent.family = null;
  }
}

function safeVersion(parent) {
  if (
    parent &&
    parent.toVersionString &&
    !VALID_VERSION.test(parent.toVersionString())
  ) {
    parent.major = parent.minor = parent.patch = parent.patchMinor = null;
  }
}
