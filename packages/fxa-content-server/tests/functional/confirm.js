/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, require, TestHelpers, FunctionalHelpers) {
  var config = intern.config;
  var CONFIRM_URL = config.fxaContentRoot + 'confirm';
  var SIGNUP_URL = config.fxaContentRoot + 'signup';

  registerSuite({
    name: 'confirm',

    beforeEach: function () {
      // clear localStorage to avoid polluting other tests.
      return FunctionalHelpers.clearBrowserState(this);
    },

    'visit confirmation screen without initiating sign up, user is redirected to /signup': function () {
      return this.remote
        .get(require.toUrl(CONFIRM_URL))
        .setFindTimeout(intern.config.pageLoadTimeout)

        // user is immediately redirected to /signup if they have no
        // sessionToken.
        // Success is showing the screen
        .findByCssSelector('#fxa-signup-header');
    },

    'sign up, wait for confirmation screen, click resend': function () {
      var self = this;
      var email = TestHelpers.createEmail();
      var password = '12345678';

      return this.remote
        .get(require.toUrl(SIGNUP_URL))
        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, password);
        })

        // Being pushed to the confirmation screen is success.
        .findByCssSelector('.verification-email-message')
          .getVisibleText()
          .then(function (resultText) {
            // check the email address was written
            assert.ok(resultText.indexOf(email) > -1);
          })
        .end()

        .findByCssSelector('#resend')
          .click()
        .end()

        // the test below depends on the speed of the email resent XHR
        // we have to wait until the resent request completes and the
        // success notification is visible
        .then(FunctionalHelpers.testSuccessWasShown(this));
    }
  });
});
