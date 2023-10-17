/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');
const uaStrings = require('./lib/ua-strings');

const config = intern._config;

const PASSWORD = 'passwordzxcv';
const RESET_PASSWORD_URL = `${config.fxaContentRoot}reset_password?context=fx_desktop_v3&service=sync`;

let email;

const {
  clearBrowserState,
  closeCurrentWindow,
  createEmail,
  createUser,
  fillOutResetPassword,
  fillOutCompleteResetPassword,
  noSuchBrowserNotification,
  openPage,
  openVerificationLinkInNewTab,
  switchToWindow,
  testElementExists,
  testIsBrowserNotified,
  thenify,
  type,
} = FunctionalHelpers;

const setupTest = thenify(function (query) {
  return (
    this.parent
      .then(createUser(email, PASSWORD, { preVerified: true }))
      .then(
        openPage(RESET_PASSWORD_URL, selectors.RESET_PASSWORD.HEADER, {
          query,
        })
      )
      .then(fillOutResetPassword(email))

      .then(testElementExists(selectors.CONFIRM_RESET_PASSWORD.HEADER))
      .then(openVerificationLinkInNewTab(email, 0))
      .then(switchToWindow(1))

      .then(testElementExists(selectors.COMPLETE_RESET_PASSWORD.HEADER))
      .then(fillOutCompleteResetPassword(PASSWORD, PASSWORD))

      .then(testElementExists(selectors.RESET_PASSWORD_COMPLETE.HEADER))
      .then(testElementExists(selectors.RESET_PASSWORD_COMPLETE.SUB_HEADER))

      // the verification tab sends the WebChannel message. This fixes
      // two problems: 1) initiating tab is closed, 2) The initiating
      // tab when running in E10s does not have all the necessary data
      // because localStorage is not shared.
      .then(testIsBrowserNotified('fxaccounts:login'))

      .then(closeCurrentWindow())
  );
});

registerSuite('Firefox Desktop Sync v3 reset password', {
  beforeEach: function () {
    // timeout after 90 seconds
    this.timeout = 90000;

    email = createEmail();
    return this.remote.then(clearBrowserState());
  },

  afterEach: function () {
    // clear localStorage to avoid polluting other tests.
    return this.remote.then(clearBrowserState());
  },
  tests: {
    'reset password, verify same browser': function () {
      const query = { forceUA: uaStrings['desktop_firefox_58'] };

      return (
        this.remote
          .then(setupTest(query))

          // In fx >= 58, about:accounts expects FxA to transition after email verification
          .then(testElementExists(selectors.RESET_PASSWORD_COMPLETE.HEADER))
          // Only expect the login message in the verification tab to avoid
          // a race condition within the browser when it receives two login messages.
          .then(noSuchBrowserNotification('fxaccounts:login'))
      );
    },

    'reset password, verify same browser, password validation': function () {
      const query = {
        forceExperiment: 'passwordStrength',
        forceExperimentGroup: 'designF',
      };

      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openPage(RESET_PASSWORD_URL, selectors.RESET_PASSWORD.HEADER))
        .then(fillOutResetPassword(email))

        .then(testElementExists(selectors.CONFIRM_RESET_PASSWORD.HEADER))
        .then(openVerificationLinkInNewTab(email, 0, { query }))
        .then(switchToWindow(1))

        .then(testElementExists(selectors.COMPLETE_RESET_PASSWORD.HEADER))

        .then(type(selectors.COMPLETE_RESET_PASSWORD.PASSWORD, 'pass'))
        .then(
          testElementExists(
            selectors.COMPLETE_RESET_PASSWORD.PASSWORD_BALLOON.MIN_LENGTH_FAIL
          )
        )

        .then(type(selectors.COMPLETE_RESET_PASSWORD.PASSWORD, 'password'))
        .then(
          testElementExists(
            selectors.COMPLETE_RESET_PASSWORD.PASSWORD_BALLOON.NOT_COMMON_FAIL
          )
        )

        .then(type(selectors.COMPLETE_RESET_PASSWORD.PASSWORD, email))
        .then(
          testElementExists(
            selectors.COMPLETE_RESET_PASSWORD.PASSWORD_BALLOON.NOT_EMAIL_FAIL
          )
        );
    },
  },
});
