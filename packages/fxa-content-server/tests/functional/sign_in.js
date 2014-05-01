/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'intern/node_modules/dojo/node!xmlhttprequest',
  'app/bower_components/fxa-js-client/fxa-client',
  'tests/lib/restmail',
  'tests/lib/helpers'
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest, FxaClient, restmail, TestHelpers) {
  'use strict';

  var config = intern.config;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var EMAIL_SERVER_ROOT = config.fxaEmailRoot;
  var PAGE_URL = config.fxaContentRoot + 'signin';
  var PASSWORD = 'password';
  var user;
  var email;
  var accountData;
  var client;

  registerSuite({
    name: 'sign_in',

    setup: function () {
      email = TestHelpers.createEmail();
      user = TestHelpers.emailToUser(email);
      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });
      var self = this;
      return client.signUp(email, PASSWORD)
        .then(function (result) {
          accountData = result;
          return result;
        })
        .then(function () {
          // clear localStorage to avoid pollution from other tests.
          return self.get('remote')
            .get(require.toUrl(PAGE_URL))
            /*jshint evil:true*/
            .waitForElementById('fxa-signin-header')
            .safeEval('sessionStorage.clear(); localStorage.clear();');
        });
    },

    teardown: function () {
      // clear localStorage to avoid polluting other tests.
      // Without the clear, /signup tests fail because of the info stored
      // in prefillEmail
      return this.get('remote')
        .get(require.toUrl(PAGE_URL))
        /*jshint evil:true*/
        .waitForElementById('fxa-signin-header')
        .safeEval('sessionStorage.clear(); localStorage.clear();');
    },

    'sign in unverified': function () {
      return this.get('remote')
        .get(require.toUrl(PAGE_URL))
        .waitForElementById('fxa-signin-header')

        .elementByCssSelector('form input.email')
          .click()
          .type(email)
        .end()

        .elementByCssSelector('form input.password')
          .click()
          .type(PASSWORD)
        .end()

        .elementByCssSelector('button[type="submit"]')
          .click()
        .end()

        .waitForElementById('fxa-confirm-header')
        .elementByCssSelector('.verification-email-message')
          .text()
          .then(function (resultText) {
            // check the email address was written
            assert.ok(resultText.indexOf(email) > -1);
          })
        .end();
    },

    'sign in verified with correct password': function () {
      var self = this;
      return restmail(EMAIL_SERVER_ROOT + '/mail/' + user, 2)
        .then(function (emails) {
          var code = emails[1].html.match(/code=([A-Za-z0-9]+)/)[1];
          return client.verifyCode(accountData.uid, code);
        })
        .then(function () {
          return self.get('remote')
            .get(require.toUrl(PAGE_URL))
            .waitForElementById('fxa-signin-header')

            .elementByCssSelector('form input.email')
              .click()
              .type(email)
            .end()

            .elementByCssSelector('form input.password')
              .click()
              .type(PASSWORD)
            .end()

            .elementByCssSelector('button[type="submit"]')
              .click()
            .end()

            // success is seeing the sign-in-complete screen.
            .waitForElementById('fxa-settings-header')
            .end();
        });
    },

    'sign in verified with incorrect password, click `forgot password?`': function () {
      var self = this;
      return restmail(EMAIL_SERVER_ROOT + '/mail/' + user, 2)
        .then(function (emails) {
          var code = emails[1].html.match(/code=([A-Za-z0-9]+)/)[1];
          return client.verifyCode(accountData.uid, code);
        })
        .then(function () {
          return self.get('remote')
            .get(require.toUrl(PAGE_URL))
            .waitForElementById('fxa-signin-header')

            .elementByCssSelector('form input.email')
              .click()
              .type(email)
            .end()

            .elementByCssSelector('form input.password')
              .click()
              .type('incorrect password')
            .end()

            .elementByCssSelector('button[type="submit"]')
              .click()
            .end()

            // success is seeing the error message.
            .waitForVisibleByClassName('error')

            // If user clicks on "forgot your password?", send
            // an email confirmation now.
            .elementByCssSelector('a[href="/reset_password"]')
              .click()
            .end()

            .waitForElementById('fxa-confirm-reset-password-header')
            .end();
        });
    },

    'sign in with an unknown account allows the user to sign up': function () {
      var self = this;
      email = TestHelpers.createEmail();
      user = TestHelpers.emailToUser(email);

      return self.get('remote')
        .get(require.toUrl(PAGE_URL))
        .waitForElementById('fxa-signin-header')

        .elementByCssSelector('input[type=email]')
          .click()
          .type(email)
        .end()

        .elementByCssSelector('input[type=password]')
          .click()
          .type(PASSWORD)
        .end()

        .elementByCssSelector('button[type="submit"]')
          .click()
        .end()

        // The error area shows a link to /signup
        .waitForElementByCssSelector('.error a[href="/signup"]')
        .elementByCssSelector('.error a[href="/signup"]')
          .click()
        .end()

        .waitForElementById('fxa-signup-header')
        .elementByCssSelector('input[type=email]')
          .getAttribute('value')
          .then(function (resultText) {
            // check the email address was written
            assert.equal(resultText, email);
          })
        .end()

        .elementByCssSelector('input[type=password]')
          .getAttribute('value')
          .then(function (resultText) {
            // check the password carried over.
            assert.equal(resultText, PASSWORD);
          })
        .end();
    },

    'click on `forgot password?` with an unknown account allows the user to sign up': function () {
      var self = this;
      email = TestHelpers.createEmail();
      user = TestHelpers.emailToUser(email);

      return self.get('remote')
        .get(require.toUrl(PAGE_URL))
        .waitForElementById('fxa-signin-header')

        .elementByCssSelector('input[type=email]')
          .click()
          .clear()
          .type(email)
        .end()

        .elementByCssSelector('input[type=password]')
          .click()
          .type(PASSWORD)
        .end()

        .elementByCssSelector('a[href="/reset_password"]')
          .click()
        .end()

        // The error area shows a link to /signup
        .waitForElementByCssSelector('.error a[href="/signup"]')
        .elementByCssSelector('.error a[href="/signup"]')
          .click()
        .end()

        .waitForElementById('fxa-signup-header')
        .elementByCssSelector('input[type=email]')
          .getAttribute('value')
          .then(function (resultText) {
            // check the email address was written
            assert.equal(resultText, email);
          })
        .end();
    },

    'click `forgot password?` link with no email redirects to /forgot_password': function () {
      var self = this;

      return self.get('remote')
        .get(require.toUrl(PAGE_URL))
        .waitForElementById('fxa-signin-header')

        .elementByCssSelector('input[type=email]')
          .click()
          .clear()
        .end()

        .elementByCssSelector('a[href="/reset_password"]')
          .click()
        .end()

        .waitForElementById('fxa-reset-password-header');
    },

    'click `forgot password?` link with invalid email redirects to /forgot_password and prefills partial email': function () {
      var self = this;
      email = 'partial';

      return self.get('remote')
        .get(require.toUrl(PAGE_URL))
        .waitForElementById('fxa-signin-header')

        .elementByCssSelector('input[type=email]')
          .click()
          .clear()
          .type(email)
        .end()

        .elementByCssSelector('a[href="/reset_password"]')
          .click()
        .end()

        .waitForElementById('fxa-reset-password-header')
        .elementByCssSelector('input[type=email]')
          .getAttribute('value')
          .then(function (resultText) {
            // check the email address was written
            assert.equal(resultText, email);
          })
        .end();
    }
  });
});
