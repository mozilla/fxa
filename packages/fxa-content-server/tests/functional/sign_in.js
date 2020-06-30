/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
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
  createEmail,
  createUser,
  fillOutEmailFirstSignIn,
  fillOutEmailFirstSignUp,
  fillOutSignUpCode,
  openPage,
  openTab,
  switchToWindow,
  testAttributeMatches,
  testElementExists,
  testElementTextInclude,
  type,
  visibleByQSA,
} = FunctionalHelpers;

registerSuite('signin', {
  beforeEach: function () {
    email = createEmail();

    return this.remote.then(clearBrowserState());
  },

  tests: {
    'signin verified with incorrect password, click `forgot password?`': function () {
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

    'signin with email with leading space strips space': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn('   ' + email, PASSWORD))
        .then(testElementExists(selectors.SETTINGS.HEADER));
    },

    'signin with email with trailing space strips space': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email + '   ', PASSWORD))
        .then(testElementExists(selectors.SETTINGS.HEADER));
    },

    'signin verified with password that incorrectly has leading whitespace': function () {
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

    'signin from second tab while at /': function () {
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

    'signin from second tab while at /signin': function () {
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

    'signin from second tab while at /signup': function () {
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
        .then(testElementExists(selectors.CONFIRM_SIGNUP_CODE.HEADER))

        .then(fillOutSignUpCode(email, 0))
        .then(testElementExists(selectors.SETTINGS.HEADER))

        .then(closeCurrentWindow())
        .then(switchToWindow(0))

        .then(testElementExists(selectors.SETTINGS.HEADER));
    },

    'login as an existing user': function () {
      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, PASSWORD))

          // success is seeing the header
          .then(visibleByQSA(selectors.SETTINGS.HEADER))
          .then(testElementExists(selectors.SETTINGS.HEADER))
          .then(click(selectors.SETTINGS.SIGNOUT, selectors.ENTER_EMAIL.HEADER))

          // login as existing user
          .then(type(selectors.ENTER_EMAIL.EMAIL, email))
          .then(
            click(
              selectors.ENTER_EMAIL.SUBMIT,
              selectors.SIGNIN_PASSWORD.HEADER
            )
          )
          .then(type(selectors.SIGNIN.PASSWORD, PASSWORD))
          .then(click(selectors.SIGNIN.SUBMIT))

          // success is seeing the existing user logged in
          .then(visibleByQSA(selectors.SETTINGS.HEADER))
      );
    },

    'data-flow-begin attribute is set': function () {
      return this.remote
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(
          testAttributeMatches('body', 'data-flow-begin', /^[1-9][0-9]{12,}$/)
        );
    },

    'integrity attribute is set on scripts and css': function () {
      return this.remote
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(testAttributeMatches('script', 'integrity', /^sha512-/))
        .then(testAttributeMatches('link', 'integrity', /^sha512-/))
        .catch(function (err) {
          // this tests only in production
          if (fxaProduction || err.name !== 'AssertionError') {
            throw err;
          }
        });
    },
  },
});
