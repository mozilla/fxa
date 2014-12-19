/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'bower_components/fxa-js-client/fxa-client',
  'intern/node_modules/dojo/node!xmlhttprequest'
], function (intern, registerSuite, assert, require, FxaClient, nodeXMLHttpRequest) {

  var config = intern.config;
  var AUTH_SERVER_ROOT = 'http://127.0.0.1:9000/v1';
  var APP_URL = 'http://127.0.0.1:10137';
  var client = new FxaClient(AUTH_SERVER_ROOT, {
    xhr: nodeXMLHttpRequest.XMLHttpRequest
  });
  var email = 'user' + Date.now() + '@mozilla.com';
  var PASSWORD = 'password';

  registerSuite({
    name: 'clients',

    'login, add a client, update that client, delete it, logout': function () {
      this.timeout = 60 * 1000 * 60 * 2;

      return this.remote
        .get(require.toUrl(APP_URL))
        .setFindTimeout(config.pageLoadTimeout)
        .then(function () {
          return client.signUp(email, PASSWORD, { preVerified: true });
        })

        .findByCssSelector('#login')
        .click()
        .end()

        .findByCssSelector('#fxa-signin-header')
        .end()

        .findByCssSelector('input.email')
        .type(email)
        .end()

        .findByCssSelector('#password')
        .type(PASSWORD)
        .end()

        .findByCssSelector('#submit-btn')
        .click()
        .end()

        .findByCssSelector('#logout')
        .end()

        .findByCssSelector('.new-client')
        .click()
        .end()

        .findByCssSelector('#inputTitle')
        .type('sample')
        .end()

        .findByCssSelector('#inputRedirect')
        .type('sample')
        .end()

        .findByCssSelector('#inputImage')
        .type('sample')
        .end()

        .findByCssSelector('#inputImage')
        .type('sample')
        .end()

        .findByCssSelector('.register-create')
        .click()
        .end()

        .findByCssSelector('#secret')
        .getVisibleText()
        .then(function (val) {
          assert.isTrue(val.length > 0);
        })
        .end();
    }

  });
});