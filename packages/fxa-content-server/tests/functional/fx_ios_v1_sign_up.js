/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/fx-desktop',
  'tests/functional/lib/ua-strings',
  'tests/functional/lib/selectors'
], function (intern, registerSuite, TestHelpers, FunctionalHelpers, FxDesktopHelpers, UA_STRINGS, selectors) {
  'use strict';

  const config = intern.config;
  const PAGE_URL = `${config.fxaContentRoot}signup?context=fx_ios_v1&service=sync`;

  let email;
  const PASSWORD = '12345678';

  const {
    click,
    clearBrowserState,
    closeCurrentWindow,
    fillOutSignUp,
    noPageTransition,
    noSuchElement,
    openPage,
    openVerificationLinkInNewTab,
    switchToWindow,
    testElementExists,
    testEmailExpected,
    thenify,
  } = FunctionalHelpers;

  const {
    listenForFxaCommands,
    testIsBrowserNotifiedOfLogin,
  } = FxDesktopHelpers;

  const setupTest = thenify(function (userAgent) {
    return this.parent
      .then(openPage(PAGE_URL, selectors.SIGNUP.HEADER, {
        query: {
          forceUA: userAgent
        }
      }))
      .execute(listenForFxaCommands)
      .then(noSuchElement(selectors.SIGNUP.CUSTOMIZE_SYNC_CHECKBOX))
      .then(fillOutSignUp(email, PASSWORD))

      .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))
      .then(testIsBrowserNotifiedOfLogin(email))

      // verify the user
      .then(openVerificationLinkInNewTab(email, 0))
      .then(switchToWindow(1))

        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
        .then(closeCurrentWindow());
  });

  registerSuite({
    name: 'FxiOS v1 sign_up',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      return this.remote.then(clearBrowserState());
    },

    afterEach: function () {
      return this.remote
        .then(clearBrowserState());
    },

    'Fx iOS <= 6.0 sign up, verify same browser': function () {
      return this.remote
        .then(setupTest(UA_STRINGS['ios_firefox_6_0']))

        // no screen transition, no polling even, in Fx <= 6.0
        .then(noPageTransition(selectors.CONFIRM_SIGNUP.HEADER))

        // A post-verification email should be sent, this is Sync.
        .then(testEmailExpected(email, 1));
    },

    'Fx iOS >= 6.1 sign up, verify same browser': function () {
      return this.remote
        .then(setupTest(UA_STRINGS['ios_firefox_6_1']))

        // In Fx for iOS >= 6.1, user should redirect to the signup-complete
        // page after verification.
        .then(testElementExists(selectors.SIGNUP_COMPLETE.HEADER))

        // A post-verification email should be sent, this is Sync.
        .then(testEmailExpected(email, 1));
    },

    'Fx iOS >= 11.0 sign up, verify same browser': function () {
      return this.remote
        .then(openPage(PAGE_URL, selectors.SIGNUP.HEADER, {
          query: {
            forceUA: UA_STRINGS['ios_firefox_11_0']
          }
        }))
        .execute(listenForFxaCommands)
        .then(noSuchElement(selectors.SIGNUP.CUSTOMIZE_SYNC_CHECKBOX))
        .then(fillOutSignUp(email, PASSWORD))

        // In Fx for iOS >= 11.0, user should be transitioned to the
        // choose what to Sync page
        .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))

        // uncheck the passwords and history engines
        .then(click(selectors.CHOOSE_WHAT_TO_SYNC.ENGINE_PASSWORDS))
        .then(click(selectors.CHOOSE_WHAT_TO_SYNC.ENGINE_HISTORY))
        .then(click(selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT))

        // user should be transitioned to the "go confirm your address" page
        .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))

        // the login message is only sent after the sync preferences screen
        // has been cleared.
        .then(testIsBrowserNotifiedOfLogin(email))

        // verify the user
        .then(openVerificationLinkInNewTab(email, 0))
        .then(switchToWindow(1))

        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))

        .then(closeCurrentWindow())
        .then(testElementExists(selectors.SIGNUP_COMPLETE.HEADER))
        // A post-verification email should be sent, this is Sync.
        .then(testEmailExpected(email, 1));
    }
  });
});
