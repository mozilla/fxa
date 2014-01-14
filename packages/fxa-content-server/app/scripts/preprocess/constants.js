/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([], function () {
  return {
    FXA_ACCOUNT_SERVER: '/* @echo fxaccountUrl */',

    // All browsers have a max length of URI that they can handle.
    // IE8 has the shortest total length at 2083 bytes and 2048 characters
    // for GET requests.
    // See http://support.microsoft.com/kb/q208427
    URL_MAX_LENGTH: 2048
  };
});

