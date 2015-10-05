/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern/chai!assert',
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, assert, registerSuite, TestHelpers, FunctionalHelpers) {
  var config = intern.config;
  var PAGE_URL = config.fxaContentRoot + 'signup?context=fx_fennec_v1&service=sync';

  var SIGNIN_URL = config.fxaContentRoot + 'signin';

  var TOO_YOUNG_YEAR = new Date().getFullYear() - 13;
  var OLD_ENOUGH_YEAR = TOO_YOUNG_YEAR - 1;

  var email;
  var PASSWORD = '12345678';

  var listenForFxaCommands = FunctionalHelpers.listenForWebChannelMessage;
  var respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;

  registerSuite({
    name: 'Fx Fennec Sync v1 sign_up',

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

        .then(respondToWebChannelMessage(self, 'fxaccounts:can_link_account', { ok: true } ))


        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD, OLD_ENOUGH_YEAR);
        })

        .then(FunctionalHelpers.testIsBrowserNotified(self, 'fxaccounts:can_link_account'))
        .then(FunctionalHelpers.testIsBrowserNotified(self, 'fxaccounts:login'))

        // verify the user
        .then(function () {
          return FunctionalHelpers.openVerificationLinkSameBrowser(
                self, email, 0);
        })
        .switchToWindow('newwindow')

        .findByCssSelector('#fxa-sign-up-complete-header')
        .end()

        // user should be able to open sync preferences
        .findByCssSelector('#sync-preferences')
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

        .findByCssSelector('#fxa-sign-up-complete-header')
        .end()

        // user should be able to open sync preferences
        .findByCssSelector('#sync-preferences')
        .end();
    }
  });
});
