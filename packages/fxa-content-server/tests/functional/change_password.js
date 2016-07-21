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

  var clearBrowserState = thenify(FunctionalHelpers.clearBrowserState);
  var click = FunctionalHelpers.click;
  var createUser = FunctionalHelpers.createUser;
  var fillOutChangePassword = thenify(FunctionalHelpers.fillOutChangePassword);
  var fillOutSignIn = thenify(FunctionalHelpers.fillOutSignIn);
  var noSuchElementDisplayed = FunctionalHelpers.noSuchElementDisplayed;
  var openPage = thenify(FunctionalHelpers.openPage);
  var testElementDisplayed = FunctionalHelpers.testElementDisplayed;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testSuccessWasShown = FunctionalHelpers.testSuccessWasShown;
  var type = FunctionalHelpers.type;


  registerSuite({
    name: 'change password',

    beforeEach: function () {
      email = TestHelpers.createEmail();

      return this.remote
        .then(createUser(email, FIRST_PASSWORD, { preVerified: true }))
        .then(clearBrowserState(this))
        .then(fillOutSignIn(this, email, FIRST_PASSWORD))
        .then(testElementExists('#fxa-settings-header'));
    },

    afterEach: function () {
      return FunctionalHelpers.clearBrowserState(this);
    },

    'sign in, try to change password with an incorrect old password': function () {
      return this.remote

        // Go to change password screen
        .then(click('#change-password .settings-unit-toggle'))
        .then(fillOutChangePassword(this, 'INCORRECT', SECOND_PASSWORD))
        .then(testElementDisplayed('#change-password .error'))

        // click the show button, the error should not be hidden.
        .then(click('[for=show-old-password]'))
        .then(testElementDisplayed('#change-password .error'))

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

        // Go to change password screen
        .then(click('#change-password .settings-unit-toggle'))

        .then(fillOutChangePassword(this, FIRST_PASSWORD, SECOND_PASSWORD))
        .then(testElementExists('#fxa-settings-header'))
        .then(testSuccessWasShown(this))

        .then(openPage(this, SIGNIN_URL, '#fxa-signin-header'))
        .then(click('.use-different'))
        .then(fillOutSignIn(this, email, SECOND_PASSWORD))

        .then(testElementExists('#fxa-settings-header'));
    },

    'sign in, reset password via settings works': function () {
      return this.remote
        // Go to change password screen
        .then(click('#change-password .settings-unit-toggle'))
        .then(click('.reset-password'))

        .then(testElementExists('#fxa-reset-password-header'));
    }
  });
});
