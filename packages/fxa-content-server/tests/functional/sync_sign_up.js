/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'intern/node_modules/dojo/node!xmlhttprequest',
  'intern/node_modules/dojo/node!leadfoot/helpers/pollUntil',
  'app/bower_components/fxa-js-client/fxa-client',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/fx-desktop'
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest,
        pollUntil, FxaClient, TestHelpers, FunctionalHelpers, FxDesktopHelpers) {
  'use strict';

  var config = intern.config;
  var PAGE_URL = config.fxaContentRoot + 'signup?context=fx_desktop_v1&service=sync';

  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var TOO_YOUNG_YEAR = new Date().getFullYear() - 13;

  var client;
  var email;
  var PASSWORD = '12345678';

  var listenForFxaCommands = FxDesktopHelpers.listenForFxaCommands;
  var testIsBrowserNotifiedOfLogin = FxDesktopHelpers.testIsBrowserNotifiedOfLogin;

  registerSuite({
    name: 'Firefox Desktop Sync sign_up',

    beforeEach: function () {
      email = TestHelpers.createEmail();

      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      return FunctionalHelpers.clearBrowserState(this);
    },

    teardown: function () {
      return FunctionalHelpers.clearBrowserState(this);
    },

    'sign up & verify same browser': function () {

      var self = this;

      return this.get('remote')
        .get(require.toUrl(PAGE_URL))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .execute(listenForFxaCommands)

        .findByCssSelector('#fxa-signup-header')
        .end()

        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD, TOO_YOUNG_YEAR - 1);
        })

        .findByCssSelector('#fxa-confirm-header')

        .then(function () {
          return testIsBrowserNotifiedOfLogin(self);
        })

        .end()

        // verify the user
        .then(function () {
          return FunctionalHelpers.openVerificationLinkSameBrowser(
                self, email, 0);
        })
        .switchToWindow('newwindow')

        // user should be redirected to "Success!" screen.
        // In real life, the original browser window would show
        // a "welcome to sync!" screen that has a manage button
        // on it, and this screen should show the FxA success screen.
        .findById('fxa-sign-up-complete-header')
        .end()

        .findByCssSelector('.account-ready-service')
        .getVisibleText()
        .then(function (text) {
          assert.ok(text.indexOf('Firefox Sync') > -1);
        })

        .end()
        .closeCurrentWindow()

        // switch to the original window, it should not transition.
        .switchToWindow('')
        .end()

        .findByCssSelector('#fxa-confirm-header')
        .end();
    },

    'signup, verify different browser - from original tab\'s P.O.V.': function () {
      var self = this;

      return this.get('remote')
        .get(require.toUrl(PAGE_URL))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .execute(listenForFxaCommands)

        .findByCssSelector('#fxa-signup-header')
        .end()

        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD, TOO_YOUNG_YEAR - 1);
        })

        .findByCssSelector('#fxa-confirm-header')

        .then(function () {
          return testIsBrowserNotifiedOfLogin(self);
        })

        .end()

        .then(function () {
          return FunctionalHelpers.openVerificationLinkDifferentBrowser(client, email);
        })

        // The original tab should not transition
        .findByCssSelector('#fxa-confirm-header')
        .end();
    },

    'signup, verify different browser - from new browser\'s P.O.V.': function () {
      var self = this;

      return this.get('remote')
        .get(require.toUrl(PAGE_URL))
        .setFindTimeout(intern.config.pageLoadTimeout)
        .execute(listenForFxaCommands)

        .findByCssSelector('#fxa-signup-header')
        .end()

        .then(function () {
          return FunctionalHelpers.fillOutSignUp(self, email, PASSWORD, TOO_YOUNG_YEAR - 1);
        })


        .findByCssSelector('#fxa-confirm-header')

        .then(function () {
          return testIsBrowserNotifiedOfLogin(self);
        })
        .end()

        // clear local/sessionStorage to synthesize continuing in
        // a separate browser.
        .then(function () {
          return FunctionalHelpers.clearBrowserState(self);
        })

        // verify the user
        .then(function () {
          return FunctionalHelpers.getVerificationLink(email, 0);
        })
        .then(function (link) {
          return self.get('remote').get(link);
        })

        // user should be redirected to "Success!" screen
        .findById('fxa-sign-up-complete-header')
        .end()

        .findByCssSelector('.account-ready-service')
        .getVisibleText()
        .then(function (text) {
          assert.ok(text.indexOf('Firefox Sync') > -1);
        })

        .end();
    },

    'choose option to customize sync': function () {
      var self = this;
      return this.get('remote')
        .get(require.toUrl(PAGE_URL))
        .execute(listenForFxaCommands)

        .findByCssSelector('#fxa-signup-header')
        .end()
        .then(function () {
          return FunctionalHelpers.fillOutSignUp(
              self, email, PASSWORD, TOO_YOUNG_YEAR - 1, true);
        })

        .then(function () {
          return testIsBrowserNotifiedOfLogin(self);
        })

        // Being pushed to the confirmation screen is success.
        .findById('fxa-confirm-header')
        .end();
    }
  });
});
