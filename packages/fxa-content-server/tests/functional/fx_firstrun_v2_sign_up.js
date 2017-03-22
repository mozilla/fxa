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
  const PAGE_URL = config.fxaContentRoot + 'signup?context=fx_firstrun_v2&service=sync';

  var email;
  const PASSWORD = '12345678';

  const clearBrowserState = FunctionalHelpers.clearBrowserState;
  const click = FunctionalHelpers.click;
  const closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
  const fillOutSignUp = FunctionalHelpers.fillOutSignUp;
  const openPage = FunctionalHelpers.openPage;
  const openVerificationLinkInNewTab = FunctionalHelpers.openVerificationLinkInNewTab;
  const respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;
  const testElementExists = FunctionalHelpers.testElementExists;
  const testElementTextInclude = FunctionalHelpers.testElementTextInclude;
  const testEmailExpected = FunctionalHelpers.testEmailExpected;
  const testIsBrowserNotified = FunctionalHelpers.testIsBrowserNotified;

  registerSuite({
    name: 'Firstrun Sync v2 sign_up',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      return this.remote
        .then(clearBrowserState());
    },

    afterEach: function () {
      return this.remote
        .then(clearBrowserState());
    },

    'sign up, verify same browser': function () {
      return this.remote
        .then(openPage(PAGE_URL, '#fxa-signup-header'))
        .then(respondToWebChannelMessage('fxaccounts:can_link_account', { ok: true } ))

        .then(fillOutSignUp(email, PASSWORD))

        .then(testIsBrowserNotified('fxaccounts:can_link_account'))
        .then(testElementExists('#fxa-choose-what-to-sync-header'))

        // uncheck the passwords and history engines
        .then(click('div.two-col-block:nth-child(2) > div:nth-child(1) > label:nth-child(1)'))
        .then(click('div.two-col-block:nth-child(1) > div:nth-child(3) > label:nth-child(1)'))
        .then(click('button[type=submit]'))

        // user should be transitioned to the "go confirm your address" page
        .then(testElementExists('#fxa-confirm-header'))
        // the login message is only sent after the sync preferences screen
        // has been cleared.
        .then(testIsBrowserNotified('fxaccounts:login'))

        // verify the user
        .then(openVerificationLinkInNewTab(email, 0))
        .switchToWindow('newwindow')

        // user should be redirected to "Success!" screen.
        // In real life, the original browser window would show
        // a "welcome to sync!" screen that has a manage button
        // on it, and this screen should show the FxA success screen.
        .then(testElementExists('#fxa-sign-up-complete-header'))
        .then(testElementTextInclude('.account-ready-service', 'Firefox Sync'))

        // switch back to the original window, it should transition.
        .then(closeCurrentWindow())
        .then(testElementExists('#fxa-sign-up-complete-header'))
        // A post-verification email should be sent, this is Sync.
        .then(testEmailExpected(email, 1));
    }
  });
});
