/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');
const config = intern._config;

const SYNC_EMAIL_FIRST_URL =
  config.fxaContentRoot + '?context=fx_desktop_v3&service=sync';

let email;
let email2;
const PASSWORD = 'passwordzxcv';

const {
  click,
  closeCurrentWindow,
  createUser,
  fillOutEmailFirstSignIn,
  fillOutEmailFirstSignUp,
  openFxaFromRp,
  openPage,
  openVerificationLinkInNewTab,
  switchToWindow,
  testElementExists,
  testElementTextEquals,
  testIsBrowserNotified,
  type,
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

  tests: {
    'signin to OAuth with Sync creds': function() {
      this.timeout = 60 * 1000;
      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(
            openPage(SYNC_EMAIL_FIRST_URL, selectors.ENTER_EMAIL.HEADER, {
              webChannelResponses: {
                'fxaccounts:can_link_account': { ok: true },
                'fxaccounts:fxa_status': {
                  capabilities: null,
                  signedInUser: null,
                },
              },
            })
          )

          .then(fillOutEmailFirstSignIn(email, PASSWORD))
          .then(testElementExists(selectors.CONFIRM_SIGNIN.HEADER))
          .then(testIsBrowserNotified('fxaccounts:login'))

          // Sync signins must be verified.
          .then(openVerificationLinkInNewTab(email, 0))

          .then(switchToWindow(1))
          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
          .then(closeCurrentWindow())

          // Sign up for a new account via OAuth
          .then(
            openFxaFromRp('enter-email', {
              header: selectors.SIGNIN_PASSWORD.HEADER,
            })
          )
          .then(
            click(
              selectors.SIGNIN_PASSWORD.LINK_USE_DIFFERENT,
              selectors.ENTER_EMAIL.HEADER
            )
          )
          .then(fillOutEmailFirstSignUp(email2, PASSWORD))

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

          .then(testElementExists(selectors.SIGNIN_PASSWORD.HEADER))

          // By default, we should see the email we signed up for Sync with
          .then(
            testElementTextEquals(
              selectors.SIGNIN_PASSWORD.EMAIL_NOT_EDITABLE,
              email
            )
          )

          // no need to enter the password!
          .then(click(selectors.SIGNIN_PASSWORD.SUBMIT))

          // We should see the email we signed up for Sync with
          .then(
            testElementTextEquals(selectors['123DONE'].AUTHENTICATED, email)
          )
      );
    },
  },
});

registerSuite('signin to Sync after OAuth', {
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

  tests: {
    'email-first Sync signin': function() {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(
          openFxaFromRp('email-first', { header: selectors.ENTER_EMAIL.HEADER })
        )
        .then(fillOutEmailFirstSignIn(email, PASSWORD))
        .then(testElementTextEquals(selectors['123DONE'].AUTHENTICATED, email))

        .then(
          openPage(SYNC_EMAIL_FIRST_URL, selectors.SIGNIN_PASSWORD.HEADER, {
            webChannelResponses: {
              'fxaccounts:can_link_account': { ok: true },
              'fxaccounts:fxa_status': {
                capabilities: null,
                signedInUser: null,
              },
            },
          })
        )
        .then(
          testElementTextEquals(
            selectors.SIGNIN_PASSWORD.EMAIL_NOT_EDITABLE,
            email
          )
        )
        .then(type(selectors.SIGNIN_PASSWORD.PASSWORD, PASSWORD))
        .then(click(selectors.SIGNIN_PASSWORD.SUBMIT))

        .then(testElementExists(selectors.CONFIRM_SIGNIN.HEADER));
    },
  },
});
