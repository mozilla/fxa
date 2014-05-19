/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([], function () {
  return {
    // All browsers have a max length of URI that they can handle.
    // IE8 has the shortest total length at 2083 bytes and 2048 characters
    // for GET requests.
    // See http://support.microsoft.com/kb/q208427
    URL_MAX_LENGTH: 2048,

    FX_DESKTOP_CONTEXT: 'fx_desktop_v1',

    SIGNUP_RESEND_MAX_TRIES: 3,
    PASSWORD_RESET_RESEND_MAX_TRIES: 3,
    RESET_PASSWORD_POLL_INTERVAL: 2000,

    CODE_LENGTH: 32,
    UID_LENGTH: 32,

    PASSWORD_MIN_LENGTH: 8
  };
});

