/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern/chai!assert',
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/fx-desktop'
], function (intern, assert, registerSuite, TestHelpers, FunctionalHelpers, FxDesktopHelpers) {
  var config = intern.config;
  var PAGE_URL = config.fxaContentRoot + 'signup?context=fx_ios_v1&service=sync';

  var email;
  var PASSWORD = '12345678';

  var clearBrowserState = FunctionalHelpers.clearBrowserState;
  var closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
  var fillOutSignUp = FunctionalHelpers.fillOutSignUp;
  var listenForFxaCommands = FxDesktopHelpers.listenForFxaCommands;
  var openPage = FunctionalHelpers.openPage;
  var testEmailExpected = FunctionalHelpers.testEmailExpected;
  var testIsBrowserNotifiedOfLogin = FxDesktopHelpers.testIsBrowserNotifiedOfLogin;

  registerSuite({
    name: 'FxiOS v1 sign_up',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      return this.remote.then(clearBrowserState());
    },

    afterEach: function () {
      return this.remote
        .then(clearBrowserState());
    },

    'sign up, verify same browser': function () {
      var self = this;

      return this.remote
        .then(openPage(PAGE_URL, '#fxa-signup-header'))
        .execute(listenForFxaCommands)
        .then(FunctionalHelpers.noSuchElement(self, '#customize-sync'))
        .then(fillOutSignUp(email, PASSWORD))

        .findByCssSelector('#fxa-confirm-header')
          .then(function () {
            return testIsBrowserNotifiedOfLogin(self, email);
          })
        .end()

        // verify the user
        .then(function () {
          return FunctionalHelpers.openVerificationLinkInNewTab(
                self, email, 0);
        })
        .switchToWindow('newwindow')

        .findByCssSelector('#fxa-sign-up-complete-header')
        .end()

        .findByCssSelector('.account-ready-service')
          .getVisibleText()
          .then(function (text) {
            assert.ok(text.indexOf('Firefox Sync') > -1);
          })
        .end()

        .then(closeCurrentWindow())

        .findByCssSelector('#fxa-confirm-header')
        .end()

        // A post-verification email should be sent, this is Sync.
        .then(testEmailExpected(email, 1));
    }
  });
});
