/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// stub out the fxa-client object for testing.

define([
], function () {
  'use strict';

  function FxaClientWrapper() {
  }

  [
    '_checkForDesktopSyncRelinkWarning',
    '_getClientAsync',
    '_getFxAccountUrl',
    'getRandomBytes',
    'checkPassword',
    'signIn',
    'signUp',
    'signUpResend',
    'signOut',
    'verifyCode',
    'passwordReset',
    'passwordResetResend',
    'completePasswordReset',
    'isPasswordResetComplete',
    'changePassword',
    'deleteAccount',
    'certificateSign',
    'sessionStatus',
    'isSignedIn',
    'recoveryEmailStatus'
  ]
  .forEach(function (method) {
    FxaClientWrapper.prototype[method] = function () { };
  });

  return FxaClientWrapper;
});
