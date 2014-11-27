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
  var OAUTH_APP = config.fxaOauthApp;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;

  var PASSWORD = 'password';
  var TOO_YOUNG_YEAR = new Date().getFullYear() - 13;
  var OLD_ENOUGH_YEAR = TOO_YOUNG_YEAR - 1;
  var user;
  var email;

  var client;

  registerSuite({
    name: 'oauth sign in',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      user = TestHelpers.emailToUser(email);
      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      return FunctionalHelpers.clearBrowserState(this, {
        contentServer: true,
        '123done': true
      });
    },

    'verified': function () {
      var self = this;

      return FunctionalHelpers.openFxaFromRp(self, 'signin')
        .then(function () {
          return client.signUp(email, PASSWORD, { preVerified: true });
        })

        .then(function () {
          return FunctionalHelpers.fillOutSignIn(self, email, PASSWORD);
        })

        .findByCssSelector('#loggedin')
        .getCurrentUrl()
        .then(function (url) {
          // redirected back to the App
          assert.ok(url.indexOf(OAUTH_APP) > -1);
        })
        .end();
    },

    'verified using a cached login': function () {
      var self = this;
      // verify account
      return FunctionalHelpers.openFxaFromRp(self, 'signin')
        .then(function () {
          return client.signUp(email, PASSWORD, { preVerified: true });
        })

        // sign in with a verified account to cache credentials
        .then(function () {
          return FunctionalHelpers.fillOutSignIn(self, email, PASSWORD);
        })

        .findByCssSelector('#loggedin')
        .getCurrentUrl()
        .then(function (url) {
          // redirected back to the App
          assert.ok(url.indexOf(OAUTH_APP) > -1);
        })
        .end()

        // let items load
        .findByCssSelector('#logout')
          .click()
        .end()

        .then(FunctionalHelpers.visibleByQSA('#splash .signin'))
        .end()

        // round 2 - with the cached credentials
        .findByCssSelector('#splash .signin')
          .click()
        .end()

        .findByCssSelector('#fxa-signin-header')
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
        .end();
    },

    'unverified, acts like signup': function () {
      var self = this;

      return FunctionalHelpers.openFxaFromRp(self, 'signin')
        .then(function () {
          return client.signUp(email, PASSWORD, { preVerified: false });
        })

        .then(function () {
          return FunctionalHelpers.fillOutSignIn(self, email, PASSWORD);
        })

        .findByCssSelector('#fxa-confirm-header')

        .then(function () {
          return FunctionalHelpers.getVerificationLink(user, 0);
        })
        .then(function (verifyUrl) {
          return self.get('remote')
            // user verifies in the same tab, so they are logged in to the RP.
            .get(require.toUrl(verifyUrl))

            .findByCssSelector('#loggedin')
            .end();
        });

    },

    'unverified with a cached login': function () {
      var self = this;
      return FunctionalHelpers.openFxaFromRp(self, 'signup')
        .findByCssSelector('#fxa-signup-header')
        .end()

        // first, sign the user up to cache the login
        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD, OLD_ENOUGH_YEAR );
        })

        .findByCssSelector('#fxa-confirm-header')
        .end()

        // round 2 - try to sign in with the unverified user.
        .then(function () {
          return FunctionalHelpers.openFxaFromRp(self, 'signin');
        })

        .findByCssSelector('#fxa-signin-header .service')
        .end()

        .findByCssSelector('form input.password')
          .click()
          .type(PASSWORD)
        .end()

        .findByCssSelector('button[type="submit"]')
          .click()
        .end()

        // success is using a cached login and being redirected
        // to a confirmation screen
        .findByCssSelector('#fxa-confirm-header')
        .end();
    }
  });

});
