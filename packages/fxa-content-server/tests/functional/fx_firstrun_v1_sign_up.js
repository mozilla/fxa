/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, TestHelpers, FunctionalHelpers) {
  const config = intern.config;
  const PAGE_URL = config.fxaContentRoot + 'signup?context=iframe&service=sync';

  var email;
  const PASSWORD = '12345678';

  const clearBrowserState = FunctionalHelpers.clearBrowserState;
  const closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
  const fillOutSignUp = FunctionalHelpers.fillOutSignUp;
  const noSuchElement = FunctionalHelpers.noSuchElement;
  const openPage = FunctionalHelpers.openPage;
  const openVerificationLinkInNewTab = FunctionalHelpers.openVerificationLinkInNewTab;
  const respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;
  const testElementExists = FunctionalHelpers.testElementExists;
  const testEmailExpected = FunctionalHelpers.testEmailExpected;
  const testIsBrowserNotified = FunctionalHelpers.testIsBrowserNotified;
  const visibleByQSA = FunctionalHelpers.visibleByQSA;

  registerSuite({
    name: 'Firstrun Sync v1 sign_up',

    beforeEach: function () {
      email = TestHelpers.createEmail();
    },

    afterEach: function () {
      return this.remote
        .then(clearBrowserState());
    },

    'sign up, verify same browser in a different tab': function () {
      return this.remote
        .then(openPage(PAGE_URL, '#fxa-signup-header'))
        .then(visibleByQSA('#fxa-signup-header .service'))
        .then(respondToWebChannelMessage('fxaccounts:can_link_account', { ok: true } ))
        .then(fillOutSignUp(email, PASSWORD))

        .then(testElementExists('#fxa-confirm-header'))
        .then(testIsBrowserNotified('fxaccounts:can_link_account'))
        .then(testIsBrowserNotified('fxaccounts:login'))


        // verify the user
        .then(openVerificationLinkInNewTab(email, 0))
        .switchToWindow('newwindow')

        // user should be redirected to "Success!" screen.
        // In real life, the original browser window would show
        // a "welcome to sync!" screen that has a manage button
        // on it, and this screen should show the FxA success screen.
        .then(testElementExists('#fxa-connect-another-device-header'))
        // switch back to the original window, it should transition.
        .then(closeCurrentWindow())

        .then(testElementExists('#fxa-sign-up-complete-header'))

        // A post-verification email should be sent, this is Sync.
        .then(testEmailExpected(email, 1));
    },

    'sign up, cancel merge warning': function () {
      return this.remote
        .then(openPage(PAGE_URL, '#fxa-signup-header'))
        .then(respondToWebChannelMessage('fxaccounts:can_link_account', { ok: false } ))
        .then(fillOutSignUp(email, PASSWORD))

        // user should not transition to the next screen
        .then(noSuchElement('#fxa-confirm-header'))
        .then(testIsBrowserNotified('fxaccounts:can_link_account'));
    }
  });
});
