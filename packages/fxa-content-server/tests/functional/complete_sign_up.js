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
  var PAGE_URL_ROOT = 'http://localhost:3030/verify_email';
  var PASSWORD = 'password';
  var user;
  var email;
  var accountData;
  var client;

  registerSuite({
    name: 'complete_sign_up',

    setup: function () {
      user = 'sginin' + Math.random();
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

    'open email verification link': function () {

      var self = this;
      return restmail(EMAIL_SERVER_ROOT + '/mail/' + user)
        .then(function (emails) {
          var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
          var uid = accountData.uid;
          var url = PAGE_URL_ROOT + '?uid=' + uid + '&code=' + code;

          return self.get('remote')
            .get(require.toUrl(url))

            // a successful user is immediately redirected to the
            // sign-up-complete page.
            .waitForElementById('fxa-sign-up-complete-header')
            .end();
        });
    }
  });
});
