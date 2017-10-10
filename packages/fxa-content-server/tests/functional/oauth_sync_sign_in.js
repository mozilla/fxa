/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/fx-desktop'
], function (intern, registerSuite, TestHelpers, FunctionalHelpers,
             FxDesktopHelpers) {
  var config = intern.config;
  var PAGE_URL = config.fxaContentRoot + 'signin?context=fx_desktop_v1&service=sync';

  var email;
  var email2;
  var PASSWORD = '12345678';

  const {
    click,
    closeCurrentWindow,
    createUser,
    fillOutSignIn,
    fillOutSignUp,
    openFxaFromRp,
    openPage,
    openVerificationLinkInNewTab,
    switchToWindow,
    testElementExists,
    testElementTextEquals,
    visibleByQSA,
  } = FunctionalHelpers;

  const {
    listenForFxaCommands,
    testIsBrowserNotifiedOfLogin,
  } = FxDesktopHelpers;

  registerSuite({
    name: 'signin with OAuth after Sync',

    beforeEach: function () {
      email = TestHelpers.createEmail('sync{id}');
      email2 = TestHelpers.createEmail();

      // clear localStorage to avoid pollution from other tests.
      return this.remote
        .then(FunctionalHelpers.clearBrowserState({
          '123done': true,
          contentServer: true
        }));
    },

    afterEach: function () {
      return this.remote
        .then(FunctionalHelpers.clearBrowserState({
          '123done': true,
          contentServer: true
        }));
    },

    'signin to OAuth with Sync creds': function () {
      this.timeout = 60 * 1000;
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openPage(PAGE_URL, '#fxa-signin-header'))
        .execute(listenForFxaCommands)

        .then(fillOutSignIn(email, PASSWORD))
        .then(testElementExists('#fxa-confirm-signin-header'))
        .then(testIsBrowserNotifiedOfLogin(email))

        // Sync signins must be verified.
        .then(openVerificationLinkInNewTab(email, 0))

        .then(switchToWindow(1))
        .then(testElementExists('#fxa-sign-in-complete-header'))
        .then(closeCurrentWindow())

        // Sign up for a new account via OAuth
        .then(openFxaFromRp('signup'))
        .then(fillOutSignUp(email2, PASSWORD))

        .then(testElementExists('#fxa-confirm-header'))
        .then(openVerificationLinkInNewTab(email2, 0))
        .then(switchToWindow(1))

        // wait for the verified window in the new tab
        .then(testElementExists('#fxa-sign-up-complete-header'))

        // switch to the original window
        .then(closeCurrentWindow())

        // RP is logged in, logout then back in again.
        .then(testElementExists('#loggedin'))
        .then(click('#logout'))

        .then(visibleByQSA('.ready #splash .signin'))
        .then(click('.ready #splash .signin'))

        .then(testElementExists('#fxa-signin-header'))

        // By default, we should see the email we signed up for Sync with
        .then(testElementTextEquals('.prefillEmail', email))

        // no need to enter the password!
        .then(click('button[type="submit"]'))

        // We should see the email we signed up for Sync with
        .then(testElementTextEquals('#loggedin', email));
    }
  });
});
