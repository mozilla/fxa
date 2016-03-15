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
  var openForceAuth = FunctionalHelpers.openForceAuth;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testIsBrowserNotified = thenify(FxDesktopHelpers.testIsBrowserNotifiedOfMessage);

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
      .then(fillOutForceAuth(PASSWORD));
  });

  registerSuite({
    name: 'Firefox Desktop Sync force_auth',

    beforeEach: function () {
      email = TestHelpers.createEmail();
    },

    'verified': function () {
      return this.remote
        .then(setupTest(this, true))

        // add a slight delay to ensure the page does not transition
        .sleep(1000)

        // the page does not transition.
        .then(testElementExists('#fxa-force-auth-header'))
        .then(testIsBrowserNotified(this, 'can_link_account'))
        .then(testIsBrowserNotified(this, 'login'));
    },

    'unverified': function () {
      return this.remote
        .then(setupTest(this, false))

        .then(testElementExists('#fxa-confirm-header'))
        .then(testIsBrowserNotified(this, 'can_link_account'))
        .then(testIsBrowserNotified(this, 'login'));
    }
  });
});
