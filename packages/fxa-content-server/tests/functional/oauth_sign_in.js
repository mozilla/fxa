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
  var config = intern.config;
  var OAUTH_APP = config.fxaOauthApp;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var SIGNIN_ROOT = config.fxaContentRoot + 'oauth/signin';

  var PASSWORD = 'password';
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
        '123done': true,
        contentServer: true
      });
    },

    'with missing client_id': function () {
      return this.remote.get(require.toUrl(SIGNIN_ROOT + '?scope=profile'))
        .findByCssSelector('#fxa-400-header')
        .end();
    },

    'with missing scope': function () {
      return this.remote.get(require.toUrl(SIGNIN_ROOT + '?client_id=client_id'))
        .findByCssSelector('#fxa-400-header')
        .end();
    },

    'with invalid client_id': function () {
      return this.remote.get(require.toUrl(SIGNIN_ROOT + '?client_id=invalid_client_id&scope=profile'))
        .findByCssSelector('#fxa-400-header')
        .end();
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

        .then(FunctionalHelpers.visibleByQSA('.ready #splash .signin'))
        .end()

        // round 2 - with the cached credentials
        .findByCssSelector('.ready #splash .signin')
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
          // get the second email, the first was sent on client.signUp w/
          // preVerified: false above. The second email has the `service` and
          // `resume` parameters.
          return FunctionalHelpers.getVerificationLink(user, 1);
        })
        .then(function (verifyUrl) {
          return self.remote
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
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD);
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
    },

    'oauth endpoint chooses the right auth flows': function () {
      var self = this;

      return self.remote
        .get(require.toUrl(OAUTH_APP))
        .setFindTimeout(intern.config.pageLoadTimeout)

        // use the 'Choose my sign-in flow for me' button
        .findByCssSelector('.ready #splash .sign-choose')
        .click()
        .end()

        .findByCssSelector('#fxa-signup-header')
        .end()

        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD);
        })

        .findByCssSelector('#fxa-confirm-header')
        .end()

        // go back to the OAuth app, the /oauth flow should
        // now suggest a cached login
        .get(require.toUrl(OAUTH_APP))
        // again, use the 'Choose my sign-in flow for me' button
        .findByCssSelector('.ready #splash .sign-choose')
        .click()
        .end()

        .findByCssSelector('#fxa-signin-header')
        .end();
    },
  });

});
