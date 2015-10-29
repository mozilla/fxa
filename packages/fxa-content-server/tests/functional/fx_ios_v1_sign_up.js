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
  var EXCLUDE_SIGNUP_PAGE_URL = PAGE_URL + '&exclude_signup=1';

  var SIGNIN_URL = config.fxaContentRoot + 'signin';

  var email;
  var PASSWORD = '12345678';

  var listenForFxaCommands = FxDesktopHelpers.listenForFxaCommands;
  var testIsBrowserNotifiedOfLogin = FxDesktopHelpers.testIsBrowserNotifiedOfLogin;

  registerSuite({
    name: 'FxiOS v1 sign_up',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      return FunctionalHelpers.clearBrowserState(this);
    },

    afterEach: function () {
      var self = this;

      return FunctionalHelpers.clearBrowserState(this)
        .then(function () {
          // ensure the next test suite (bounced_email) loads a fresh
          // signup page. If a fresh signup page is not forced, the
          // bounced_email tests try to sign up using the Sync broker,
          // resulting in a channel timeout.
          return FunctionalHelpers.openPage(self, SIGNIN_URL, '#fxa-signin-header');
        });
    },

    'sign up, verify same browser': function () {
      var self = this;

      return FunctionalHelpers.openPage(this, PAGE_URL, '#fxa-signup-header')
        .execute(listenForFxaCommands)

        .then(FunctionalHelpers.noSuchElement(self, '#customize-sync'))

        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD);
        })

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

        .closeCurrentWindow()
        .switchToWindow('')
        .end()

        .findByCssSelector('#fxa-confirm-header')
        .end();
    },

    'user is redirected to /signin and shown an error message when exclude_signup=1': function () {
      var self = this;
      return FunctionalHelpers.openPage(self, EXCLUDE_SIGNUP_PAGE_URL, '#fxa-signin-header')
        .execute(listenForFxaCommands)

        // an error is visible
        .then(FunctionalHelpers.visibleByQSA('.error'))

        .then(FunctionalHelpers.noSuchElement(self, 'a[href="/signup"]'));
    }
  });
});
