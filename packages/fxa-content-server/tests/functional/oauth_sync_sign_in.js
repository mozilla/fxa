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
  'tests/functional/lib/helpers',
  'tests/functional/lib/fx-desktop'
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest,
        FxaClient, TestHelpers, FunctionalHelpers, FxDesktopHelpers) {
  var config = intern.config;
  var PAGE_URL = config.fxaContentRoot + 'signin?context=fx_desktop_v1&service=sync';
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;

  var client;
  var email;
  var email2;
  var PASSWORD = '12345678';
  var TOO_YOUNG_YEAR = new Date().getFullYear() - 13;
  var OLD_ENOUGH_YEAR = TOO_YOUNG_YEAR - 1;
  var accountData;

  var listenForFxaCommands = FxDesktopHelpers.listenForFxaCommands;
  var testIsBrowserNotifiedOfLogin = FxDesktopHelpers.testIsBrowserNotifiedOfLogin;

  function verifyUser(user, index) {
    return FunctionalHelpers.getVerificationHeaders(user, index)
      .then(function (headers) {
        var code = headers['x-verify-code'];
        return client.verifyCode(accountData.uid, code);
      });
  }

  registerSuite({
    name: 'Sign in with OAuth after Sync',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      email2 = TestHelpers.createEmail();

      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      var self = this;
      return client.signUp(email, PASSWORD)
        .then(function (result) {
          accountData = result;
          return result;
        })
        .then(function () {
          // clear localStorage to avoid pollution from other tests.
          return FunctionalHelpers.clearBrowserState(self, {
            contentServer: true,
            '123done': true
          });
        });
    },

    afterEach: function () {
      return FunctionalHelpers.clearBrowserState(this, {
        contentServer: true,
        '123done': true
      });
    },

    'sign in to OAuth with Sync creds': function () {
      var self = this;
      return verifyUser(email, 0)
        .then(function () {
          return self.remote

            // Sign in to Sync with existing account
            .get(require.toUrl(PAGE_URL))
            .setFindTimeout(intern.config.pageLoadTimeout)
            .execute(listenForFxaCommands)

            .findByCssSelector('#fxa-signin-header')
            .end()

            .then(function () {
              return FunctionalHelpers.fillOutSignIn(self, email, PASSWORD);
            })

            .then(function () {
              return testIsBrowserNotifiedOfLogin(self, email);
            })

            // Sign up for a new account via OAuth
            .then(function () {
              return FunctionalHelpers.openFxaFromRp(self, 'signup');
            })

            .then(function () {
              return FunctionalHelpers.fillOutSignUp(self, email2, PASSWORD, OLD_ENOUGH_YEAR);
            })

            .findByCssSelector('#fxa-confirm-header')
            .end()

            .then(function () {
              return FunctionalHelpers.openVerificationLinkSameBrowser(
                          self, email2, 0);
            })

            .switchToWindow('newwindow')
            // wait for the verified window in the new tab
            .findById('fxa-sign-up-complete-header')
            .end()

            // switch to the original window
            .closeCurrentWindow()
            .switchToWindow('')

            .findByCssSelector('#loggedin')
            .end()

            // Log out of RP
            .findByCssSelector('#logout')
              .click()
            .end()

            .then(FunctionalHelpers.visibleByQSA('#splash .signin'))
            .end()

            .findByCssSelector('#splash .signin')
              .click()
            .end()

            .findByCssSelector('#fxa-signin-header')
            .end()

            // clear the prefillEmail state
            .findByCssSelector('form input.email')
              .clearValue()
            .end()
            .findById('fxa-pp')
              .click()
            .end()
            .findById('fxa-pp-header')
            .end()

            // Sign in to RP with cached credentials from Sync account
            .then(function () {
              return FunctionalHelpers.openFxaFromRp(self, 'signin');
            })

            .findByCssSelector('.prefill')
              .getVisibleText()
              .then(function (text) {
                // We should see the email we signed up for Sync with
                assert.equal(text, email);
              })
            .end()

            .findByCssSelector('button[type="submit"]')
              .click()
            .end()

            .findByCssSelector('#loggedin')
              .getVisibleText()
              .then(function (text) {
                // We should see the email we signed up for Sync with
                assert.equal(text, email);
              })
            .end();
        });
    }

  });
});
