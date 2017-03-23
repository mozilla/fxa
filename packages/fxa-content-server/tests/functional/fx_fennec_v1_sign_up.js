/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, TestHelpers, FunctionalHelpers) {
  var config = intern.config;
  var PAGE_URL = config.fxaContentRoot + 'signup?context=fx_fennec_v1&service=sync';

  var email;
  var PASSWORD = '12345678';

  var click = FunctionalHelpers.click;
  var closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
  var fillOutSignUp = FunctionalHelpers.fillOutSignUp;
  var noSuchElement = FunctionalHelpers.noSuchElement;
  var noSuchBrowserNotification = FunctionalHelpers.noSuchBrowserNotification;
  var openPage = FunctionalHelpers.openPage;
  var openVerificationLinkInNewTab = FunctionalHelpers.openVerificationLinkInNewTab;
  var respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testEmailExpected = FunctionalHelpers.testEmailExpected;
  var testIsBrowserNotified = FunctionalHelpers.testIsBrowserNotified;

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
      return this.remote
        .then(openPage(PAGE_URL, '#fxa-signup-header'))
        .then(respondToWebChannelMessage('fxaccounts:can_link_account', { ok: true } ))
        .then(noSuchElement('#customize-sync'))
        .then(fillOutSignUp(email, PASSWORD))

        .then(testIsBrowserNotified('fxaccounts:can_link_account'))
        // the login message is only sent after the confirm screen is shown.
        .then(noSuchBrowserNotification('fxaccounts:login'))
        // user should be transitioned to the choose what to Sync page
        .then(testElementExists('#fxa-choose-what-to-sync-header'))
        // uncheck the passwords and history engines
        .then(click('div.two-col-block:nth-child(2) > div:nth-child(1) > label:nth-child(1)'))
        .then(click('div.two-col-block:nth-child(2) > div:nth-child(2) > label:nth-child(1)'))
        .then(click('button[type=submit]'))

        // user should be transitioned to the "go confirm your address" page
        .then(testElementExists('#fxa-confirm-header'))

        // the login message is only sent after the sync preferences screen
        // has been cleared.
        .then(testIsBrowserNotified('fxaccounts:login'))

        // verify the user
        .then(openVerificationLinkInNewTab(email, 0))
        .switchToWindow('newwindow')

        .then(testElementExists('#fxa-connect-another-device-header'))

        .then(closeCurrentWindow())
        .then(testElementExists('#fxa-sign-up-complete-header'))
        // A post-verification email should be sent, this is Sync.
        .then(testEmailExpected(email, 1));

    }
  });
});
