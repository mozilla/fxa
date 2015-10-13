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
  var PAGE_URL = config.fxaContentRoot + 'signup?context=fx_ios_v2&service=sync';

  var SIGNIN_URL = config.fxaContentRoot + 'signin';

  var email;
  var PASSWORD = '12345678';

  var listenForFxaCommands = FxDesktopHelpers.listenForFxaCommands;

  registerSuite({
    name: 'FxiOS v2 sign_up',

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
        .then(FunctionalHelpers.testIsBrowserNotified(self, 'login', function (data) {
          assert.isTrue(data.customizeSync);
          assert.deepEqual(data.declinedSyncEngines, ['history', 'passwords']);
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
          return FunctionalHelpers.openVerificationLinkSameBrowser(
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
    }
  });
});
