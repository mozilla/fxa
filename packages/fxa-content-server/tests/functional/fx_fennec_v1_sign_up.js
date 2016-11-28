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

  var email;
  var PASSWORD = '12345678';

  var closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
  var fillOutSignUp = FunctionalHelpers.fillOutSignUp;
  var openPage = FunctionalHelpers.openPage;
  var respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;
  var testEmailExpected = FunctionalHelpers.testEmailExpected;

  registerSuite({
    name: 'Fx Fennec Sync v1 sign_up',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      return this.remote
        .then(FunctionalHelpers.clearBrowserState());
    },

    afterEach: function () {
      return this.remote
        .then(FunctionalHelpers.clearBrowserState());
    },

    'sign up, verify same browser': function () {
      var self = this;

      return this.remote
        .then(openPage(PAGE_URL, '#fxa-signup-header'))
        .then(respondToWebChannelMessage(self, 'fxaccounts:can_link_account', { ok: true } ))

        .then(FunctionalHelpers.noSuchElement(self, '#customize-sync'))

        .then(fillOutSignUp(email, PASSWORD))

        .then(FunctionalHelpers.testIsBrowserNotified(self, 'fxaccounts:can_link_account'))
        // the login message is only sent after the confirm screen is shown.
        .then(FunctionalHelpers.noSuchBrowserNotification(self, 'fxaccounts:login'))

        // user should be transitioned to the choose what to Sync page
        .findByCssSelector('#fxa-choose-what-to-sync-header')
        .end()

        // uncheck the passwords and history engines
        .findByCssSelector('div.two-col-block:nth-child(2) > div:nth-child(1) > label:nth-child(1)')
          .click()
        .end()

        .findByCssSelector('div.two-col-block:nth-child(2) > div:nth-child(2) > label:nth-child(1)')
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

        .then(closeCurrentWindow())

        .findByCssSelector('#fxa-sign-up-complete-header')
        .end()

        // A post-verification email should be sent, this is Sync.
        .then(testEmailExpected(email, 1));

    }
  });
});
