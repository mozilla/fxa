/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/selectors',
  'tests/functional/lib/ua-strings'
], function (intern, registerSuite, TestHelpers,
             FunctionalHelpers, selectors, uaStrings) {
  'use strict';

  const config = intern.config;

  const PASSWORD = 'password';
  const RESET_PASSWORD_URL = `${config.fxaContentRoot}reset_password?context=fx_desktop_v3&service=sync&automatedBrowser=true&forceAboutAccounts=true`;

  let email;

  const {
    clearBrowserState,
    closeCurrentWindow,
    createUser,
    fillOutResetPassword,
    fillOutCompleteResetPassword,
    noPageTransition,
    noSuchBrowserNotification,
    openPage,
    openVerificationLinkInNewTab,
    testElementExists,
    testIsBrowserNotified,
    testSuccessWasShown,
    thenify,
  } = FunctionalHelpers;

  const setupTest = thenify(function (query) {
    return this.parent
      .then(createUser(email, PASSWORD, { preVerified: true }))
      .then(openPage(RESET_PASSWORD_URL, selectors.RESET_PASSWORD.HEADER, {
        query,
        webChannelResponses: {
          'fxaccounts:fxa_status': { capabilities: null, signedInUser: null }
        }
      }))
      .then(fillOutResetPassword(email))

      .then(testElementExists(selectors.CONFIRM_RESET_PASSWORD.HEADER))
      .then(openVerificationLinkInNewTab(email, 0))
      .switchToWindow('newwindow')

        .then(testElementExists(selectors.COMPLETE_RESET_PASSWORD.HEADER))
        .then(fillOutCompleteResetPassword(PASSWORD, PASSWORD))

        .then(testElementExists(selectors.RESET_PASSWORD_COMPLETE.HEADER))
        .then(testElementExists(selectors.RESET_PASSWORD_COMPLETE.SUB_HEADER))

        // the verification tab sends the WebChannel message. This fixes
        // two problems: 1) initiating tab is closed, 2) The initiating
        // tab when running in E10s does not have all the necessary data
        // because localStorage is not shared.
        .then(testIsBrowserNotified('fxaccounts:login'))

        .then(closeCurrentWindow());
  });

  registerSuite({
    name: 'Firefox Desktop Sync v3 reset password',

    beforeEach: function () {
      // timeout after 90 seconds
      this.timeout = 90000;

      email = TestHelpers.createEmail();
      return this.remote.then(clearBrowserState());
    },

    teardown: function () {
      // clear localStorage to avoid polluting other tests.
      return this.remote.then(clearBrowserState());
    },

    'reset password, verify same browser, Fx <= 56': function () {
      const query = { forceUA: uaStrings['desktop_firefox_56'], };

      return this.remote
        .then(setupTest(query))

        // In fx <= 56, about:accounts takes over the screen, no need to transition
        .then(noPageTransition(selectors.CONFIRM_RESET_PASSWORD.HEADER, 5000))
        .then(testSuccessWasShown())
        // Only expect the login message in the verification tab to avoid
        // a race condition within the browser when it receives two login messages.
        .then(noSuchBrowserNotification('fxaccounts:login'));
    },

    'reset password, verify same browser, Fx >= 57': function () {
      const query = { forceUA: uaStrings['desktop_firefox_57'] };

      return this.remote
        .then(setupTest(query))

        // In fx >= 57, about:accounts expects FxA to transition after email verification
        .then(testElementExists(selectors.RESET_PASSWORD_COMPLETE.HEADER))
        // Only expect the login message in the verification tab to avoid
        // a race condition within the browser when it receives two login messages.
        .then(noSuchBrowserNotification('fxaccounts:login'));
    },
  });

});
