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

        .then(FunctionalHelpers.noSuchElement(self, '#customize-sync'))

        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD);
        })

        .then(FunctionalHelpers.testIsBrowserNotified(self, 'fxaccounts:can_link_account'))
        // the login message is only sent after the confirm screen is shown.
        .then(FunctionalHelpers.noSuchBrowserNotification(self, 'fxaccounts:login'))

        // user should be transitioned to the choose what to Sync page
        .findByCssSelector('#fxa-choose-what-to-sync-header')
        .end()

        // uncheck the passwords and history engines
        .findByCssSelector('input[value="passwords"]')
          .click()
        .end()

        .findByCssSelector('input[value="history"]')
          .click()
        .end()

        .findByCssSelector('button[type=submit]')
          .click()
        .end()

        // user should be transitioned to the "go confirm your address" page
        .findByCssSelector('#fxa-confirm-header')
        .end()

        // the login message is only sent after the sync preferences screen
        // has been cleared.
        .then(FunctionalHelpers.testIsBrowserNotified(self, 'fxaccounts:login', function (data) {
          assert.isTrue(data.customizeSync);
          assert.deepEqual(data.declinedSyncEngines, ['passwords', 'history']);
          assert.equal(data.email, email);
          assert.ok(data.keyFetchToken);
          assert.ok(data.sessionToken);
          assert.ok(data.uid);
          assert.ok(data.unwrapBKey);
          assert.isFalse(data.verified);
          assert.isTrue(data.verifiedCanLinkAccount);
        }))

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

          // user can open sync preferences in new tab.
        .then(FunctionalHelpers.noSuchBrowserNotification(self, 'fxaccounts:sync_preferences'))

        // user should be able to open sync preferences
        .findByCssSelector('#sync-preferences')
          // user wants to open sync preferences.
          .click()
        .end()

        // browser is notified of desire to open Sync preferences
        .then(FunctionalHelpers.testIsBrowserNotified(self, 'fxaccounts:sync_preferences'))


        .closeCurrentWindow()
        .switchToWindow('')
        .end()

        .findByCssSelector('#fxa-sign-up-complete-header')
        .end()

        .then(FunctionalHelpers.noSuchBrowserNotification(self, 'fxaccounts:sync_preferences'))

        // user can open sync preferences in original tab.
        .findByCssSelector('#sync-preferences')
          // user wants to open sync preferences.
          .click()
        .end()

        // browser is notified of desire to open Sync preferences
        .then(FunctionalHelpers.testIsBrowserNotified(self, 'fxaccounts:sync_preferences'));

    }
  });
});
