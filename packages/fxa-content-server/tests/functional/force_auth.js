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
  var SIGNIN_URL = 'http://localhost:3030/signin';
  var FORCE_AUTH_URL = 'http://localhost:3030/force_auth';
  var PASSWORD = 'password';
  var user;
  var email;
  var accountData;
  var client;

  registerSuite({
    name: 'force_auth',

    setup: function () {
      user = 'signin' + Math.random();
      email = user + '@restmail.net';
      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });
      return client.signUp(email, PASSWORD)
        .then(function (result) {
          accountData = result;
        })
        .then(function () {
          return restmail(EMAIL_SERVER_ROOT + '/mail/' + user);
        })
        .then(function (emails) {
          var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
          return client.verifyCode(accountData.uid, code);
        });
    },

    'sign in': function () {
      return this.get('remote')
        .get(require.toUrl(SIGNIN_URL))
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

        // success is setting the settings screen.
        .waitForElementById('fxa-settings-header')
        .end();
    },

    'sign in via force-auth': function () {
      return this.get('remote')
        .get(require.toUrl(FORCE_AUTH_URL + '?email=' + email))
        .waitForElementById('fxa-force-auth-header')

        .elementByCssSelector('form input.password')
          .click()
          .type(PASSWORD)
        .end()

        .elementByCssSelector('button[type="submit"]')
          .click()
        .end()

        .waitForElementById('fxa-settings-header')
        .end();
    },

    'forgot password via force-auth has a back button': function () {
      return this.get('remote')
        .get(require.toUrl(FORCE_AUTH_URL + '?email=' + email))
        .waitForElementById('fxa-force-auth-header')

        .elementByCssSelector('.reset-password')
          .click()
        .end()

        .elementById('back')
          .click()
        .end()

        .waitForElementById('fxa-force-auth-header')
        .end();
    }


  });
});
