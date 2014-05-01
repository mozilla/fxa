/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'intern/chai!assert',
  'require'
], function (registerSuite, assert, require) {
  'use strict';

  var CONFIRM_URL = 'http://localhost:3030/confirm';
  var SIGNUP_URL = 'http://localhost:3030/signup';
  var TOO_YOUNG_YEAR = new Date().getFullYear() - 13;

  registerSuite({
    name: 'confirm',

    beforeEach: function () {
      // clear localStorage to avoid pollution from other tests.
      return this.get('remote')
        .get(require.toUrl(SIGNUP_URL))
        /*jshint evil:true*/
        .waitForElementById('fxa-signup-header')
        .safeEval('sessionStorage.clear(); localStorage.clear();');
    },

    'visit confirmation screen without initiating sign up, user is redirected to /signup': function () {
      return this.get('remote')
        .get(require.toUrl(CONFIRM_URL))

        // user is immediately redirected to /signup if they have no
        // sessionToken.
        // Success is showing the screen
        .waitForElementById('fxa-signup-header');
    },

    'sign up, wait for confirmation screen, click resend': function () {
      var email = 'signup' + Math.random() + '@example.com';
      var password = '12345678';

      return this.get('remote')
        .get(require.toUrl(SIGNUP_URL))
        .waitForElementById('fxa-signup-header')

        .elementByCssSelector('form input.email')
          .click()
          .type(email)
        .end()

        .elementByCssSelector('form input.password')
          .click()
          .type(password)
        .end()

        .elementByCssSelector('#fxa-age-year')
          .click()
        .end()

        .elementById('fxa-' + (TOO_YOUNG_YEAR - 1))
          .buttonDown()
          .buttonUp()
          .click()
        .end()

        .elementByCssSelector('button[type="submit"]')
          .click()
        .end()

        // Being pushed to the confirmation screen is success.
        .waitForElementById('fxa-confirm-header')
        .elementByCssSelector('.verification-email-message')
          .text()
          .then(function (resultText) {
            // check the email address was written
            assert.ok(resultText.indexOf(email) > -1);
          })
        .end()

        .elementById('resend')
          .click()
        .end()

        .waitForVisibleByClassName('success')

        // Success is showing the screen
        .elementByCssSelector('.success').isDisplayed()
          .then(function (isDisplayed) {
            assert.isTrue(isDisplayed);
          })
        .end();
    }
  });
});
