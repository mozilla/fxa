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
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest, FxaClient, TestHelpers, FunctionalHelpers) {
  'use strict';

  var config = intern.config;
  var CONTENT_SERVER = config.fxaContentRoot;
  var OAUTH_APP = config.fxaOauthApp;

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
        // always go to the content server so the browser state is cleared
        .get(require.toUrl(CONTENT_SERVER))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .then(function () {
          return FunctionalHelpers.clearBrowserState(self);
        })
        // sign up, do not verify steps
        .get(require.toUrl(OAUTH_APP))
        .findByCssSelector('#splash .signup')
        .click()
        .end()

        .findByCssSelector('form input.email')
        .clearValue()
        .click()
        .type(email)
        .end()

        .findByCssSelector('form input.password')
        .click()
        .type(PASSWORD)
        .end()

        .findByCssSelector('#fxa-age-year')
        .click()
        .end()

        .findById('fxa-' + (TOO_YOUNG_YEAR - 1))
        .pressMouseButton()
        .releaseMouseButton()
        .click()
        .end()

        .findByCssSelector('button[type="submit"]')
        .click()
        .end()

        .findByCssSelector('#fxa-confirm-header')
        .end();
    },

    'verified': function () {
      var self = this;
      // verify account
      return FunctionalHelpers.getVerificationLink(user, 0)
        .then(function (verificationUrl) {

          return self.get('remote')
            .setFindTimeout(intern.config.pageLoadTimeout)
            .get(verificationUrl)

            // wait for confirmation
            .findById('fxa-sign-up-complete-header')
            .end()
            // sign in with a verified account
            .get(require.toUrl(OAUTH_APP))
            .findByCssSelector('#splash .signin')
            .click()
            .end()

            .findByCssSelector('#fxa-signin-header .service')
            .end()

            .getCurrentUrl()
            .then(function (url) {
              assert.ok(url.indexOf('oauth/signin?') > -1);
              assert.ok(url.indexOf('client_id=') > -1);
              assert.ok(url.indexOf('redirect_uri=') > -1);
              assert.ok(url.indexOf('state=') > -1);
            })
            .end()

            .findByCssSelector('.use-different')
            .click()
            .end()

            .findByCssSelector('form input.email')
            .clearValue()
            .click()
            .type(email)
            .end()

            .findByCssSelector('form input.password')
            .click()
            .type(PASSWORD)
            .end()

            .findByCssSelector('button[type="submit"]')
            .click()
            .end()

            .findByCssSelector('#loggedin')
            .getCurrentUrl()
            .then(function (url) {
              // redirected back to the App
              assert.ok(url.indexOf(OAUTH_APP) > -1);
            })
            .end()

            // let items load
            .findByCssSelector('#todolist li')
            .end()

            .findByCssSelector('#loggedin')
            .getVisibleText()
            .then(function (text) {
              // confirm logged in email
              assert.ok(text.indexOf(email) > -1);
            })
            .end()

            .findByCssSelector('#logout')
            .click()
            .end()

            .findByCssSelector('#loggedin')
            .getVisibleText()
            .then(function (text) {
              // confirm logged out
              assert.ok(text.length === 0);
            })
            .end();
        });
    },

    'verified using a cached login': function () {
      var self = this;
      // verify account
      return FunctionalHelpers.getVerificationLink(user, 0)
        .then(function (verificationUrl) {

          return self.get('remote')
            .setFindTimeout(intern.config.pageLoadTimeout)
            .get(verificationUrl)

            // wait for confirmation
            .findById('fxa-sign-up-complete-header')
            .end()
            // sign in with a verified account
            .get(require.toUrl(OAUTH_APP))
            .findByCssSelector('#splash .signin')
            .click()
            .end()

            .findByCssSelector('#fxa-signin-header .service')
            .end()

            .findByCssSelector('form input.password')
            .click()
            .type(PASSWORD)
            .end()

            .findByCssSelector('button[type="submit"]')
            .click()
            .end()

            .findByCssSelector('#loggedin')
            .getCurrentUrl()
            .then(function (url) {
              // redirected back to the App
              assert.ok(url.indexOf(OAUTH_APP) > -1);
            })
            .end()

            // let items load
            .findByCssSelector('#todolist li')
            .end()

            .findByCssSelector('#loggedin')
            .getVisibleText()
            .then(function (text) {
              // confirm logged in email
              assert.ok(text.indexOf(email) > -1);
            })
            .end()

            .findByCssSelector('#logout')
            .click()
            .end()

            .findByCssSelector('#loggedin')
            .getVisibleText()
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
        .setFindTimeout(intern.config.pageLoadTimeout)
        .get(require.toUrl(OAUTH_APP))
        .findByCssSelector('#splash .signin')
        .click()
        .end()

        .findByCssSelector('#fxa-signin-header .service')
        .end()

        .getCurrentUrl()
        .then(function (url) {
          assert.ok(url.indexOf('oauth/signin?') > -1);
          assert.ok(url.indexOf('client_id=') > -1);
          assert.ok(url.indexOf('redirect_uri=') > -1);
          assert.ok(url.indexOf('state=') > -1);
        })
        .end()

        .findByCssSelector('.use-different')
        .click()
        .end()

        .findByCssSelector('form input.email')
        .clearValue()
        .click()
        .type(email)
        .end()

        .findByCssSelector('form input.password')
        .click()
        .type(PASSWORD)
        .end()

        .findByCssSelector('button[type="submit"]')
        .click()
        .end()

        .findByCssSelector('#fxa-confirm-header')
        .then(function () {
          return FunctionalHelpers.getVerificationLink(user, 0)
            .then(function (verifyUrl) {
              return self.get('remote')
                .get(require.toUrl(verifyUrl))
                .findByCssSelector('.account-ready-service')
                .getVisibleText()
                .then(function (text) {
                  // user sees the name of the rp,
                  // but cannot redirect
                  assert.isTrue(/123done/i.test(text));
                })
                .end();
            });

        });
    },
    'unverified with a cached login': function () {
      return this.get('remote')
        .setFindTimeout(intern.config.pageLoadTimeout)
        .get(require.toUrl(OAUTH_APP))
        .findByCssSelector('#splash .signin')
        .click()
        .end()

        .findByCssSelector('#fxa-signin-header .service')
        .end()

        .findByCssSelector('form input.password')
        .click()
        .type(PASSWORD)
        .end()

        .findByCssSelector('button[type="submit"]')
        .click()
        .end()

        // success is using a cached login and being redirected to a confirmation screen
        .findByCssSelector('#fxa-confirm-header')
        .end();
    }
  });

});
