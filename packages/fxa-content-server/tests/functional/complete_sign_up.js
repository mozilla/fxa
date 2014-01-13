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
  var PAGE_URL_ROOT = 'http://localhost:3030/verify_email';
  var PASSWORD = 'password';
  var email;

  registerSuite({
    name: 'complete_sign_up',

    setup: function () {
      email = 'signin' + Math.random() + '@example.com';
      var client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });
      return client.signUp(email, PASSWORD);
    },

    'open email verification link': function () {

      // TODO - get the REAL token and UID, either programatically or from
      // the email
      var token = 'token';
      var uid = 'uid';
      var url = PAGE_URL_ROOT + '?uid=' + uid + '&code=' + token;

      return this.get('remote')
        .get(require.toUrl(url))
        .waitForElementById('fxa-complete-sign-up-header')

        .end();
    }
  });
});
