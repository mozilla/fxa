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
  var OAUTH_APP = config.fxaOauthApp;
  var EMAIL_SERVER_ROOT = config.fxaEmailRoot;

  var PAGE_URL = config.fxaContentRoot + 'signin';
  var PASSWORD = 'password';
  var TOO_YOUNG_YEAR = new Date().getFullYear() - 13;
  var user;
  var email;

  registerSuite({
    name: 'oauth sign in',

    setup: function () {
    },

    beforeEach: function () {
      email = TestHelpers.createEmail();
      user = TestHelpers.emailToUser(email);
      var self = this;

      return self.get('remote')
        .get(require.toUrl(PAGE_URL))
        .waitForElementById('fxa-signin-header')
        .safeEval('sessionStorage.clear(); localStorage.clear();')
        // sign up, do not verify steps
        .get(require.toUrl(OAUTH_APP))
        .waitForVisibleByCssSelector('#splash')
        .elementByCssSelector('#splash .signup')
        .click()
        .end()

        .waitForVisibleByCssSelector('#fxa-signup-header')
        .elementByCssSelector('form input.email')
        .click()
        .type(email)
        .end()

        .elementByCssSelector('form input.password')
        .click()
        .type(PASSWORD)
        .end()

        .elementByCssSelector('#fxa-age-year')
        .click()
        .end()

        .elementById('fxa-' + (TOO_YOUNG_YEAR - 1))
        .buttonDown()
        .buttonUp()
        .click()
        .end()

        .elementByCssSelector('button[type="submit"]')
        .click()
        .end()

        .waitForVisibleByCssSelector('#fxa-confirm-header')
        .end();
    },

    'verified': function () {
      var self = this;
      // verify account
      return restmail(EMAIL_SERVER_ROOT + '/mail/' + user)
        .then(function (emails) {

          return self.get('remote')
            .get(require.toUrl(emails[0].headers['x-link']))
            .waitForVisibleByCssSelector('#fxa-sign-up-complete-header')
            // sign in with a verified account
            .get(require.toUrl(OAUTH_APP))
            .waitForVisibleByCssSelector('#splash')
            .elementByCssSelector('#splash .signin')
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
        // Step 2: Try to sign in, unverified
        .get(require.toUrl(OAUTH_APP))
        .waitForVisibleByCssSelector('#splash')
        .elementByCssSelector('#splash .signin')
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
        .then(function () {
          return restmail(EMAIL_SERVER_ROOT + '/mail/' + user)
            .then(function (emails) {
              var verifyUrl = emails[0].headers['x-link'];
              console.log(verifyUrl);
              return self.get('remote')
                .get(require.toUrl(verifyUrl));
            });
        })
        .waitForVisibleByCssSelector('#fxa-sign-up-complete-header')
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
