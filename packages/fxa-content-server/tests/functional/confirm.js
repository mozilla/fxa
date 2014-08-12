/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'intern/dojo/node!leadfoot/helpers/pollUntil'
], function (intern, registerSuite, assert, require, TestHelpers, FunctionalHelpers, pollUntil) {
  'use strict';

  var config = intern.config;
  var CONFIRM_URL = config.fxaContentRoot + 'confirm';
  var SIGNUP_URL = config.fxaContentRoot +'signup';
  var TOO_YOUNG_YEAR = new Date().getFullYear() - 13;

  registerSuite({
    name: 'confirm',

    beforeEach: function () {
      // clear localStorage to avoid polluting other tests.
      return FunctionalHelpers.clearBrowserState(this);
    },

    'visit confirmation screen without initiating sign up, user is redirected to /signup': function () {
      return this.get('remote')
        .get(require.toUrl(CONFIRM_URL))
        .setFindTimeout(intern.config.pageLoadTimeout)

        // user is immediately redirected to /signup if they have no
        // sessionToken.
        // Success is showing the screen
        .findByCssSelector('#fxa-signup-header');
    },

    'sign up, wait for confirmation screen, click resend': function () {
      var email = TestHelpers.createEmail();
      var password = '12345678';

      return this.get('remote')
        .get(require.toUrl(SIGNUP_URL))
        .findByCssSelector('form input.email')
          .click()
          .type(email)
        .end()

        .findByCssSelector('form input.password')
          .click()
          .type(password)
        .end()

        .findByCssSelector('#fxa-age-year')
          .click()
        .end()

        .findByCssSelector('#fxa-' + (TOO_YOUNG_YEAR - 1))
          .pressMouseButton()
          .releaseMouseButton()
          .click()
        .end()

        .findByCssSelector('button[type="submit"]')
          .click()
        .end()

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
        // we have to wait until the resent request completes and the success notification is visible
        .then(FunctionalHelpers.visibleByQSA('.success'))

        .then(function (result) {
          assert.ok(result);
        }, function (error) {
          // success was never displayed
          assert.fail(error);
        })
        .end();
    }
  });
});
