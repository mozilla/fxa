/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'intern/chai!assert',
  'require',
  'intern/node_modules/dojo/node!xmlhttprequest',
  'app/bower_components/fxa-js-client/fxa-client'
], function (registerSuite, assert, require, nodeXMLHttpRequest, FxaClient) {
  'use strict';

  var AUTH_SERVER_ROOT = 'http://127.0.0.1:9000/v1';
  var PAGE_URL = 'http://localhost:3030/reset_password';
  var PASSWORD = 'password';
  var email;

  registerSuite({
    name: 'reset_password',

    setup: function () {
      email = 'signin' + Math.random() + '@example.com';
      var client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });
      return client.signUp(email, PASSWORD);
    },

    'open page': function () {
      return this.get('remote')
        .get(require.toUrl(PAGE_URL))
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

    'open page with email on query params': function () {
      var url = PAGE_URL + '?email=' + email;
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
