/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'intern/node_modules/dojo/node!xmlhttprequest',
  'app/bower_components/fxa-js-client/fxa-client',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, nodeXMLHttpRequest, FxaClient, TestHelpers, FunctionalHelpers) {
  var config = intern.config;
  var OAUTH_APP = config.fxaOauthApp;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;

  var PASSWORD = 'password';
  var email;
  var client;

  function openFxaFromRp(context, email) {
    var emailParam = '?email=' + encodeURIComponent(email);
    return FunctionalHelpers.openFxaFromRp(context, 'force_auth', emailParam);
  }

  function attemptSignIn(context) {
    return context.remote
      // user should be at the force-auth screen
      .findByCssSelector('#fxa-force-auth-header')
      .end()

      .findByCssSelector('input[type=password]')
        .click()
        .type(PASSWORD)
      .end()

      .findByCssSelector('button[type="submit"]')
        .click()
      .end();
  }


  registerSuite({
    name: 'oauth force_auth with a registered force_email',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });
      var self = this;
      return client.signUp(email, PASSWORD, { preVerified: true })
        .then(function () {
          // clear localStorage to avoid polluting other tests.
          return FunctionalHelpers.clearBrowserState(self, {
            '123done': true,
            contentServer: true
          });
        });
    },

    'allows the user to sign in': function () {
      var self = this;
      return openFxaFromRp(this, email)
        .then(function () {
          return attemptSignIn(self);
        })

        .findByCssSelector('#loggedin')
        .end()

        .getCurrentUrl()
        .then(function (url) {
          // redirected back to the App
          assert.ok(url.indexOf(OAUTH_APP) > -1);
        })
        .end();
    }
  });

  registerSuite({
    name: 'oauth force_auth with an unregistered force_mail',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      // clear localStorage to avoid polluting other tests.
      return FunctionalHelpers.clearBrowserState(this, {
        '123done': true,
        contentServer: true
      });
    },

    'sign in shows an error message': function () {
      var self = this;
      return openFxaFromRp(self, email)
        .then(function () {
          return attemptSignIn(self);
        })

        .then(FunctionalHelpers.visibleByQSA('.error'))
        .end();
    },

    'reset password shows an error message': function () {
      var self = this;
      return openFxaFromRp(self, email)
        .findByCssSelector('a[href="/confirm_reset_password"]')
          .click()
        .end()

        .then(FunctionalHelpers.visibleByQSA('.error'))
        .end();
    }
  });
});
