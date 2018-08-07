/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const {registerSuite} = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const config = intern._config;

const SIGNUP_URL = `${config.fxaContentRoot}signup?`;
const SIGNIN_URL = `${config.fxaContentRoot}signin?`;
const SETTINGS_URL = `${config.fxaContentRoot}settings?showAccountRecovery=true`;
const RESET_PASSWORD_URL = config.fxaContentRoot + 'reset_password?context=fx_desktop_v3&service=sync&automatedBrowser=true&forceAboutAccounts=true';
const PASSWORD = 'password';
const NEW_PASSWORD = '()()():|';
let email, recoveryKey;

const {
  clearBrowserState,
  click,
  fillOutRecoveryKey,
  fillOutCompleteResetPassword,
  fillOutResetPassword,
  fillOutSignIn,
  fillOutSignUp,
  openPage,
  openVerificationLinkInSameTab,
  testIsBrowserNotified,
  testElementExists,
  type,
  visibleByQSA
} = FunctionalHelpers;

registerSuite('Recovery key', {

  beforeEach: function () {
    email = TestHelpers.createEmail('sync{id}');
    const remote = this.remote;

    return this.remote
      .then(openPage(SIGNUP_URL, selectors.SIGNUP.HEADER))
      .then(fillOutSignUp(email, PASSWORD))
      .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))
      .then(openVerificationLinkInSameTab(email, 0))
      .then(testElementExists(selectors.SETTINGS.HEADER))

      .then(openPage(SETTINGS_URL, selectors.SETTINGS.HEADER))
      .then(testElementExists(selectors.SETTINGS.HEADER))
      .then(visibleByQSA(selectors.RECOVERY_KEY.MENU_BUTTON))
      .then(click(selectors.RECOVERY_KEY.MENU_BUTTON))
      .then(testElementExists(selectors.RECOVERY_KEY.STATUS_DISABLED))

      // Complete the steps to add an account recovery key
      .then(click(selectors.RECOVERY_KEY.GENERATE_KEY_BUTTON))
      .then(type(selectors.RECOVERY_KEY.PASSWORD_INPUT, PASSWORD))
      .then(click(selectors.RECOVERY_KEY.CONFIRM_PASSWORD_CONTINUE))
      .then(testElementExists(selectors.RECOVERY_KEY.RECOVERY_KEY_TEXT))

      // Store the key to be used later
      .findByCssSelector(selectors.RECOVERY_KEY.RECOVERY_KEY_TEXT)
      .getVisibleText()
      .then((key) => {
        recoveryKey = key;
        return remote.then(click(selectors.RECOVERY_KEY.RECOVERY_KEY_DONE_BUTTON));
      })
      .end();
  },

  afterEach: function () {
    return this.remote.then(clearBrowserState());
  },

  tests: {
    'can add recovery key': function () {
      return this.remote
        .then(testElementExists(selectors.RECOVERY_KEY.STATUS_ENABLED))
        .end();
    },

    'can revoke recovery key': function () {
      return this.remote
        .then(testElementExists(selectors.RECOVERY_KEY.STATUS_ENABLED))
        .then(click(selectors.RECOVERY_KEY.CONFIRM_REVOKE))
        .then(testElementExists(selectors.RECOVERY_KEY.CONFIRM_REVOKE_DESCRIPTION))

        .then(click(selectors.RECOVERY_KEY.CONFIRM_REVOKE_OK))
        .then(testElementExists(selectors.RECOVERY_KEY.STATUS_DISABLED))
        .end();
    },

    'can reset password with recovery key': function () {
      const query = {showAccountRecovery: true};
      return this.remote
        .then(openPage(RESET_PASSWORD_URL, selectors.RESET_PASSWORD.HEADER, {
          query,
          webChannelResponses: {
            'fxaccounts:fxa_status': {capabilities: null, signedInUser: null}
          }
        }))
        .then(fillOutResetPassword(email))
        .then(testElementExists(selectors.CONFIRM_RESET_PASSWORD.HEADER))
        .then(openVerificationLinkInSameTab(email, 2))
        .then(testElementExists(selectors.COMPLETE_RESET_PASSWORD_RECOVERY_KEY.HEADER))

        .then(fillOutRecoveryKey(recoveryKey))

        .then(testElementExists(selectors.COMPLETE_RESET_PASSWORD.HEADER))
        .then(fillOutCompleteResetPassword(NEW_PASSWORD, NEW_PASSWORD))

        .then(testElementExists(selectors.RESET_PASSWORD_COMPLETE.HEADER))
        .then(testElementExists(selectors.RESET_PASSWORD_COMPLETE.SUB_HEADER))

        .then(testIsBrowserNotified('fxaccounts:login'))

        // For good measure, lets re-login with new password
        .then(clearBrowserState())
        .then(openPage(SIGNIN_URL, selectors.SIGNIN.HEADER))
        .then(fillOutSignIn(email, NEW_PASSWORD))
        .then(testElementExists(selectors.SETTINGS.HEADER));
    },

    'can reset password when forgot recovery key': function () {
      const query = {showAccountRecovery: true};
      return this.remote
        .then(openPage(RESET_PASSWORD_URL, selectors.RESET_PASSWORD.HEADER, {
          query,
          webChannelResponses: {
            'fxaccounts:fxa_status': {capabilities: null, signedInUser: null}
          }
        }))
        .then(fillOutResetPassword(email))
        .then(testElementExists(selectors.CONFIRM_RESET_PASSWORD.HEADER))
        .then(openVerificationLinkInSameTab(email, 2))
        .then(testElementExists(selectors.COMPLETE_RESET_PASSWORD_RECOVERY_KEY.HEADER))

        .then(click(selectors.COMPLETE_RESET_PASSWORD_RECOVERY_KEY.LOST_KEY))

        .then(testElementExists(selectors.COMPLETE_RESET_PASSWORD.HEADER))
        .then(fillOutCompleteResetPassword(NEW_PASSWORD, NEW_PASSWORD))

        .then(testElementExists(selectors.RESET_PASSWORD_COMPLETE.HEADER))
        .then(testElementExists(selectors.RESET_PASSWORD_COMPLETE.SUB_HEADER))

        .then(testIsBrowserNotified('fxaccounts:login'))

        // For good measure, lets re-login with new password
        .then(clearBrowserState())
        .then(openPage(SIGNIN_URL, selectors.SIGNIN.HEADER))
        .then(fillOutSignIn(email, NEW_PASSWORD))
        .then(testElementExists(selectors.SETTINGS.HEADER));
    },
  }
});
