/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'intern/chai!assert',
  'require',
  'intern/dojo/node!picl-gherkin'
], function (registerSuite, assert, require, fxaClient) {
  'use strict';

  var url = 'http://localhost:3030/signin';
  var password = 'password';
  var email;

  registerSuite({
    name: 'sign_in',

    setup: function () {
      email = 'signin' + Math.random() + '@example.com';
      return fxaClient.create('http://127.0.0.1:9000', email, password, { preVerified: true });
    },

    'sign in': function () {

      return this.get('remote')
        .get(require.toUrl(url))
        .wait(2000)

        .elementByCssSelector('form input.email')
          .click()
          .type(email)
        .end()

        .elementByCssSelector('form input.password')
          .click()
          .type(password)
        .end()

        .elementByCssSelector('button[type="submit"]')
          .click()
        .end()

        .wait(5000)
        .elementByCssSelector('.settings p.center')
          .text()
          .then(function (resultText) {
            assert.ok(resultText.match(/^Congratulations,/), 'No errors in sign in');
          })
        .end();
    }
  });
});
