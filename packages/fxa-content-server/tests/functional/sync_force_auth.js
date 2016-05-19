/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/fx-desktop'
], function (registerSuite, TestHelpers, FunctionalHelpers, FxDesktopHelpers) {
  var thenify = FunctionalHelpers.thenify;

  var clearBrowserState = thenify(FunctionalHelpers.clearBrowserState);
  var createUser = FunctionalHelpers.createUser;
  var fillOutForceAuth = FunctionalHelpers.fillOutForceAuth;
  var listenForFxaCommands = FxDesktopHelpers.listenForFxaCommands;
  var noPageTransition = FunctionalHelpers.noPageTransition;
  var openForceAuth = FunctionalHelpers.openForceAuth;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testIsBrowserNotified = thenify(FxDesktopHelpers.testIsBrowserNotifiedOfMessage);
  var testIsBrowserNotifiedOfLogin = thenify(FxDesktopHelpers.testIsBrowserNotifiedOfLogin);

  var PASSWORD = 'password';
  var email;

  var setupTest = thenify(function (context, isUserVerified) {
    return this.parent
      .then(clearBrowserState(context))
      .then(createUser(email, PASSWORD, { preVerified: isUserVerified }))
      .then(openForceAuth({ query: {
        context: 'fx_desktop_v1',
        email: email,
        service: 'sync'
      }}))
      .execute(listenForFxaCommands)
      .then(fillOutForceAuth(PASSWORD))
      .then(testIsBrowserNotified(context, 'can_link_account'))
      .then(testIsBrowserNotifiedOfLogin(context, email, { checkVerified: isUserVerified }));
  });

  registerSuite({
    name: 'Firefox Desktop Sync v1 force_auth',

    beforeEach: function () {
      email = TestHelpers.createEmail();
    },

    'verified': function () {
      return this.remote
        .then(setupTest(this, true))

        .then(noPageTransition('#fxa-force-auth-header'));
    },

    'unverified': function () {
      return this.remote
        .then(setupTest(this, false))

        .then(testElementExists('#fxa-confirm-header'));
    }
  });
});
