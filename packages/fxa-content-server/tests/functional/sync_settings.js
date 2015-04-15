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
  'app/scripts/lib/constants',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/fx-desktop'
], function (intern, registerSuite, assert, require, nodeXMLHttpRequest,
      FxaClient, Constants, TestHelpers, FunctionalHelpers, FxDesktopHelpers) {
  'use strict';

  var listenForFxaCommands = FxDesktopHelpers.listenForFxaCommands;
  var testIsBrowserNotifiedOfLogin = FxDesktopHelpers.testIsBrowserNotifiedOfLogin;
  var testIsBrowserNotifiedOfMessage = FxDesktopHelpers.testIsBrowserNotifiedOfMessage;

  var clearBrowserState = FunctionalHelpers.clearBrowserState;
  var fillOutSignIn = FunctionalHelpers.fillOutSignIn;
  var fillOutChangePassword = FunctionalHelpers.fillOutChangePassword;
  var fillOutDeleteAccount = FunctionalHelpers.fillOutDeleteAccount;

  var config = intern.config;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var SIGNIN_URL = config.fxaContentRoot + 'signin?context=fx_desktop_v1&service=sync';
  var SETTINGS_URL = config.fxaContentRoot + 'settings?context=fx_desktop_v1&service=sync';

  var FIRST_PASSWORD = 'password';
  var SECOND_PASSWORD = 'new_password';
  var email;
  var client;


  registerSuite({
    name: 'Firefox Desktop Sync sign_in',

    beforeEach: function () {
      email = TestHelpers.createEmail();

      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      var self = this;
      return client.signUp(email, FIRST_PASSWORD, { preVerified: true })
        .then(function () {
          return clearBrowserState(self);
        })
        .then(function () {
          return self.get('remote')
            .get(require.toUrl(SIGNIN_URL))
            .setFindTimeout(intern.config.pageLoadTimeout)

            .execute(listenForFxaCommands)

            .then(function () {
              return fillOutSignIn(self, email, FIRST_PASSWORD);
            })

            .then(function () {
              return testIsBrowserNotifiedOfLogin(self, email, { checkVerified: true });
            })

            .get(require.toUrl(SETTINGS_URL))
            .setFindTimeout(intern.config.pageLoadTimeout)
            .execute(listenForFxaCommands);
        });
    },

    teardown: function () {
      return clearBrowserState(this);
    },

    'sign in, change the password': function () {
      var self = this;

      return this.get('remote')

        .findByCssSelector('#change-password')
          .click()
        .end()

        .findByCssSelector('#fxa-change-password-header')
        .end()

        .then(function () {
          return fillOutChangePassword(self, FIRST_PASSWORD, SECOND_PASSWORD);
        })

        .then(function () {
          return testIsBrowserNotifiedOfMessage(self, 'change_password');
        });
    },

    'sign in, delete the account': function () {
      var self = this;

      return this.get('remote')

        .findByCssSelector('#delete-account')
          .click()
        .end()

        .findByCssSelector('#fxa-delete-account-header')
        .end()

        .then(function () {
          return fillOutDeleteAccount(self, FIRST_PASSWORD);
        })

        .then(function () {
          return testIsBrowserNotifiedOfMessage(self, 'delete_account');
        });
    }
  });
});
