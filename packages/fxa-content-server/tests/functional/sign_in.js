/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');

var config = intern._config;
var PAGE_URL = config.fxaContentRoot + 'signin';
const ENTER_EMAIL_URL = `${config.fxaContentRoot}?action=email`;
var PASSWORD = 'passwordcxzv';
var email;

const {
  clearBrowserState,
  click,
  closeCurrentWindow,
  createUser,
  fillOutEmailFirstSignIn,
  fillOutEmailFirstSignUp,
  fillOutSignIn,
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
    email = TestHelpers.createEmail();

    return this.remote.then(clearBrowserState());
  },

  afterEach: function() {
    return this.remote.then(clearBrowserState());
  },

  tests: {
    'with an invalid email': function() {
      return this.remote
        .then(openPage(PAGE_URL + '?email=invalid', '#fxa-400-header'))
        .then(testErrorTextInclude('invalid'))
        .then(testErrorTextInclude('email'));
    },

    'signin unverified': function() {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: false }))
        .then(openPage(PAGE_URL, '#fxa-signin-header'))
        .then(fillOutSignIn(email, PASSWORD))
        .then(testElementTextInclude('.verification-email-message', email));
    },

    'signin verified with correct password': function() {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(fillOutSignIn(email, PASSWORD))
        .then(testElementExists('#fxa-settings-header'));
    },

    'signin verified with incorrect password, click `forgot password?`': function() {
      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(fillOutSignIn(email, 'incorrect password'))
          // success is seeing the error message.
          .then(visibleByQSA('.tooltip'))
          // If user clicks on "forgot your password?",
          // begin the reset password flow.
          .then(click('a[href="/reset_password"]'))
          .then(testElementExists('#fxa-reset-password-header'))
      );
    },

    'signin with an unknown account allows the user to sign up': function() {
      return (
        this.remote
          .then(fillOutSignIn(email, PASSWORD))
          // The error area shows a link to /signup
          .then(visibleByQSA('.error'))
          .then(click('.error a[href="/signup"]'))
          // email, password are prefilled from the signin page.
          .then(testElementValueEquals('input[type=email]', email))
          .then(testElementValueEquals('input[type=password]', PASSWORD))
      );
    },

    'signin with email with leading space strips space': function() {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(fillOutSignIn('   ' + email, PASSWORD))
        .then(testElementExists('#fxa-settings-header'));
    },

    'signin with email with trailing space strips space': function() {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(fillOutSignIn(email + '   ', PASSWORD))
        .then(testElementExists('#fxa-settings-header'));
    },

    'signin verified with password that incorrectly has leading whitespace': function() {
      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(fillOutSignIn(email, '  ' + PASSWORD))
          // success is seeing the error message.
          .then(visibleByQSA('.tooltip'))
          .then(testElementTextInclude('.tooltip', 'password'))
      );
    },

    'visiting the pp links saves information for return': function() {
      return testRepopulateFields.call(this, '/legal/terms', '#fxa-tos-header');
    },

    'visiting the tos links saves information for return': function() {
      return testRepopulateFields.call(
        this,
        '/legal/privacy',
        '#fxa-pp-header'
      );
    },

    'form prefill information is cleared after signin->sign out': function() {
      return (
        this.remote
          .then(createUser(email, PASSWORD, { preVerified: true }))
          .then(fillOutSignIn(email, PASSWORD))

          // success is seeing the sign-in-complete screen.
          .then(testElementExists('#fxa-settings-header'))
          .then(click('#signout'))

          .then(testElementExists('#fxa-signin-header'))

          // check the email and password were cleared
          .then(testElementValueEquals('input[type=email]', ''))
          .then(testElementValueEquals('input[type=password]', ''))
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
        .then(openPage(PAGE_URL, '#fxa-signin-header'))
        .then(
          testAttributeMatches('body', 'data-flow-begin', /^[1-9][0-9]{12,}$/)
        );
    },
  },
});

function testRepopulateFields(dest, header) {
  var email = TestHelpers.createEmail();
  var password = '12345678';

  return this.remote
    .then(openPage(PAGE_URL, '#fxa-signin-header'))
    .then(type('input[type=email]', email))
    .then(type('input[type=password]', password))

    .then(click('a[href="' + dest + '"]'))

    .then(testElementExists(header))
    .then(click('.back'))

    .then(testElementValueEquals('input[type=email]', email))
    .then(testElementValueEquals('input[type=password]', password));
}
