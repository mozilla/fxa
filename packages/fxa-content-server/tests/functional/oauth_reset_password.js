/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'intern/browser_modules/dojo/node!xmlhttprequest',
  'app/bower_components/fxa-js-client/fxa-client',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest,
      FxaClient, TestHelpers, FunctionalHelpers) {
  var config = intern.config;

  var AUTH_SERVER_ROOT = config.fxaAuthRoot;

  var PASSWORD = 'password';
  var TIMEOUT = 90 * 1000;
  var email;
  var client;

  var closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;

  registerSuite({
    name: 'oauth reset password',

    beforeEach: function () {
      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });
      // timeout after 90 seconds
      this.timeout = TIMEOUT;
      email = TestHelpers.createEmail();
      var self = this;

      return client.signUp(email, PASSWORD, { preVerified: true })
        .then(function (result) {
          // do nothing
        })
        .then(function () {
          // clear localStorage to avoid polluting other tests.
          return FunctionalHelpers.clearBrowserState(self, {
            '123done': true,
            contentServer: true
          });
        });
    },

    'reset password, verify same browser': function () {
      var self = this;
      self.timeout = TIMEOUT;

      return FunctionalHelpers.openFxaFromRp(self, 'signin')
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

        .then(function () {
          return FunctionalHelpers.fillOutResetPassword(self, email);
        })

        .findById('fxa-confirm-reset-password-header')
        .end()

        .then(function () {
          return FunctionalHelpers.openVerificationLinkInNewTab(
                      self, email, 0);
        })

        // Complete the reset password in the new tab
        .switchToWindow('newwindow')

        .findById('fxa-complete-reset-password-header')
        .end()

        .then(function () {
          return FunctionalHelpers.fillOutCompleteResetPassword(self, PASSWORD, PASSWORD);
        })

        // this tab's success is seeing the reset password complete header.
        .findByCssSelector('#fxa-reset-password-complete-header')
        .end()

        .findByCssSelector('.account-ready-service')
        .getVisibleText()
        .then(function (text) {
          // user sees the name of the rp,
          // but cannot redirect
          assert.isTrue(/123done/i.test(text));
        })
        .end()

        .then(closeCurrentWindow())

        // the original tab should automatically sign in
        .findByCssSelector('#loggedin')
        .end();
    },

    'reset password, verify same browser with original tab closed': function () {
      var self = this;

      return FunctionalHelpers.openFxaFromRp(self, 'signin')

        .findByCssSelector('.reset-password')
          .click()
        .end()

        .then(function () {
          return FunctionalHelpers.fillOutResetPassword(self, email);
        })

        .findByCssSelector('#fxa-confirm-reset-password-header')
        .end()

        // user browses to another site.
        .then(FunctionalHelpers.openExternalSite(self))

        .then(function () {
          return FunctionalHelpers.openVerificationLinkInNewTab(
                      self, email, 0);
        })

        .switchToWindow('newwindow')

        .then(function () {
          return FunctionalHelpers.fillOutCompleteResetPassword(
              self, PASSWORD, PASSWORD);
        })

        .findByCssSelector('#fxa-reset-password-complete-header')
        .end()

        // switch to the original window
        .then(closeCurrentWindow());
    },

    'reset password, verify same browser by replacing the original tab': function () {
      var self = this;

      return FunctionalHelpers.openFxaFromRp(self, 'signin')
        .findByCssSelector('.reset-password')
          .click()
        .end()

        .then(function () {
          return FunctionalHelpers.fillOutResetPassword(self, email);
        })

        .findByCssSelector('#fxa-confirm-reset-password-header')
        .end()

        .then(function () {
          return FunctionalHelpers.getVerificationLink(email, 0);
        })
        .then(function (verificationLink) {
          return self.remote.get(require.toUrl(verificationLink));
        })

        .then(function () {
          return FunctionalHelpers.fillOutCompleteResetPassword(
              self, PASSWORD, PASSWORD);
        })

        .findByCssSelector('#loggedin')
        .end();
    },

    'reset password, verify in a different browser, from the original tab\'s P.O.V.': function () {
      var self = this;

      return FunctionalHelpers.openFxaFromRp(self, 'signin')
        .findByCssSelector('a[href="/reset_password"]')
          .click()
        .end()

        .findById('fxa-reset-password-header')
        .end()

        .then(function () {
          return FunctionalHelpers.fillOutResetPassword(self, email);
        })

        .findById('fxa-confirm-reset-password-header')
        .end()

        .then(function () {
          return FunctionalHelpers.openPasswordResetLinkDifferentBrowser(
                      client, email, PASSWORD);
        })

        // user verified in a new browser, they have to enter
        // their updated credentials in the original tab.
        .findByCssSelector('#fxa-signin-header')
        .end()

        .then(FunctionalHelpers.visibleByQSA('.success'))
        .end()

        .findByCssSelector('#password')
          .type(PASSWORD)
        .end()

        .findByCssSelector('button[type=submit]')
          .click()
        .end()

        // user is redirected to RP
        .findByCssSelector('#loggedin')
        .end();
    },

    'reset password, verify in a different browser, from the new browser\'s P.O.V.': function () {
      var self = this;

      return FunctionalHelpers.openFxaFromRp(self, 'signin')
        .findByCssSelector('a[href="/reset_password"]')
          .click()
        .end()

        .findById('fxa-reset-password-header')
        .end()

        .then(function () {
          return FunctionalHelpers.fillOutResetPassword(self, email);
        })

        .findById('fxa-confirm-reset-password-header')
        .then(function () {
          // clear all browser state, simulate opening in a new
          // browser
          return FunctionalHelpers.clearBrowserState(self, {
            '123done': true,
            contentServer: true
          });
        })
        .then(function () {
          return FunctionalHelpers.getVerificationLink(email, 0);
        })
        .then(function (verificationLink) {
          return self.remote.get(require.toUrl(verificationLink));
        })
        .end()

        .findById('fxa-complete-reset-password-header')
        .end()

        .then(function () {
          return FunctionalHelpers.fillOutCompleteResetPassword(self, PASSWORD, PASSWORD);
        })

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
    }

  });

});
