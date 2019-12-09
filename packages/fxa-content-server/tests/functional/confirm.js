/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

const config = intern._config;
const CONFIRM_URL = config.fxaContentRoot + 'confirm';
const ENTER_EMAIL_URL = config.fxaContentRoot;
const PASSWORD = 'password12345678';

const {
  clearBrowserState,
  click,
  fillOutEmailFirstSignUp,
  openPage,
  testElementExists,
  testElementTextInclude,
  testSuccessWasShown,
} = FunctionalHelpers;

registerSuite('confirm', {
  beforeEach: function() {
    return this.remote.then(clearBrowserState());
  },

  tests: {
    'visit confirmation screen without initiating sign up, user is redirected to /signup': function() {
      return (
        this.remote
          // user is immediately redirected to / if they have no sessionToken.
          .then(openPage(CONFIRM_URL, selectors.ENTER_EMAIL.HEADER))
      );
    },

    'sign up, wait for confirmation screen, click resend': function() {
      const email = 'test_signin' + Math.random() + '@restmail.dev.lcip.org';

      return (
        this.remote
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignUp(email, PASSWORD))

          .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))
          .then(
            testElementTextInclude(
              selectors.CONFIRM_SIGNUP_CODE.EMAIL_FIELD,
              email
            )
          )

          .then(click(selectors.CONFIRM_SIGNUP_CODE.LINK_RESEND))

          // the test below depends on the speed of the email resent XHR
          // we have to wait until the resent request completes and the
          // success notification is visible
          .then(testSuccessWasShown())
      );
    },
  },
});
