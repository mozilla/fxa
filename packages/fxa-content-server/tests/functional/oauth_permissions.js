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
  var OAUTH_APP = config.fxaUntrustedOauthApp;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;

  var PASSWORD = 'password';
  var user;
  var email;

  var client;

  registerSuite({
    name: 'oauth permissions',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      user = TestHelpers.emailToUser(email);
      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      return FunctionalHelpers.clearBrowserState(this, {
        '321done': true,
        contentServer: true
      });
    },

    'sign in verified': function () {
      var self = this;

      return FunctionalHelpers.openFxaFromUntrustedRp(self, 'signin')
        .then(function () {
          return client.signUp(email, PASSWORD, { preVerified: true });
        })

        .then(function () {
          return FunctionalHelpers.fillOutSignIn(self, email, PASSWORD);
        })

        .findByCssSelector('#fxa-permissions-header')
        .end()

        .findByCssSelector('#accept')
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

    're-sign in verified': function () {
      var self = this;

      return FunctionalHelpers.openFxaFromUntrustedRp(self, 'signin')
        .then(function () {
          return client.signUp(email, PASSWORD, { preVerified: true });
        })

        .then(function () {
          return FunctionalHelpers.fillOutSignIn(self, email, PASSWORD);
        })

        .findByCssSelector('#fxa-permissions-header')
        .end()

        .findByCssSelector('#accept')
          .click()
        .end()

        .findByCssSelector('#loggedin')

        .getCurrentUrl()
        .then(function (url) {
          // redirected back to the App
          assert.ok(url.indexOf(OAUTH_APP) > -1);
        })
        .end()

        .findByCssSelector('#logout')
          .click()
        .end()

        .findByCssSelector('.signin')
          .click()
        .end()

        // user signed in previously and should not need to enter
        // their email address.
        .findByCssSelector('input[type=password]')
          .click()
          .clearValue()
          .type(PASSWORD)
        .end()

        .findByCssSelector('button[type=submit]')
          .click()
        .end()

        .findByCssSelector('#loggedin')
        .getCurrentUrl()
        .then(function (url) {
          // redirected back to the App without seeing the permissions screen.
          assert.ok(url.indexOf(OAUTH_APP) > -1);
        })
        .end();
    },

    'sign in unverified, acts like signup': function () {
      var self = this;

      return FunctionalHelpers.openFxaFromUntrustedRp(self, 'signin')
        .then(function () {
          return client.signUp(email, PASSWORD, { preVerified: false });
        })

        .then(function () {
          return FunctionalHelpers.fillOutSignIn(self, email, PASSWORD);
        })

        .findByCssSelector('#fxa-permissions-header')
        .end()

        .findByCssSelector('#accept')
          .click()
        .end()

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


    'signup, verify same browser': function () {
      var self = this;
      return FunctionalHelpers.openFxaFromUntrustedRp(self, 'signup')
        .findByCssSelector('#fxa-signup-header .service')
        .end()

        .getCurrentUrl()
        .then(function (url) {
          assert.ok(url.indexOf('client_id=') > -1);
          assert.ok(url.indexOf('redirect_uri=') > -1);
          assert.ok(url.indexOf('state=') > -1);
        })
        .end()

        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD);
        })

        .findByCssSelector('#fxa-permissions-header')
        .end()
        .findByCssSelector('#accept')
          .click()
        .end()

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(function () {
          return FunctionalHelpers.openVerificationLinkInNewTab(
                      self, email, 0);
        })

        .switchToWindow('newwindow')
        // wait for the verified window in the new tab
        .findById('fxa-sign-up-complete-header')
        .end()

        .sleep(5000)
        .findByCssSelector('.account-ready-service')
        .getVisibleText()
        .then(function (text) {
          // user sees the name of the RP,
          // but cannot redirect
          assert.ok(/321done Untrusted/i.test(text));
        })
        .end()

        // switch to the original window
        .closeCurrentWindow()
        .switchToWindow('')

        .findByCssSelector('#loggedin')
        .end();
    },

    'preverified sign up': function () {
      var self = this;
      var SIGNUP_URL = OAUTH_APP + 'api/preverified-signup?' +
                        'email=' + encodeURIComponent(email);

      return FunctionalHelpers.openPage(self, SIGNUP_URL, '#fxa-signup-header')

        .findByCssSelector('form input.password')
          .click()
          .type(PASSWORD)
        .end()

        .findByCssSelector('#age')
          // XXX: Bug in Selenium 2.47.1, if Firefox is out of focus it will just type 1 number,
          // split the type commands for each character to avoid issues with the test runner
          .type('2')
          .type('4')
        .end()

        .findByCssSelector('button[type="submit"]')
          .click()
        .end()

        .findByCssSelector('#fxa-permissions-header')
        .end()

        .findByCssSelector('#accept')
          .click()
        .end()

        // user is redirected to 123done, wait for the footer first,
        // and then for the loggedin user to be visible. If we go
        // straight for the loggedin user, visibleByQSA blows up
        // because 123done isn't loaded yet and it complains about
        // the unload event of the content server.
        .findByCssSelector('#footer-main')
        .end()

        // user is pre-verified and sent directly to the RP.
        .then(FunctionalHelpers.visibleByQSA('#loggedin'))
        .end()

        .findByCssSelector('#loggedin')
        .getVisibleText()
        .then(function (text) {
          // user is signed in as pre-verified email
          assert.equal(text, email);
        })
        .end();
    },

    'signup, then sign in': function () {
      var self = this;
      return FunctionalHelpers.openFxaFromUntrustedRp(self, 'signup')
        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD);
        })

        .findByCssSelector('#fxa-permissions-header')
        .end()

        .findByCssSelector('#accept')
          .click()
        .end()

        .findByCssSelector('#fxa-confirm-header')
        .end()

        .then(function () {
          return FunctionalHelpers.openVerificationLinkInNewTab(
                      self, email, 0);
        })

        .switchToWindow('newwindow')
        // wait for the verified window in the new tab
        .findById('fxa-sign-up-complete-header')
        .end()

        .sleep(5000)
        .findByCssSelector('.account-ready-service')
        .getVisibleText()
        .then(function (text) {
          // user sees the name of the RP,
          // but cannot redirect
          assert.ok(/321done Untrusted/i.test(text));
        })
        .end()

        // switch to the original window
        .closeCurrentWindow()
        .switchToWindow('')

        .findByCssSelector('#loggedin')
        .end()

        .findByCssSelector('#logout')
          .click()
        .end()

        .findByCssSelector('.signin')
          .click()
        .end()

        // user signed in previously and should not need to enter
        // their email address.
        .findByCssSelector('input[type=password]')
          .click()
          .clearValue()
          .type(PASSWORD)
        .end()

        .findByCssSelector('button[type=submit]')
          .click()
        .end()

        .findByCssSelector('#loggedin')
        .getCurrentUrl()
        .then(function (url) {
          // redirected back to the App without seeing the permissions screen.
          assert.ok(url.indexOf(OAUTH_APP) > -1);
        })
        .end();
    }
  });

});
