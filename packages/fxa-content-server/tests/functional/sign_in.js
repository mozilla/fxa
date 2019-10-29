/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const { createEmail } = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');
const fxaProduction = intern._config.fxaProduction;

const config = intern._config;
const ENTER_EMAIL_URL = config.fxaContentRoot;
const PASSWORD = 'passwordcxzv';
let email;

const {
  clearBrowserState,
  click,
  closeCurrentWindow,
  createUser,
  fillOutEmailFirstSignIn,
  fillOutEmailFirstSignUp,
  openPage,
  openTab,
  openVerificationLinkInSameTab,
  switchToWindow,
  testAttributeMatches,
  testErrorTextInclude,
  testElementExists,
  testElementTextInclude,
  testElementValueEquals,
  type,
  visibleByQSA,
} = FunctionalHelpers;

registerSuite('signin', {
  beforeEach: function() {
    email = createEmail();

    return this.remote.then(clearBrowserState());
  },

  tests: {
    'with an invalid email': function() {
      return this.remote
        .then(
          openPage(ENTER_EMAIL_URL + '?email=invalid', selectors['400'].HEADER)
        )
        .then(testErrorTextInclude('invalid'))
        .then(testErrorTextInclude('email'));
    },

    'signin unverified': function() {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: false }))
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email, PASSWORD))
        .then(
          testElementTextInclude(selectors.CONFIRM_SIGNUP.EMAIL_MESSAGE, email)
        );
    },

    'signin verified with correct password': function() {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email, PASSWORD))
        .then(testElementExists(selectors.SETTINGS.HEADER));
    },

    'signin verified with incorrect password, click `forgot password?`': function() {
      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, 'incorrect password'))
          // success is seeing the error message.
          .then(visibleByQSA(selectors.SIGNIN_PASSWORD.TOOLTIP))
          // If user clicks on "forgot your password?",
          // begin the reset password flow.
          .then(click(selectors.SIGNIN_PASSWORD.LINK_FORGOT_PASSWORD))
          .then(testElementExists(selectors.RESET_PASSWORD.HEADER))
      );
    },

    'signin with email with leading space strips space': function() {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn('   ' + email, PASSWORD))
        .then(testElementExists(selectors.SETTINGS.HEADER));
    },

    'signin with email with trailing space strips space': function() {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email + '   ', PASSWORD))
        .then(testElementExists(selectors.SETTINGS.HEADER));
    },

    'signin verified with password that incorrectly has leading whitespace': function() {
      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, '  ' + PASSWORD))
          // success is seeing the error message.
          .then(visibleByQSA(selectors.SIGNIN_PASSWORD.TOOLTIP))
          .then(
            testElementTextInclude(
              selectors.SIGNIN_PASSWORD.TOOLTIP,
              'password'
            )
          )
      );
    },

    'form prefill information is cleared after signin->sign out': function() {
      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, PASSWORD))

          // success is seeing the sign-in-complete screen.
          .then(testElementExists(selectors.SETTINGS.HEADER))
          .then(click(selectors.SETTINGS.SIGNOUT, selectors.ENTER_EMAIL.HEADER))

          // check the email and password were cleared
          .then(testElementValueEquals(selectors.ENTER_EMAIL.EMAIL, ''))
          .then(type(selectors.ENTER_EMAIL.EMAIL, email))
          .then(
            click(
              selectors.ENTER_EMAIL.SUBMIT,
              selectors.SIGNIN_PASSWORD.HEADER
            )
          )

          .then(testElementValueEquals(selectors.SIGNIN_PASSWORD.PASSWORD, ''))
      );
    },

    'signin from second tab while at /': function() {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(openTab(ENTER_EMAIL_URL))
        .then(switchToWindow(1))

        .then(testElementExists(selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email, PASSWORD))
        .then(testElementExists(selectors.SETTINGS.HEADER))

        .then(closeCurrentWindow())
        .then(switchToWindow(0))

        .then(testElementExists(selectors.SETTINGS.HEADER));
    },

    'signin from second tab while at /signin': function() {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(type(selectors.ENTER_EMAIL.EMAIL, email))
        .then(
          click(selectors.ENTER_EMAIL.SUBMIT, selectors.SIGNIN_PASSWORD.HEADER)
        )

        .then(openTab(ENTER_EMAIL_URL))
        .then(switchToWindow(1))

        .then(testElementExists(selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email, PASSWORD))
        .then(testElementExists(selectors.SETTINGS.HEADER))

        .then(closeCurrentWindow())
        .then(switchToWindow(0))

        .then(testElementExists(selectors.SETTINGS.HEADER));
    },

    'signin from second tab while at /signup': function() {
      return this.remote
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(type(selectors.ENTER_EMAIL.EMAIL, email))
        .then(
          click(selectors.ENTER_EMAIL.SUBMIT, selectors.SIGNUP_PASSWORD.HEADER)
        )

        .then(openTab(ENTER_EMAIL_URL))
        .then(switchToWindow(1))

        .then(testElementExists(selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignUp(email, PASSWORD))
        .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))

        .then(openVerificationLinkInSameTab(email, 0))
        .then(testElementExists(selectors.SETTINGS.HEADER))

        .then(closeCurrentWindow())
        .then(switchToWindow(0))

        .then(testElementExists(selectors.SETTINGS.HEADER));
    },

    'data-flow-begin attribute is set': function() {
      return this.remote
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(
          testAttributeMatches('body', 'data-flow-begin', /^[1-9][0-9]{12,}$/)
        );
    },

    'integrity attribute is set on scripts and css': function() {
      return this.remote
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(testAttributeMatches('script', 'integrity', /^sha512-/))
        .then(testAttributeMatches('link', 'integrity', /^sha512-/))
        .catch(function(err) {
          // this tests only in production
          if (fxaProduction || err.name !== 'AssertionError') {
            throw err;
          }
        });
    },
  },
});
