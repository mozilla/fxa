/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/node_modules/dojo/node!xmlhttprequest',
  'app/bower_components/fxa-js-client/fxa-client',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/fx-desktop'
], function (intern, registerSuite, nodeXMLHttpRequest, FxaClient,
  TestHelpers, FunctionalHelpers, FxDesktopHelpers) {
  var config = intern.config;
  var PAGE_URL = config.fxaContentRoot + 'signin?context=fx_ios_v1&service=sync';

  var AUTH_SERVER_ROOT = config.fxaAuthRoot;

  var client;
  var email;
  var PASSWORD = '12345678';

  var listenForFxaCommands = FxDesktopHelpers.listenForFxaCommands;
  var testIsBrowserNotifiedOfLogin = FxDesktopHelpers.testIsBrowserNotifiedOfLogin;

  function createUser(isPreVerified) {
    email = TestHelpers.createEmail();
    return client.signUp(email, PASSWORD,
      {
        preVerified: isPreVerified || false
      }
    );
  }

  registerSuite({
    name: 'FxiOS v1 sign_in',

    beforeEach: function () {
      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });
      // clear localStorage to avoid pollution from other tests.
      return FunctionalHelpers.clearBrowserState(this);
    },

    afterEach: function () {
      return FunctionalHelpers.clearBrowserState(this);
    },

    'signup link is disabled': function () {
      var self = this;
      return createUser(true)
        .then(function () {
          return FunctionalHelpers.openPage(self, PAGE_URL, '#fxa-signin-header')
            .execute(listenForFxaCommands)

            .then(FunctionalHelpers.noSuchElement(self, 'a[href="/signup"]'));
        });
    },

    'signin with an unknown account does not allow the user to sign up': function () {
      var self = this;
      email = TestHelpers.createEmail();

      return FunctionalHelpers.openPage(self, PAGE_URL, '#fxa-signin-header')
        .execute(listenForFxaCommands)

        .then(function () {
          return FunctionalHelpers.fillOutSignIn(self, email, PASSWORD);
        })

        // an error is visible
        .then(FunctionalHelpers.visibleByQSA('.error'))

        // just not the signup link in the error
        .then(FunctionalHelpers.noSuchElement(self, '.error a[href="/signup"]'));
    },

    'sign in verified': function () {
      var self = this;
      return createUser(true)
        .then(function () {
          return FunctionalHelpers.openPage(self, PAGE_URL, '#fxa-signin-header')
            .execute(listenForFxaCommands)

            // signup link is disabled
            .then(FunctionalHelpers.noSuchElement(self, 'a[href="/signup"]'))

            .then(function () {
              return FunctionalHelpers.fillOutSignIn(self, email, PASSWORD);
            })

            .then(function () {
              return testIsBrowserNotifiedOfLogin(self, email, { checkVerified: true });
            });
        });
    },

    'unverified': function () {
      var self = this;

      return createUser(false)
        .then(function () {
          return FunctionalHelpers.openPage(self, PAGE_URL, '#fxa-signin-header')
            .execute(listenForFxaCommands)

            .then(function () {
              return FunctionalHelpers.fillOutSignIn(self, email, PASSWORD);
            })

            .findByCssSelector('#fxa-confirm-header')
            .end()

            .then(function () {
              return testIsBrowserNotifiedOfLogin(self, email);
            });
        });
    }
  });
});
