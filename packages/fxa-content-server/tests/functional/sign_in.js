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
      return client.signUp(email, PASSWORD)
        .then(function (result) {
          accountData = result;
          return result;
        });
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

        .waitForElementByCssSelector('.confirm section p')
        .elementByCssSelector('.confirm section p')
          .text()
          .then(function (resultText) {
            assert.ok(resultText.match(/^A verification link has been sent to/), 'No errors in sign in');
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

            .waitForElementByCssSelector('.settings section p')
            .elementByCssSelector('.settings section p')
              .text()
              .then(function (resultText) {
                assert.ok(resultText.match(/^Congratulations,/), 'No errors in sign in');
              })
            .end();
        });
    }
  });
});
