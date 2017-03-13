/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, TestHelpers, FunctionalHelpers) {
  var config = intern.config;
  var PAGE_URL = config.fxaContentRoot + 'signin';
  var AVATAR_URL = config.fxaContentRoot + 'settings/avatar/change';
  var PASSWORD = 'password';
  var email;

  var clearBrowserState = FunctionalHelpers.clearBrowserState;
  var click = FunctionalHelpers.click;
  var closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
  var createUser = FunctionalHelpers.createUser;
  var fillOutSignIn = FunctionalHelpers.fillOutSignIn;
  var openPage = FunctionalHelpers.openPage;
  var openSignInInNewTab = FunctionalHelpers.openSignInInNewTab;
  var openSignUpInNewTab = FunctionalHelpers.openSignUpInNewTab;
  var testAttributeMatches = FunctionalHelpers.testAttributeMatches;
  var testErrorTextInclude = FunctionalHelpers.testErrorTextInclude;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testElementTextInclude = FunctionalHelpers.testElementTextInclude;
  var testElementValueEquals = FunctionalHelpers.testElementValueEquals;
  var type = FunctionalHelpers.type;
  var visibleByQSA = FunctionalHelpers.visibleByQSA;

  registerSuite({
    name: 'sign_in',

    beforeEach: function () {
      email = TestHelpers.createEmail();

      return this.remote.then(clearBrowserState());
    },

    afterEach: function () {
      return this.remote.then(clearBrowserState());
    },

    'with an invalid email': function () {
      return this.remote
        .then(openPage(PAGE_URL + '?email=invalid', '#fxa-400-header'))
        .then(testErrorTextInclude('invalid'))
        .then(testErrorTextInclude('email'));
    },

    'sign in unverified': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: false }))
        .then(openPage(PAGE_URL, '#fxa-signin-header'))
        .then(fillOutSignIn(email, PASSWORD))
        .then(testElementTextInclude('.verification-email-message', email));
    },

    'redirect to requested page after sign in verified with correct password': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openPage(AVATAR_URL, '#fxa-signin-header'))
        .then(fillOutSignIn(email, PASSWORD))
        .then(testElementExists('#avatar-change'));
    },

    'sign in verified with correct password': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(fillOutSignIn(email, PASSWORD))
        .then(testElementExists('#fxa-settings-header'));
    },

    'sign in verified with incorrect password, click `forgot password?`': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(fillOutSignIn(email, 'incorrect password'))
        // success is seeing the error message.
        .then(visibleByQSA('.tooltip'))
        // If user clicks on "forgot your password?",
        // begin the reset password flow.
        .then(click('a[href="/reset_password"]'))
        .then(testElementExists('#fxa-reset-password-header'));
    },

    'sign in with an unknown account allows the user to sign up': function () {
      return this.remote
        .then(fillOutSignIn(email, PASSWORD))
        // The error area shows a link to /signup
        .then(visibleByQSA('.error'))
        .then(click('.error a[href="/signup"]'))
        // email, password are prefilled from the signin page.
        .then(testElementValueEquals('input[type=email]', email))
        .then(testElementValueEquals('input[type=password]', PASSWORD));
    },

    'sign in with email with leading space strips space': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(fillOutSignIn('   ' + email, PASSWORD))
        .then(testElementExists('#fxa-settings-header'));
    },

    'sign in with email with trailing space strips space': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(fillOutSignIn(email + '   ', PASSWORD))
        .then(testElementExists('#fxa-settings-header'));
    },

    'sign in verified with password that incorrectly has leading whitespace': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(fillOutSignIn(email, '  ' + PASSWORD))
        // success is seeing the error message.
        .then(visibleByQSA('.tooltip'))
        .then(testElementTextInclude('.tooltip', 'password'));
    },

    'visiting the pp links saves information for return': function () {
      return testRepopulateFields.call(this, '/legal/terms', '#fxa-tos-header');
    },

    'visiting the tos links saves information for return': function () {
      return testRepopulateFields.call(this, '/legal/privacy', '#fxa-pp-header');
    },

    'form prefill information is cleared after sign in->sign out': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(fillOutSignIn(email, PASSWORD))

        // success is seeing the sign-in-complete screen.
        .then(testElementExists('#fxa-settings-header'))
        .then(click('#signout'))

        .then(testElementExists('#fxa-signin-header'))

        // check the email and password were cleared
        .then(testElementValueEquals('input[type=email]', ''))
        .then(testElementValueEquals('input[type=password]', ''));
    },

    'sign in with a second sign-in tab open': function () {
      var windowName = 'sign-in inter-tab functional test';
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openPage(PAGE_URL, '#fxa-signin-header'))
        .then(openSignInInNewTab(windowName))
        .switchToWindow(windowName)

        .then(testElementExists('#fxa-signin-header'))
        .then(fillOutSignIn(email, PASSWORD))

        .then(testElementExists('#fxa-settings-header'))
        .then(closeCurrentWindow())

        .then(testElementExists('#fxa-settings-header'));
    },

    'sign in with a second sign-up tab open': function () {
      var windowName = 'sign-in inter-tab functional test';
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openSignUpInNewTab(windowName))
        .switchToWindow(windowName)

        .then(testElementExists('#fxa-signup-header'))
        .switchToWindow('')

        .then(fillOutSignIn(email, PASSWORD))
        .switchToWindow(windowName)

        .then(testElementExists('#fxa-settings-header'))
        .then(closeCurrentWindow())

        .then(testElementExists('#fxa-settings-header'));
    },

    'data-flow-begin attribute is set': function () {
      return this.remote
        .then(openPage(PAGE_URL, '#fxa-signin-header'))
        .then(testAttributeMatches('body', 'data-flow-begin', /^[1-9][0-9]{12,}$/));
    }
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
});
