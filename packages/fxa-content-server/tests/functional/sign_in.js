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
  var PAGE_URL = 'http://localhost:3030/signin';
  var PASSWORD = 'password';
  var email;

  registerSuite({
    name: 'sign_in',

    setup: function () {
      email = 'signin' + Math.random() + '@example.com';
      var client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });
      return client.signUp(email, PASSWORD);
    },

    'sign in': function () {

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

        .waitForElementByCssSelector('.settings p.center')
        .elementByCssSelector('.settings p.center')
          .text()
          .then(function (resultText) {
            assert.ok(resultText.match(/^Congratulations,/), 'No errors in sign in');
          })
        .end();
    }
  });
});
