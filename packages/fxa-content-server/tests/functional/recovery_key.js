/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const {registerSuite} = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const config = intern._config;

const SIGNUP_URL = `${config.fxaContentRoot}signup`;
const SETTINGS_URL = `${config.fxaContentRoot}settings?showAccountRecovery=true`;
const PASSWORD = 'password';
let email;

const {
  clearBrowserState,
  click,
  fillOutSignUp,
  openPage,
  openVerificationLinkInSameTab,
  testElementExists,
  type
} = FunctionalHelpers;

registerSuite('Recovery key', {

  tests: {
    'can add account recovery key to account': function () {
      email = TestHelpers.createEmail();
      return this.remote.then(clearBrowserState())
        .then(openPage(SIGNUP_URL, selectors.SIGNUP.HEADER))
        .then(fillOutSignUp(email, PASSWORD))
        .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))
        .then(openVerificationLinkInSameTab(email, 0))
        .then(testElementExists(selectors.SETTINGS.HEADER))

        .then(openPage(SETTINGS_URL, selectors.SETTINGS.HEADER))
        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(testElementExists(selectors.RECOVERY_KEY.MENU_BUTTON))

        .then(click(selectors.RECOVERY_KEY.MENU_BUTTON))

        // Complete the steps to add an account recovery key
        .then(click(selectors.RECOVERY_KEY.GENERATE_KEY_BUTTON))
        .then(type(selectors.RECOVERY_KEY.PASSWORD_INPUT, PASSWORD))
        .then(click(selectors.RECOVERY_KEY.CONFIRM_PASSWORD_CONTINUE))
        .then(testElementExists(selectors.RECOVERY_KEY.RECOVERY_KEY_TEXT))

        .then(click(selectors.RECOVERY_KEY.RECOVERY_KEY_DONE_BUTTON))

        .then(testElementExists(selectors.RECOVERY_KEY.STATUS_ENABLED))

        .end();
    }
  }
});
