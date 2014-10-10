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

      return self.get('remote')
        .setFindTimeout(intern.config.pageLoadTimeout)
        .get(require.toUrl(OAUTH_APP))

        .then(function () {
          return client.signUp(email, PASSWORD, { preVerified: true });
        })

        // sign in with a verified account
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
        .end();
    },

    'verified using a cached login': function () {
      var self = this;
      // verify account
      return self.get('remote')
        .setFindTimeout(intern.config.pageLoadTimeout)
        .get(require.toUrl(OAUTH_APP))

        .then(function () {
          return client.signUp(email, PASSWORD, { preVerified: true });
        })

        // sign in with a verified account to cache credentials
        .get(require.toUrl(OAUTH_APP))
        .findByCssSelector('#splash .signin')
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

    'unverified': function () {
      var self = this;

      return this.get('remote')
        .setFindTimeout(intern.config.pageLoadTimeout)
        .get(require.toUrl(OAUTH_APP))

        .then(function () {
          return client.signUp(email, PASSWORD, { preVerified: false });
        })

        .findByCssSelector('#splash .signin')
          .click()
        .end()

        .findByCssSelector('#fxa-signin-header .service')
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
          return FunctionalHelpers.getVerificationLink(user, 0);
        })
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

    },

    'unverified with a cached login': function () {
      return this.get('remote')
        .setFindTimeout(intern.config.pageLoadTimeout)
        .get(require.toUrl(OAUTH_APP))

        // first, sign the user up to cache the login
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

        .findById('fxa-' + (TOO_YOUNG_YEAR - 1))
          .pressMouseButton()
          .releaseMouseButton()
          .click()
        .end()

        .findByCssSelector('button[type="submit"]')
          .click()
        .end()

        .findByCssSelector('#fxa-confirm-header')
        .end()

        // round 2 - try to sign in with the unverified user.
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
