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
  var PAGE_URL = config.fxaContentRoot + 'signup?context=fx_firstrun_v2&service=sync';

  var SIGNIN_URL = config.fxaContentRoot + 'signin';

  var email;
  var PASSWORD = '12345678';

  var listenForFxaCommands = FunctionalHelpers.listenForWebChannelMessage;
  var respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;

  registerSuite({
    name: 'Firefox Firstrun Sync v2 sign_up',

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
          return self.remote
            .get(require.toUrl(SIGNIN_URL))

            .findByCssSelector('#fxa-signin-header')
            .end();
        });
    },

    'sign up, verify same browser': function () {
      var self = this;

      return FunctionalHelpers.openPage(this, PAGE_URL, '#fxa-signup-header')
        .execute(listenForFxaCommands)

        .then(respondToWebChannelMessage(self, 'fxaccounts:can_link_account', { ok: true } ))

        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD);
        })

        .then(FunctionalHelpers.testIsBrowserNotified(self, 'fxaccounts:can_link_account'))
        .then(FunctionalHelpers.testIsBrowserNotified(self, 'fxaccounts:login'))

        // user should be transitioned to the "go confirm your address" page
        .findByCssSelector('#fxa-confirm-header')
        .end()

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
        .findById('fxa-sign-up-complete-header')
        .end()

        .findByCssSelector('.account-ready-service')
          .getVisibleText()
          .then(function (text) {
            assert.ok(text.indexOf('Firefox Sync') > -1);
          })
        .end()

        // attempt to open sync preferences
        .findByCssSelector('#sync-preferences')
          .click()
        .end()

        .then(FunctionalHelpers.testIsBrowserNotified(self, 'fxaccounts:sync_preferences', function (data) {
          assert.equal(data.entryPoint, 'fxa:signup-complete');
        }))

        .closeCurrentWindow()

        // switch back to the original window, it should transition.
        .switchToWindow('')
        .end()

        .findByCssSelector('#fxa-sign-up-complete-header')
        .end()

        // original window should have a `sync-preferences` button in
        // case the user wants to open preferences.
        .findByCssSelector('#sync-preferences')
          .click()
        .end()

        .then(FunctionalHelpers.testIsBrowserNotified(self, 'fxaccounts:sync_preferences', function (data) {
          assert.equal(data.entryPoint, 'fxa:signup-complete');
        }));
    }
  });
});
