/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const config = intern._config;
const CONFIRM_URL = config.fxaContentRoot + 'confirm';
const SIGNUP_URL = config.fxaContentRoot + 'signup';
const PASSWORD = 'password12345678';

let email;

const {
  clearBrowserState,
  click,
  closeCurrentWindow,
  fillOutSignUp,
  fillOutEmailFirstSignUp,
  noSuchElement,
  openPage,
  respondToWebChannelMessage,
  switchToWindow,
  testElementExists,
  testElementTextInclude,
  testSuccessWasShown,
} = FunctionalHelpers;

registerSuite('confirm', {
  beforeEach: function() {
    email = TestHelpers.createEmail();
    // clear localStorage to avoid polluting other tests.
    return this.remote.then(clearBrowserState());
  },

  tests: {
    'visit confirmation screen without initiating sign up, user is redirected to /signup': function() {
      return (
        this.remote
          // user is immediately redirected to /signup if they have no
          // sessionToken.
          // Success is showing the screen
          .then(openPage(CONFIRM_URL, selectors.SIGNUP.HEADER))
      );
    },

    'sign up, wait for confirmation screen, click resend': function() {
      const email = 'test_signin' + Math.random() + '@restmail.dev.lcip.org';

      return (
        this.remote
          .then(openPage(SIGNUP_URL, selectors.SIGNUP.HEADER))
          .then(fillOutSignUp(email, PASSWORD))

          .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))
          .then(
            testElementTextInclude(
              selectors.CONFIRM_SIGNUP.EMAIL_MESSAGE,
              email
            )
          )
          .then(noSuchElement(selectors.CONFIRM_SIGNUP.LINK_OPEN_WEBMAIL))

          .then(click(selectors.CONFIRM_SIGNUP.LINK_RESEND))

          // the test below depends on the speed of the email resent XHR
          // we have to wait until the resent request completes and the
          // success notification is visible
          .then(testSuccessWasShown())
      );
    },

    'sign up with a restmail address, get the open restmail button': function() {
      const ENTER_EMAIL_URL =
        intern._config.fxaContentRoot + '?context=fx_desktop_v3&service=sync';
      this.timeout = 90000;

      return (
        this.remote
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(
            respondToWebChannelMessage('fxaccounts:can_link_account', {
              ok: true,
            })
          )

          .then(fillOutEmailFirstSignUp(email, PASSWORD))

          .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
          .then(click(selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT))

          .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))
          .then(click(selectors.CONFIRM_SIGNUP.LINK_OPEN_WEBMAIL))

          .then(switchToWindow(1))

          // wait until url is correct
          .then(
            FunctionalHelpers.pollUntil(
              function(email) {
                return window.location.pathname.endsWith(email);
              },
              [email],
              10000
            )
          )

          .then(closeCurrentWindow())

          .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))
      );
    },
  },
});
