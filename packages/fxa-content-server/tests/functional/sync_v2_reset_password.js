/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'intern/node_modules/dojo/promise',
  'intern/node_modules/dojo/node!xmlhttprequest',
  'app/bower_components/fxa-js-client/fxa-client',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, Promise, nodeXMLHttpRequest,
        FxaClient, TestHelpers, FunctionalHelpers) {
  var config = intern.config;

  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var PASSWORD = 'password';
  var RESET_PASSWORD_URL = config.fxaContentRoot + 'reset_password?context=fx_desktop_v2&service=sync';

  var client;
  var email;

  var noSuchBrowserNotification = FunctionalHelpers.noSuchBrowserNotification;
  var openPage = FunctionalHelpers.openPage;
  var testIsBrowserNotified = FunctionalHelpers.testIsBrowserNotified;

  registerSuite({
    name: 'Firefox Desktop Sync v2 reset password',

    beforeEach: function () {
      // timeout after 90 seconds
      this.timeout = 90000;

      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });
      email = TestHelpers.createEmail();

      return Promise.all([
        client.signUp(email, PASSWORD, { preVerified: true }),
        FunctionalHelpers.clearBrowserState(this)
      ]);
    },

    teardown: function () {
      // clear localStorage to avoid polluting other tests.
      return FunctionalHelpers.clearBrowserState(this);
    },

    'reset password, verify same browser': function () {
      var self = this;

      return openPage(self, RESET_PASSWORD_URL, '#fxa-reset-password-header')

        .then(function () {
          return FunctionalHelpers.fillOutResetPassword(self, email);
        })

        .findByCssSelector('#fxa-confirm-reset-password-header')
        .end()

        .then(function () {
          return FunctionalHelpers.openVerificationLinkInNewTab(
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

        // the verification tab sends the WebChannel message. This fixes
        // two problems: 1) initiating tab is closed, 2) The initiating
        // tab when running in E10s does not have all the necessary data
        // because localStorage is not shared.
        .then(testIsBrowserNotified(self, 'fxaccounts:login'))

        .closeCurrentWindow()
        // switch to the original window
        .switchToWindow('')
        .end()

        .then(FunctionalHelpers.testSuccessWasShown(self))
        .then(noSuchBrowserNotification(self, 'fxaccounts:login'));
    }
  });

});
