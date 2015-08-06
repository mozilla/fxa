/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, require, TestHelpers, FunctionalHelpers) {
  var config = intern.config;
  var PAGE_URL = config.fxaContentRoot + 'signup?context=iframe&service=sync';

  var SIGNIN_URL = config.fxaContentRoot + 'signin';

  var TOO_YOUNG_YEAR = new Date().getFullYear() - 13;
  var OLD_ENOUGH_YEAR = TOO_YOUNG_YEAR - 1;

  var email;
  var PASSWORD = '12345678';

  var listenForFxaCommands = FunctionalHelpers.listenForWebChannelMessage;
  var respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;

  registerSuite({
    name: 'Firstrun sign_up',

    beforeEach: function () {
      email = TestHelpers.createEmail();
    },

    afterEach: function () {
      var self = this;

      return FunctionalHelpers.clearBrowserState(this)
        .then(function () {
          // ensure the next test suite (bounced_email) loads a fresh
          // signup page. If a fresh signup page is not forced, the
          // bounced_email tests try to sign up using the Sync broker,
          // resulting in a channel timeout.
          return self.remote
            .get(require.toUrl(SIGNIN_URL))

            .findByCssSelector('#fxa-signin-header')
            .end();
        });
    },

    'sign up, verify same browser in a different tab': function () {
      var self = this;

      return FunctionalHelpers.openPage(this, PAGE_URL, '#fxa-signup-header')
        .execute(listenForFxaCommands)

        .then(respondToWebChannelMessage(self, 'fxaccounts:can_link_account', { ok: true } ))


        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD, OLD_ENOUGH_YEAR);
        })

        .then(FunctionalHelpers.testIsBrowserNotified(self, 'fxaccounts:can_link_account'))
        .then(FunctionalHelpers.testIsBrowserNotified(self, 'fxaccounts:login'))

        .findByCssSelector('#fxa-confirm-header')
        .end()

        // verify the user
        .then(function () {
          return FunctionalHelpers.openVerificationLinkSameBrowser(
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
        .closeCurrentWindow()

        // switch back to the original window, it should not transition.
        .switchToWindow('')
        .end()

        .findByCssSelector('#fxa-sign-up-complete-header')
        .end();
    },

    'sign up, cancel merge warning': function () {
      var self = this;
      return FunctionalHelpers.openPage(this, PAGE_URL, '#fxa-signup-header')
        .execute(listenForFxaCommands)

        .then(respondToWebChannelMessage(self, 'fxaccounts:can_link_account', { ok: false } ))


        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD, OLD_ENOUGH_YEAR);
        })

        .then(FunctionalHelpers.testIsBrowserNotified(self, 'fxaccounts:can_link_account'))

        // user should not transition to the next screen
        .then(FunctionalHelpers.noSuchElement(self, '#fxa-confirm-header'))
        .end();
    }
  });
});
