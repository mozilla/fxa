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
  var PAGE_URL = config.fxaContentRoot + 'signup?context=fx_desktop_v3&service=sync&forceAboutAccounts=true';

  var SIGNIN_URL = config.fxaContentRoot + 'signin';

  var email;
  var PASSWORD = '12345678';

  var closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
  var noPageTransition = FunctionalHelpers.noPageTransition;
  var respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;
  var testEmailExpected = FunctionalHelpers.testEmailExpected;

  registerSuite({
    name: 'Firefox Desktop Sync v3 sign_up',

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
        .then(respondToWebChannelMessage(self, 'fxaccounts:can_link_account', { ok: true } ))
        .then(FunctionalHelpers.noSuchElement(this, '#suggest-sync'))

        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD);
        })

        .then(FunctionalHelpers.testIsBrowserNotified(self, 'fxaccounts:can_link_account'))

        .then(FunctionalHelpers.noSuchBrowserNotification(self, 'fxaccounts:login'))

        // user should be transitioned to the choose what to Sync page
        .findByCssSelector('#fxa-choose-what-to-sync-header')
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

        .then(closeCurrentWindow())

        // We do not expect the verification poll to occur. The poll
        // will take a few seconds to complete if it erroneously occurs.
        // Add an affordance just in case the poll happens unexpectedly.
        .then(noPageTransition('#fxa-confirm-header', 5000))

        // A post-verification email should be sent, this is Sync.
        .then(testEmailExpected(email, 1));
    }
  });
});
