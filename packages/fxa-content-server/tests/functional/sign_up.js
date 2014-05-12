/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'intern/chai!assert',
  'require',
  'intern/node_modules/dojo/node!xmlhttprequest',
  'app/bower_components/fxa-js-client/fxa-client',
  'tests/lib/helpers'
], function (registerSuite, assert, require, nodeXMLHttpRequest, FxaClient, TestHelpers) {
  'use strict';

  var url = 'http://localhost:3030/signup';
  var AUTH_SERVER_ROOT = 'http://127.0.0.1:9000/v1';

  var TOO_YOUNG_YEAR = new Date().getFullYear() - 13;

  registerSuite({
    name: 'sign_up',

    beforeEach: function () {
      // clear localStorage to avoid pollution from other tests.
      return this.get('remote')
        .get(require.toUrl(url))
        /*jshint evil:true*/
        .waitForElementById('fxa-signup-header')
        .safeEval('sessionStorage.clear(); localStorage.clear();');
    },

    teardown: function () {
      // clear localStorage to avoid polluting other tests.
      return this.get('remote')
        .get(require.toUrl(url))
        /*jshint evil:true*/
        .waitForElementById('fxa-signup-header')
        .safeEval('sessionStorage.clear(); localStorage.clear();');
    },

    'sign up': function () {
      var email = TestHelpers.createEmail();
      var password = '12345678';

      return this.get('remote')
        .get(require.toUrl(url))
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
        .end();
    },

    'select an age that is too young': function () {
      var email = TestHelpers.createEmail();
      var password = '12345678';

      return this.get('remote')
        .get(require.toUrl(url))
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

        .elementById('fxa-' + TOO_YOUNG_YEAR)
          .buttonDown()
          .buttonUp()
          .click()
        .end()

        .elementByCssSelector('button[type="submit"]')
          .click()
        .end()

        // Success is being redirected to the cannot create screen.
        .waitForElementById('fxa-cannot-create-account-header')
        .end()

        // ensure that this does not interfere with other tests.
        /*jshint evil:true, es3:false*/
        .eval('document.cookie = "tooyoung=1; expires=Thu, 01-Jan-1970 00:00:01 GMT";')
        .end();
    },

    'choose option to customize sync': function () {
      var urlForSync = url + '?service=sync';

      var email = TestHelpers.createEmail();
      var password = '12345678';

      return this.get('remote')
        .get(require.toUrl(urlForSync))
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

        .elementByCssSelector('form input.customize-sync')
          .click()
        .end()

        .elementByCssSelector('button[type="submit"]')
          .click()
        .end()

        // Being pushed to the confirmation screen is success.
        .waitForElementById('fxa-confirm-header')
        .end();
    },

    'sign up with a verified account and wrong password allows the user to sign in': function () {

      var self = this;
      var email = TestHelpers.createEmail();
      var password = '12345678';

      var client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      return client.signUp(email, password, { preVerified: true })
        .then(function () {
          return self.get('remote')
            .get(require.toUrl(url))
            .waitForElementById('fxa-signup-header')

            .elementByCssSelector('input[type=email]')
              .click()
              .type(email)
            .end()

            .elementByCssSelector('input[type=password]')
              .click()
              .type('wrong_password')
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

            // The error area shows a link to /signin
            .waitForVisibleByCssSelector('.error a[href="/signin"]')
            .elementByCssSelector('.error a[href="/signin"]')
              .click()
            .end()

            .waitForElementById('fxa-signin-header')
            .elementByCssSelector('input[type=email]')
              .getAttribute('value')
              .then(function (resultText) {
                // check the email address was written
                assert.equal(resultText, email);
              })
            .end();
        });
    },

    'sign up with an unverified account and different password re-signs up user': function () {

      var self = this;
      var email = TestHelpers.createEmail();
      var password = '12345678';

      var client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      return client.signUp(email, password)
        .then(function () {
          return self.get('remote')
            .get(require.toUrl(url))
            .waitForElementById('fxa-signup-header')

            .elementByCssSelector('input[type=email]')
              .click()
              .type(email)
            .end()

            .elementByCssSelector('input[type=password]')
              .click()
              .type('different_password')
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
            .end();
        });
    }
  });
});
