/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'intern/node_modules/dojo/node!xmlhttprequest',
  'app/bower_components/fxa-js-client/fxa-client',
  'tests/lib/restmail',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest, FxaClient, restmail, TestHelpers, FunctionalHelpers) {
  'use strict';

  var config = intern.config;
  var OAUTH_APP = config.fxaOauthApp;

  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var EMAIL_SERVER_ROOT = config.fxaEmailRoot;

  var PASSWORD = 'password';
  var user;
  var email;
  var client;
  var accountData;

  registerSuite({
    name: 'oauth reset password',

    setup: function () {
      // timeout after 90 seconds
      this.timeout = 90000;

      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });
    },

    beforeEach: function () {
      email = TestHelpers.createEmail();
      user = TestHelpers.emailToUser(email);
      var self = this;

      return client.signUp(email, PASSWORD)
        .then(function (result) {
          accountData = result;
        })
        .then(function () {
          // clear localStorage to avoid polluting other tests.
          return FunctionalHelpers.clearBrowserState(self, {
            contentServer: true,
            '123done': true
          });
        });
    },

    'oauth reset password': function () {
      var self = this;

      // verify account
      return restmail(EMAIL_SERVER_ROOT + '/mail/' + user)
        .then(function (emails) {
          var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
          return client.verifyCode(accountData.uid, code);
        })
        .then(function () {
          return self.get('remote')
            .get(require.toUrl(OAUTH_APP))
            .setFindTimeout(intern.config.pageLoadTimeout)
            .findByCssSelector('.signin')
            .click()
            .end()

            .findByCssSelector('#fxa-signin-header')
            .getCurrentUrl()
            .then(function (url) {
              assert.ok(url.indexOf('oauth/signin?') > -1);
              assert.ok(url.indexOf('client_id=') > -1);
              assert.ok(url.indexOf('redirect_uri=') > -1);
              assert.ok(url.indexOf('state=') > -1);
            })
            .end()

            .findByCssSelector('#fxa-signin-header .service')
            .end()

            .findByCssSelector('a[href="/reset_password"]')
            .click()
            .end()

            .findById('fxa-reset-password-header')
            .end()

            .findByCssSelector('input[type=email]')
            .click()
            .type(email)
            .end()

            .findByCssSelector('button[type="submit"]')
            .click()
            .end()

            .findById('fxa-confirm-reset-password-header')
            .then(function () {
              return FunctionalHelpers.getVerificationLink(user, 1);
            })
            .then(function (url) {
              return self.get('remote').get(require.toUrl(url));
            })
            .end()

            .findById('fxa-complete-reset-password-header')
            .end()

            .findByCssSelector('form input#password')
            .click()
            .type(PASSWORD)
            .end()

            .findByCssSelector('form input#vpassword')
            .click()
            .type(PASSWORD)
            .end()

            .findByCssSelector('button[type="submit"]')
            .click()
            .end()

            .findById('fxa-reset-password-complete-header')
            .end()

            .findByCssSelector('.account-ready-service')
            .getVisibleText()
            .then(function (text) {
              // user sees the name of the rp,
              // but cannot redirect
              assert.isTrue(/123done/i.test(text));
            })
            .end();
        });
    },

    'oauth reset password, verify in a second browser': function () {
      var self = this;

      // verify account
      return restmail(EMAIL_SERVER_ROOT + '/mail/' + user)
        .then(function (emails) {
          var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
          return client.verifyCode(accountData.uid, code);
        })
        .then(function () {
          return self.get('remote')
            .get(require.toUrl(OAUTH_APP))
            .setFindTimeout(intern.config.pageLoadTimeout)
            .findByCssSelector('.signin')
            .click()
            .end()

            .findByCssSelector('#fxa-signin-header')
            .getCurrentUrl()
            .then(function (url) {
              assert.ok(url.indexOf('oauth/signin?') > -1);
              assert.ok(url.indexOf('client_id=') > -1);
              assert.ok(url.indexOf('redirect_uri=') > -1);
              assert.ok(url.indexOf('state=') > -1);
            })
            .end()

            .findByCssSelector('#fxa-signin-header .service')
            .end()

            .findByCssSelector('a[href="/reset_password"]')
            .click()
            .end()

            .findById('fxa-reset-password-header')
            .end()

            .findByCssSelector('input[type=email]')
            .click()
            .type(email)
            .end()

            .findByCssSelector('button[type="submit"]')
            .click()
            .end()

            .findById('fxa-confirm-reset-password-header')
            .then(function () {
              // clear all browser state, simulate opening in a new
              // browser
              return FunctionalHelpers.clearBrowserState(self, {
                contentServer: true,
                '123done': true
              });
            })
            .then(function () {
              return FunctionalHelpers.getVerificationLink(user, 1);
            })
            .then(function (url) {
              return self.get('remote').get(require.toUrl(url));
            })
            .end()

            .findById('fxa-complete-reset-password-header')
            .end()

            .findByCssSelector('form input#password')
            .click()
            .type(PASSWORD)
            .end()

            .findByCssSelector('form input#vpassword')
            .click()
            .type(PASSWORD)
            .end()

            .findByCssSelector('button[type="submit"]')
            .click()
            .end()

            .findById('fxa-reset-password-complete-header')
            .end()

            .findByCssSelector('.account-ready-service')
            .getVisibleText()
            .then(function (text) {
              // user sees the name of the rp,
              // but cannot redirect
              assert.isTrue(/123done/i.test(text));
            })
            .end();
        });
    }

  });

});
