/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * List of reasons a user must perform some form of verification.
 */

define(function (require, exports, module) {
  'use strict';

  return {
    FORCE_AUTH: 'force_auth',
    PASSWORD_RESET: 'reset_password',
    PRIMARY_EMAIL_VERIFIED: 'primary_email_verified',
    SECONDARY_EMAIL_VERIFIED: 'secondary_email_verified',
    SIGN_IN: 'login',
    SIGN_UP: 'signup'
  };
});

