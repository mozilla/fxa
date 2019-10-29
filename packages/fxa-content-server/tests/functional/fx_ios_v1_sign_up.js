/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const FxDesktopHelpers = require('./lib/fx-desktop');
const UA_STRINGS = require('./lib/ua-strings');
const selectors = require('./lib/selectors');

const config = intern._config;
const ENTER_EMAIL_URL = `${config.fxaContentRoot}?context=fx_ios_v1&service=sync`;
const SIGNUP_URL = `${config.fxaContentRoot}signup?context=fx_ios_v1&service=sync`;

let email;
const PASSWORD = 'password12345678';

const {
  click,
  clearBrowserState,
  closeCurrentWindow,
  fillOutEmailFirstSignUp,
  openPage,
  openVerificationLinkInNewTab,
  switchToWindow,
  testElementExists,
  testEmailExpected,
} = FunctionalHelpers;

const { listenForFxaCommands, testIsBrowserNotifiedOfLogin } = FxDesktopHelpers;

registerSuite('FxiOS v1 sign_up', {
  beforeEach: function() {
    email = TestHelpers.createEmail();
    return this.remote.then(clearBrowserState());
  },

  tests: {
    'open directly to /signup page': function() {
      return (
        this.remote
          // redirected immediately to the / page
          .then(openPage(SIGNUP_URL, selectors.ENTER_EMAIL.HEADER))
      );
    },

    'sign up + CWTS, verify same browser': function() {
      return (
        this.remote
          .then(
            openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
              query: {
                forceUA: UA_STRINGS['ios_firefox_11_0'],
              },
            })
          )
          .execute(listenForFxaCommands)
          .then(fillOutEmailFirstSignUp(email, PASSWORD))

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
          .then(testEmailExpected(email, 1))
      );
    },
  },
});
