/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'intern/chai!assert',
  'require',
  'intern/node_modules/dojo/node!xmlhttprequest',
  'app/bower_components/fxa-js-client/fxa-client',
  'tests/lib/restmail'
], function (registerSuite, assert, require, nodeXMLHttpRequest, FxaClient, restmail) {
  'use strict';

  var AUTH_SERVER_ROOT = 'http://127.0.0.1:9000/v1';
  var EMAIL_SERVER_ROOT = 'http://127.0.0.1:9001';
  var PAGE_URL = 'http://localhost:3030/signin';
  var PASSWORD = 'password';
  var user;
  var email;
  var accountData;
  var client;

  registerSuite({
    name: 'sign_in',

    setup: function () {
      user = 'signin' + Math.random();
      email = user + '@restmail.net';
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

    'sign in verified': function () {

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

    'sign in with an unknown account allows the user to sign up': function () {

      var self = this;
      var email = 'unknown@testuser.com';

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
        .end();
    }
  });
});
