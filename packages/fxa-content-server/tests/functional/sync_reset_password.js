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
  var PAGE_URL = config.fxaContentRoot + 'reset_password?context=fx_desktop_v1&service=sync';

  var AUTH_SERVER_ROOT = config.fxaAuthRoot;

  var PASSWORD = 'password';
  var user;
  var email;
  var client;

  var listenForFxaCommands = FxDesktopHelpers.listenForFxaCommands;
  var testIsBrowserNotifiedOfLogin = FxDesktopHelpers.testIsBrowserNotifiedOfLogin;

  registerSuite({
    name: 'Firefox Desktop Sync reset password',

    beforeEach: function () {
      // timeout after 90 seconds
      this.timeout = 90000;

      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });
      email = TestHelpers.createEmail();
      user = TestHelpers.emailToUser(email);
      var self = this;

      return client.signUp(email, PASSWORD, { preVerified: true })
        .then(function (result) {
          // do nothing
        })
        .then(function () {
          // clear localStorage to avoid polluting other tests.
          return FunctionalHelpers.clearBrowserState(self);
        });
    },

    afterEach: function () {
      // clear localStorage to avoid polluting other tests.
      return FunctionalHelpers.clearBrowserState(this);
    },

    'sync reset password, verify same browser': function () {
      var self = this;

      // verify account
      return self.remote
        .get(require.toUrl(PAGE_URL))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .execute(listenForFxaCommands)

        .findByCssSelector('#fxa-reset-password-header')
        .end()

        .then(function () {
          return FunctionalHelpers.fillOutResetPassword(self, email);
        })

        .findByCssSelector('#fxa-confirm-reset-password-header')
        .end()

        .then(function () {
          return FunctionalHelpers.openVerificationLinkSameBrowser(
                self, email, 0);
        })
        .switchToWindow('newwindow')

        .findByCssSelector('#fxa-complete-reset-password-header')
        .end()

        .then(function () {
          return FunctionalHelpers.fillOutCompleteResetPassword(
                    self, PASSWORD, PASSWORD);
        })

        .findByCssSelector('#fxa-reset-password-complete-header')
        .end()

        .findByCssSelector('.account-ready-service')
        .getVisibleText()
        .then(function (text) {
          assert.ok(text.indexOf('Firefox Sync') > -1);
        })

        .end()

        .closeCurrentWindow()
        // switch to the original window
        .switchToWindow('')
        .end()

        .then(FunctionalHelpers.visibleByQSA('.success'))
        .end()

        .then(function () {
          return testIsBrowserNotifiedOfLogin(self, email, { checkVerified: true });
        });
    },

    'password reset, verify same browser with original tab closed': function () {
      var self = this;

      return self.remote
        .get(require.toUrl(PAGE_URL))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .execute(listenForFxaCommands)

        .then(function () {
          return FunctionalHelpers.fillOutResetPassword(self, email);
        })

        .findByCssSelector('#fxa-confirm-reset-password-header')
        .end()

        // user browses to another site.
        .then(FunctionalHelpers.openExternalSite(self))

        .then(function () {
          return FunctionalHelpers.openVerificationLinkSameBrowser(
                      self, email, 0);
        })

        .switchToWindow('newwindow')

        .then(function () {
          return FunctionalHelpers.fillOutCompleteResetPassword(
              self, PASSWORD, PASSWORD);
        })

        .findByCssSelector('#fxa-reset-password-complete-header')
        .end()

        .closeCurrentWindow()
        // switch to the original window
        .switchToWindow('')
        .end();
    },

    'password reset, verify same browser by replacing the original tab': function () {
      var self = this;

      return self.remote
        .get(require.toUrl(PAGE_URL))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .execute(listenForFxaCommands)

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

        .findByCssSelector('#fxa-reset-password-complete-header')
        .end();
    },

    'reset password, verify different browser - from original tab\'s P.O.V.': function () {
      var self = this;

      // verify account
      return self.remote
        .get(require.toUrl(PAGE_URL))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .execute(listenForFxaCommands)


        .findByCssSelector('#fxa-reset-password-header')
        .end()

        .then(function () {
          return FunctionalHelpers.fillOutResetPassword(self, email);
        })

        .findByCssSelector('#fxa-confirm-reset-password-header')
        .end()

        .then(function () {
          return FunctionalHelpers.openPasswordResetLinkDifferentBrowser(
                      client, email, PASSWORD);
        })

        // for an unknown reason, it sometimes takes an exceptionally
        // long time to transition to the new screen.

        .findByCssSelector('#fxa-signin-header')
        .end()

        // user verified in a new browser, they have to enter
        // their updated credentials in the original tab.
        .then(FunctionalHelpers.visibleByQSA('.success'))
        .end()

        .findByCssSelector('#password')
          .type(PASSWORD)
        .end()

        .findByCssSelector('button[type=submit]')
          .click()
        .end()

        .then(function () {
          return testIsBrowserNotifiedOfLogin(self, email, { checkVerified: true });
        });
    },

    'reset password, verify different browser - from new browser\'s P.O.V.': function () {

      var self = this;

      // verify account
      return self.remote
        .get(require.toUrl(PAGE_URL))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .execute(listenForFxaCommands)


        .findByCssSelector('#fxa-reset-password-header')
        .end()

        .then(function () {
          return FunctionalHelpers.fillOutResetPassword(self, email);
        })

        .findByCssSelector('#fxa-confirm-reset-password-header')
        .then(function () {
          // clear all browser state, simulate opening in a new
          // browser
          return FunctionalHelpers.clearBrowserState(self);
        })
        .then(function () {
          return FunctionalHelpers.getVerificationLink(user, 0);
        })
        .then(function (url) {
          return self.remote.get(require.toUrl(url));
        })
        .end()

        .findByCssSelector('#fxa-complete-reset-password-header')
        .end()

        .then(function () {
          return FunctionalHelpers.fillOutCompleteResetPassword(
                    self, PASSWORD, PASSWORD);
        })

        .findByCssSelector('#fxa-reset-password-complete-header')
        .end()

        .findByCssSelector('.account-ready-service')
        .getVisibleText()
        .then(function (text) {
          assert.ok(text.indexOf('Firefox Sync') > -1);
        })

        .end();
    }
  });

});
