/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, TestHelpers, FunctionalHelpers) {
  var config = intern.config;
  var PAGE_URL = config.fxaContentRoot + 'signup?context=iframe&service=sync';

  var SIGNIN_URL = config.fxaContentRoot + 'signin';

  var email;
  var PASSWORD = '12345678';

  var clearBrowserState = FunctionalHelpers.clearBrowserState;
  var closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
  var fillOutSignUp = FunctionalHelpers.fillOutSignUp;
  var openPage = FunctionalHelpers.openPage;
  var respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;
  var testEmailExpected = FunctionalHelpers.testEmailExpected;

  registerSuite({
    name: 'Firstrun Sync v1 sign_up',

    beforeEach: function () {
      email = TestHelpers.createEmail();
    },

    afterEach: function () {
      return this.remote
        .then(clearBrowserState())
        // ensure the next test suite (bounced_email) loads a fresh
        // signup page. If a fresh signup page is not forced, the
        // bounced_email tests try to sign up using the Sync broker,
        // resulting in a channel timeout.
        .then(openPage(SIGNIN_URL, '#fxa-signin-header'));
    },

    'sign up, verify same browser in a different tab': function () {
      var self = this;

      return this.remote
        .then(openPage(PAGE_URL, '#fxa-signup-header'))
        .then(respondToWebChannelMessage(self, 'fxaccounts:can_link_account', { ok: true } ))
        .then(fillOutSignUp(email, PASSWORD))

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(FunctionalHelpers.testIsBrowserNotified(self, 'fxaccounts:can_link_account'))
        .then(FunctionalHelpers.testIsBrowserNotified(self, 'fxaccounts:login'))


        // verify the user
        .then(function () {
          return FunctionalHelpers.openVerificationLinkInNewTab(
                self, email, 0);
        })
        .switchToWindow('newwindow')

        // user should be redirected to "Success!" screen.
        // In real life, the original browser window would show
        // a "welcome to sync!" screen that has a manage button
        // on it, and this screen should show the FxA success screen.
        .findByCssSelector('#fxa-sign-up-complete-header')
        .end()

        .findByCssSelector('.account-ready-service')
        .getVisibleText()
        .then(function (text) {
          assert.ok(text.indexOf('Firefox Sync') > -1);
        })

        .end()
        // switch back to the original window, it should transition.
        .then(closeCurrentWindow())

        .findByCssSelector('#fxa-sign-up-complete-header')
        .end()

        // A post-verification email should be sent, this is Sync.
        .then(testEmailExpected(email, 1));
    },

    'sign up, cancel merge warning': function () {
      var self = this;
      return this.remote
        .then(openPage(PAGE_URL, '#fxa-signup-header'))
        .then(respondToWebChannelMessage(self, 'fxaccounts:can_link_account', { ok: false } ))
        .then(fillOutSignUp(email, PASSWORD))

        .then(FunctionalHelpers.testIsBrowserNotified(self, 'fxaccounts:can_link_account'))

        // user should not transition to the next screen
        .then(FunctionalHelpers.noSuchElement(self, '#fxa-confirm-header'))
        .end();
    }
  });
});
