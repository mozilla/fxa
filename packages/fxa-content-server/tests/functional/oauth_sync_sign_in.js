/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');
var config = intern._config;
var PAGE_URL =
  config.fxaContentRoot + 'signin?context=fx_desktop_v3&service=sync';

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
  testIsBrowserNotified,
  visibleByQSA,
} = FunctionalHelpers;

registerSuite('signin with OAuth after Sync', {
  beforeEach: function() {
    email = TestHelpers.createEmail('sync{id}');
    email2 = TestHelpers.createEmail();

    // clear localStorage to avoid pollution from other tests.
    return this.remote.then(
      FunctionalHelpers.clearBrowserState({
        '123done': true,
        contentServer: true,
      })
    );
  },

  afterEach: function() {
    return this.remote.then(
      FunctionalHelpers.clearBrowserState({
        '123done': true,
        contentServer: true,
      })
    );
  },
  tests: {
    'signin to OAuth with Sync creds': function() {
      this.timeout = 60 * 1000;
      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(
            openPage(PAGE_URL, selectors.SIGNIN.HEADER, {
              webChannelResponses: {
                'fxaccounts:can_link_account': { ok: true },
                'fxaccounts:fxa_status': {
                  capabilities: null,
                  signedInUser: null,
                },
              },
            })
          )

          .then(fillOutSignIn(email, PASSWORD))
          .then(testElementExists(selectors.CONFIRM_SIGNIN.HEADER))
          .then(testIsBrowserNotified('fxaccounts:login'))

          // Sync signins must be verified.
          .then(openVerificationLinkInNewTab(email, 0))

          .then(switchToWindow(1))
          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
          .then(closeCurrentWindow())

          // Sign up for a new account via OAuth
          .then(openFxaFromRp('signup'))
          .then(fillOutSignUp(email2, PASSWORD))

          .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))
          .then(openVerificationLinkInNewTab(email2, 0))
          .then(switchToWindow(1))

          // wait for the verified window in the new tab
          .then(testElementExists(selectors.SIGNUP_COMPLETE.HEADER))

          // switch to the original window
          .then(closeCurrentWindow())

          // RP is logged in, logout then back in again.
          .then(testElementExists(selectors['123DONE'].AUTHENTICATED))
          .then(click(selectors['123DONE'].LINK_LOGOUT))

          .then(visibleByQSA(selectors['123DONE'].BUTTON_SIGNIN))
          .then(click(selectors['123DONE'].BUTTON_SIGNIN))

          .then(testElementExists(selectors.SIGNIN.HEADER))

          // By default, we should see the email we signed up for Sync with
          .then(
            testElementTextEquals(selectors.SIGNIN.EMAIL_NOT_EDITABLE, email)
          )

          // no need to enter the password!
          .then(click(selectors.SIGNIN.SUBMIT))

          // We should see the email we signed up for Sync with
          .then(
            testElementTextEquals(selectors['123DONE'].AUTHENTICATED, email)
          )
      );
    },
  },
});
