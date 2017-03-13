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
  var SIGNIN_URL = config.fxaContentRoot + 'signin';

  var FIRST_PASSWORD = 'password';
  var SECOND_PASSWORD = 'new_password';
  var email;

  var ANIMATION_DELAY_MS = 500;

  var thenify = FunctionalHelpers.thenify;

  var clearBrowserState = FunctionalHelpers.clearBrowserState;
  var click = FunctionalHelpers.click;
  var createUser = FunctionalHelpers.createUser;
  var denormalizeStoredEmail = FunctionalHelpers.denormalizeStoredEmail;
  var fillOutChangePassword = FunctionalHelpers.fillOutChangePassword;
  var fillOutSignIn = FunctionalHelpers.fillOutSignIn;
  var noSuchElementDisplayed = FunctionalHelpers.noSuchElementDisplayed;
  var openPage = FunctionalHelpers.openPage;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testElementTextEquals = FunctionalHelpers.testElementTextEquals;
  var testSuccessWasShown = FunctionalHelpers.testSuccessWasShown;
  var type = FunctionalHelpers.type;
  var visibleByQSA = FunctionalHelpers.visibleByQSA;

  var setupTest = thenify(function (options) {
    options = options || {};
    var signUpEmail = options.signUpEmail || email;
    var signInEmail = options.signInEmail || email;

    return this.parent
      .then(createUser(signUpEmail, FIRST_PASSWORD, { preVerified: true }))
      .then(clearBrowserState())
      .then(fillOutSignIn(signInEmail, FIRST_PASSWORD))

      .then(testElementExists('#fxa-settings-header'))
      .then(testElementTextEquals('.card-header', signUpEmail));
  });

  registerSuite({
    name: 'change_password',

    beforeEach: function () {
      email = TestHelpers.createEmail();
    },

    afterEach: function () {
      return this.remote.then(clearBrowserState());
    },

    'sign in, try to change password with an incorrect old password': function () {
      return this.remote
        .then(setupTest())

        // Go to change password screen
        .then(click('#change-password .settings-unit-toggle'))
        .then(fillOutChangePassword('INCORRECT', SECOND_PASSWORD))
        // the validation tooltip should be visible
        .then(visibleByQSA('.tooltip'))

        // click the show button, the error should not be hidden.
        .then(click('[for=show-old_password]'))
        .then(visibleByQSA('.tooltip'))

        // Change form so that it is valid, error should be hidden.
        .then(type('#old_password', FIRST_PASSWORD))

        // Since the test is to see if the error is hidden,
        // .findByClass cannot be used. We want the opposite of
        // .findByClass.
        .sleep(ANIMATION_DELAY_MS)

        .then(noSuchElementDisplayed('#change-password .error'));
    },

    'sign in, change password, sign in with new password': function () {
      return this.remote
        .then(setupTest())

        // Go to change password screen
        .then(click('#change-password .settings-unit-toggle'))

        .then(fillOutChangePassword(FIRST_PASSWORD, SECOND_PASSWORD))
        .then(testElementExists('#fxa-settings-header'))
        .then(testSuccessWasShown())

        .then(openPage(SIGNIN_URL, '#fxa-signin-header'))
        .then(click('.use-different'))
        .then(fillOutSignIn(email, SECOND_PASSWORD))

        .then(testElementExists('#fxa-settings-header'));
    },

    'sign in with an unnormalized email, change password, sign in with new password': function () {
      return this.remote
        .then(setupTest({ signInEmail: email.toUpperCase(), signUpEmail: email }))

        // Go to change password screen
        .then(click('#change-password .settings-unit-toggle'))

        .then(fillOutChangePassword(FIRST_PASSWORD, SECOND_PASSWORD))
        .then(testElementExists('#fxa-settings-header'))
        .then(testSuccessWasShown())

        .then(openPage(SIGNIN_URL, '#fxa-signin-header'))
        .then(click('.use-different'))
        .then(fillOutSignIn(email, SECOND_PASSWORD))

        .then(testElementExists('#fxa-settings-header'));
    },

    'cached unnormalized email, change password, sign in with new password': function () {
      return this.remote
        .then(setupTest())

        // synthesize a user who signed in pre #4470 with an unnormalized email
        .then(denormalizeStoredEmail(email))
        // refresh to load denormalized email from localStorage
        .refresh()
        // email should be normalized on refresh!
        .then(testElementTextEquals('.card-header', email))

        .then(click('#change-password .settings-unit-toggle'))

        .then(fillOutChangePassword(FIRST_PASSWORD, SECOND_PASSWORD))
        .then(testElementExists('#fxa-settings-header'))
        .then(testSuccessWasShown())

        .then(openPage(SIGNIN_URL, '#fxa-signin-header'))
        .then(click('.use-different'))
        .then(fillOutSignIn(email, SECOND_PASSWORD))

        .then(testElementExists('#fxa-settings-header'));
    },


    'sign in, reset password via settings works': function () {
      return this.remote
        .then(setupTest())

        // Go to change password screen
        .then(click('#change-password .settings-unit-toggle'))
        .then(click('.reset-password'))

        .then(testElementExists('#fxa-reset-password-header'));
    }
  });
});
