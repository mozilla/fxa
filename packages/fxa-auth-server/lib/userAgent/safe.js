/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

// We know this won't match "Symbian^3", "UI/WKWebView" or "Mail.ru" but
// it's simpler and better to limit to alphanumerics and space.
const VALID_NAME = /^[\w ]{1,32}$/;

const VALID_VERSION = /^[\w.]{1,16}$/;

module.exports = {
  name(string) {
    return returnSafely(string, VALID_NAME);
  },

  version(string) {
    return returnSafely(string, VALID_VERSION);
  },
};

function returnSafely(string, regex) {
  return regex.test(string) ? string : null;
}
