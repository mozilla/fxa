/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
var config = intern._config;
var PAGE_URL = config.fxaContentRoot + 'signin';
var AVATAR_URL = config.fxaContentRoot + 'settings/avatar/change';
var PASSWORD = 'password';
var email;

const {
  clearBrowserState,
  click,
  closeCurrentWindow,
  createUser,
  fillOutSignIn,
  openPage,
  openSignInInNewTab,
  openSignUpInNewTab,
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

    'redirect to requested page after signin verified with correct password': function() {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openPage(AVATAR_URL, '#fxa-signin-header'))
        .then(fillOutSignIn(email, PASSWORD))
        .then(testElementExists('#avatar-change'));
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

    'signin with a second sign-in tab open': function() {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openPage(PAGE_URL, '#fxa-signin-header'))
        .then(openSignInInNewTab())
        .then(switchToWindow(1))

        .then(testElementExists('#fxa-signin-header'))
        .then(fillOutSignIn(email, PASSWORD))

        .then(testElementExists('#fxa-settings-header'))
        .then(closeCurrentWindow())

        .then(testElementExists('#fxa-settings-header'));
    },

    'signin with a second sign-up tab open': function() {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openSignUpInNewTab())
        .then(switchToWindow(1))

        .then(testElementExists('#fxa-signup-header'))
        .then(switchToWindow(0))

        .then(fillOutSignIn(email, PASSWORD))
        .then(switchToWindow(1))

        .then(testElementExists('#fxa-settings-header'))
        .then(closeCurrentWindow())

        .then(testElementExists('#fxa-settings-header'));
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
