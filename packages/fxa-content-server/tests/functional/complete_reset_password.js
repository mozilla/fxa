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
  var PAGE_URL_ROOT = 'http://localhost:3030/complete_reset_password';
  var PASSWORD = 'password';
  var email;
  var code;
  var token;

  registerSuite({
    name: 'complete_reset_password',

    setup: function () {
      var user = 'signin' + Math.random();
      email = user + '@restmail.net';

      var client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      return client.signUp(email, PASSWORD)
        .then(function () {
          return client.passwordForgotSendCode(email);
        })
        .then(function (result) {
          token = result.passwordForgotToken;

          return restmail(EMAIL_SERVER_ROOT + '/mail/' + user, 2)
            .then(function (emails) {
              code = emails[1].html.match(/code=([A-Za-z0-9]+)/)[1];
              return code;
            });
        });
    },

    'open page': function () {
      // timeout after 90 seconds
      this.timeout = 90000;

      var url = PAGE_URL_ROOT + '?token=' + token + '&code=' + code + '&email=' + encodeURIComponent(email);

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
});
