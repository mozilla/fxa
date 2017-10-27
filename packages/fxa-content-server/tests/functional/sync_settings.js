/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/fx-desktop'
], function (intern, registerSuite, TestHelpers, FunctionalHelpers,
  FxDesktopHelpers) {

  const {
    clearBrowserState,
    click,
    createUser,
    fillOutChangePassword,
    fillOutDeleteAccount,
    fillOutSignIn,
    noSuchElement,
    openPage,
    openVerificationLinkInDifferentBrowser,
    testElementExists,
    thenify,
    visibleByQSA,
  } = FunctionalHelpers;

  const {
    listenForFxaCommands,
    testIsBrowserNotifiedOfLogin,
    testIsBrowserNotifiedOfMessage,
  } = FxDesktopHelpers;

  var config = intern.config;
  var SIGNIN_URL = config.fxaContentRoot + 'signin?context=fx_desktop_v1&service=sync';
  var SETTINGS_URL = config.fxaContentRoot + 'settings?context=fx_desktop_v1&service=sync';

  var FIRST_PASSWORD = 'password';
  var SECOND_PASSWORD = 'new_password';
  var email;


  var setupTest = thenify(function (shouldVerifySignin) {
    return this.parent
      .then(createUser(email, FIRST_PASSWORD, { preVerified: true }))
      .then(clearBrowserState())
      .then(openPage(SIGNIN_URL, '#fxa-signin-header'))
      .execute(listenForFxaCommands)
      .then(fillOutSignIn(email, FIRST_PASSWORD))
      .then(testIsBrowserNotifiedOfLogin(email, { expectVerified: false }))

      .then(function () {
        if (shouldVerifySignin) {
          return this.parent
            .then(openVerificationLinkInDifferentBrowser(email))

            .then(openPage(SETTINGS_URL, '#fxa-settings-header'))
            .execute(listenForFxaCommands);
        }
      });
  });

  registerSuite({
    name: 'Firefox Desktop Sync v1 settings',

    beforeEach: function () {
      email = TestHelpers.createEmail('sync{id}');
    },

    'sign in, change the password': function () {
      return this.remote
        .then(setupTest(true))
        .then(click('#change-password .settings-unit-toggle'))
        .then(visibleByQSA('#change-password .settings-unit-details'))

        .then(fillOutChangePassword(FIRST_PASSWORD, SECOND_PASSWORD));
    },

    'sign in, delete the account': function () {
      return this.remote
        .then(setupTest(true))
        .then(click('#delete-account .settings-unit-toggle'))
        .then(visibleByQSA('#delete-account .settings-unit-details'))

        .then(fillOutDeleteAccount(FIRST_PASSWORD))
        .then(testIsBrowserNotifiedOfMessage('delete_account'))

        .then(testElementExists('#fxa-signup-header'));
    },

    'sign in, no way to sign out': function () {
      return this.remote
        .then(setupTest(true))
        // make sure the sign out element doesn't exist
        .then(noSuchElement('#signout'));
    },

    'sign in, do not confirm signin, load settings': function () {
      return this.remote
        .then(setupTest(false))
        // the user did not confirm signin and must do so
        .then(openPage(SETTINGS_URL, '#fxa-confirm-signin-header'));
    }
  });
});
