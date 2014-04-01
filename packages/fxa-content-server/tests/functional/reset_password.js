/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'intern/chai!assert',
  'require',
  'intern/node_modules/dojo/node!xmlhttprequest',
  'app/bower_components/fxa-js-client/fxa-client',
  'intern/node_modules/dojo/Deferred',
  'tests/lib/restmail'
], function (registerSuite, assert, require, nodeXMLHttpRequest, FxaClient, Deferred, restmail) {
  'use strict';

  var AUTH_SERVER_ROOT = 'http://127.0.0.1:9000/v1';
  var EMAIL_SERVER_ROOT = 'http://127.0.0.1:9001';
  var RESET_PAGE_URL = 'http://localhost:3030/reset_password';
  var CONFIRM_PAGE_URL = 'http://localhost:3030/confirm_reset_password';
  var COMPLETE_PAGE_URL_ROOT = 'http://localhost:3030/complete_reset_password';
  var PASSWORD = 'password';
  var user;
  var email;
  var code;
  var token;

  registerSuite({
    name: 'reset_password same browser flow',

    setup: function () {
      user = 'signin' + Math.random();
      email = user + '@restmail.net';
      var client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });
      return client.signUp(email, PASSWORD, { preVerified: true });
    },

    'open reset_password page': function () {
      return this.get('remote')
        .get(require.toUrl(RESET_PAGE_URL))
        .waitForElementById('fxa-reset-password-header')

        .elementByCssSelector('form input.email')
          .click()
          .type(email)
        .end()

        .elementByCssSelector('button[type="submit"]')
          .click()
        .end()

        .waitForElementById('fxa-confirm-reset-password-header')
        .end();
    },

    'open confirm_reset_password page, click resend': function () {
      return this.get('remote')
        .get(require.toUrl(CONFIRM_PAGE_URL))
        .waitForElementById('fxa-confirm-reset-password-header')

        .elementById('resend')
          .click()
        .end()

        // brittle, but some processing time.
        .wait(2000)

        // Success is showing the success message
        .elementByCssSelector('.success').isDisplayed()
          .then(function (isDisplayed) {
            assert.isTrue(isDisplayed);
          })
        .end();
    },

    'click resend again, see throttled message': function () {
      return this.get('remote')
        .elementById('resend')
          .click()
        .end()

        // Success is showing the .error screen
        .elementByCssSelector('.error').isDisplayed()
          .then(function (isDisplayed) {
            assert.isTrue(isDisplayed);
          })
        .end();
    },

    'start verifiction - get token and code from email': function () {
      return restmail(EMAIL_SERVER_ROOT + '/mail/' + user, 2)
        .then(function (emails) {
          // token is a hex value
          token = emails[1].html.match(/token=([A-Fa-f0-9]+)/)[1];
          code = emails[1].html.match(/code=([A-Za-z0-9]+)/)[1];
          return code;
        });
    },

    'open complete page': function () {
      // timeout after 90 seconds
      this.timeout = 90000;

      var url = COMPLETE_PAGE_URL_ROOT + '?token=' + token + '&code=' + code + '&email=' + encodeURIComponent(email);

      return this.get('remote')
        .get(require.toUrl(url))
        .waitForElementById('fxa-complete-reset-password-header')

        .elementByCssSelector('form input#password')
          .click()
          .type(PASSWORD)
        .end()

        .elementByCssSelector('form input#vpassword')
          .click()
          .type(PASSWORD)
        .end()

        .elementByCssSelector('button[type="submit"]')
          .click()
        .end()

        .waitForElementById('fxa-reset-password-complete-header')
        .end();
    }
  });

  registerSuite({
    name: 'reset_password with email specified on URL',

    setup: function () {
      email = 'signin' + Math.random() + '@restmail.net';
      var client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });
      return client.signUp(email, PASSWORD, { preVerified: true });
    },

    'open page with email on query params': function () {
      var url = RESET_PAGE_URL + '?email=' + email;
      return this.get('remote')
        .get(require.toUrl(url))
        .waitForElementById('fxa-reset-password-header')

        .elementByCssSelector('form input.email')
          .getAttribute('value')
          .then(function (resultText) {
            // email address should be pre-filled from the query param.
            assert.equal(resultText, email);
          })
        .end()

        .elementByCssSelector('button[type="submit"]')
          .click()
        .end()

        .waitForElementById('fxa-confirm-reset-password-header')
        .end();
    }
  });
});
