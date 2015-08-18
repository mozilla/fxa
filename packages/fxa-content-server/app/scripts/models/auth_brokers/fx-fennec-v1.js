/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The auth broker to coordinate authenticating for Sync when
 * embedded in Firefox for Android.
 */

define([
  'models/auth_brokers/fx-desktop-v2'
], function (FxDesktopV2AuthenticationBroker) {
  'use strict';

  var FxFennecV1AuthenticationBroker = FxDesktopV2AuthenticationBroker.extend({
    type: 'fx-fennec-v1',

    haltAfterResetPasswordConfirmationPoll: false,
    haltAfterSignIn: false,
    haltBeforeSignUpConfirmationPoll: false
  });

  return FxFennecV1AuthenticationBroker;
});
