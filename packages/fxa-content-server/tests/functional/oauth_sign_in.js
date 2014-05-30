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
  'tests/lib/helpers'
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest, FxaClient, restmail, TestHelpers) {
  'use strict';

  var config = intern.config;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var OAUTH_APP = config.fxaOauthApp;
  var EMAIL_SERVER_ROOT = config.fxaEmailRoot;

  var PAGE_URL = config.fxaContentRoot + 'signin';
  var PASSWORD = 'password';
  var user;
  var email;
  var accountData;
  var client;

  registerSuite({
    name: 'oauth sign in',

    setup: function () {
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
          // clear localStorage to avoid pollution from other tests.
          return self.get('remote')
            .get(require.toUrl(PAGE_URL))
            .waitForElementById('fxa-signin-header')
            .safeEval('sessionStorage.clear(); localStorage.clear();');
        });
    },

    teardown: function () {
      // clear localStorage to avoid polluting other tests.
      // Without the clear, /signup tests fail because of the info stored
      // in prefillEmail
      /*
       return this.get('remote')
       .get(require.toUrl(PAGE_URL))
       .waitForElementById('fxa-signin-header')
       .safeEval('sessionStorage.clear(); localStorage.clear();');
       */
    },

    'verified': function () {
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
            .waitForVisibleByCssSelector('.signin')
            .elementByCssSelector('.signin')
            .click()
            .end()

            .waitForVisibleByCssSelector('#fxa-signin-header')
            .elementByCssSelector('#fxa-signin-header')
            .text()
            .then(function (text) {
              assert.ok(text.indexOf('Sign in to') > -1, 'Sign Up page should have a service header');
            })
            .end()

            .url()
            .then(function (url) {
              assert.ok(url.indexOf('oauth/signin?') > -1);
              assert.ok(url.indexOf('client_id=') > -1);
              assert.ok(url.indexOf('redirect_uri=') > -1);
              assert.ok(url.indexOf('state=') > -1);
            })
            .end()

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

            .waitForVisibleByCssSelector('#loggedin')
            .url()
            .then(function (url) {
              // redirected back to the App
              assert.ok(url.indexOf(OAUTH_APP) > -1);
            })
            .end()

            .elementByCssSelector('#loggedin')
            .text()
            .then(function (text) {
              // confirm logged in email
              assert.ok(text.indexOf(email) > -1);
            })
            .end()

            .elementByCssSelector('#logout')
            .click()
            .end()

            .waitForVisibleByCssSelector('.signup')
            .elementByCssSelector('#loggedin')
            .text()
            .then(function (text) {
              // confirm logged out
              assert.ok(text.length === 0);
            })
            .end();
        });
    },

    'unverified': function () {
      var self = this;

      return this.get('remote')
        .get(require.toUrl(OAUTH_APP))
        .waitForVisibleByCssSelector('.signin')
        .elementByCssSelector('.signin')
        .click()
        .end()

        .waitForVisibleByCssSelector('#fxa-signin-header')
        .elementByCssSelector('#fxa-signin-header')
        .text()
        .then(function (text) {
          assert.ok(text.indexOf('Sign in to') > -1, 'Sign In page should have a service header');
        })
        .end()

        .url()
        .then(function (url) {
          assert.ok(url.indexOf('oauth/signin?') > -1);
          assert.ok(url.indexOf('client_id=') > -1);
          assert.ok(url.indexOf('redirect_uri=') > -1);
          assert.ok(url.indexOf('state=') > -1);
        })
        .end()

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

        .waitForVisibleByCssSelector('#fxa-confirm-header')
        .then(function() {
          return restmail(EMAIL_SERVER_ROOT + '/mail/' + user)
            .then(function (emails) {
              // get the second email, that one will have the service
              var verifyUrl = emails[1].html.match(/Verify: ([A-Za-z0-9:\/\.\_\?\=\&]+)/)[1];
              return self.get('remote')
                .get(require.toUrl(verifyUrl));
            });
        })

        .waitForVisibleByCssSelector('#redirectTo')
        .elementByCssSelector('#redirectTo')
          .click()
        .end()

        .waitForVisibleByCssSelector('#loggedin')
        .url()
        .then(function (url) {
          // redirected back to the App
          assert.ok(url.indexOf(OAUTH_APP) > -1);
        })
        .end()

        .elementByCssSelector('#loggedin')
        .text()
        .then(function (text) {
          // confirm logged in email
          assert.ok(text.indexOf(email) > -1);
        })
        .end()

        .elementByCssSelector('#logout')
        .click()
        .end()

        .waitForVisibleByCssSelector('.signup')
        .elementByCssSelector('#loggedin')
        .text()
        .then(function (text) {
          // confirm logged out
          assert.ok(text.length === 0);
        })
        .end();
    }
  });

});
