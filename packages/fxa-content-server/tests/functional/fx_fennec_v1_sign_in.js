/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/node_modules/dojo/node!xmlhttprequest',
  'app/bower_components/fxa-js-client/fxa-client',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, nodeXMLHttpRequest, FxaClient,
  TestHelpers, FunctionalHelpers) {
  var config = intern.config;
  var PAGE_URL = config.fxaContentRoot + 'signin?context=fx_fennec_v1&service=sync';

  var AUTH_SERVER_ROOT = config.fxaAuthRoot;

  var client;
  var email;
  var PASSWORD = '12345678';

  var listenForFxaCommands = FunctionalHelpers.listenForWebChannelMessage;
  var respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;

  function createUser(isPreVerified) {
    email = TestHelpers.createEmail();
    return client.signUp(email, PASSWORD,
      {
        preVerified: isPreVerified || false
      }
    );
  }

  registerSuite({
    name: 'Fx Fennec Sync v1 sign_in',

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

    'sign in verified': function () {
      var self = this;
      return createUser(true)
        .then(function () {
          return FunctionalHelpers.openPage(self, PAGE_URL, '#fxa-signin-header')
            .execute(listenForFxaCommands)
            .then(respondToWebChannelMessage(self, 'fxaccounts:can_link_account', { ok: true } ))

            .then(function () {
              return FunctionalHelpers.fillOutSignIn(self, email, PASSWORD);
            })

            .findByCssSelector('#fxa-sign-in-complete-header')
            .end()

            // browser should have been notified.
            .then(FunctionalHelpers.testIsBrowserNotified(self, 'fxaccounts:can_link_account'))
            .then(FunctionalHelpers.testIsBrowserNotified(self, 'fxaccounts:login'))
            .then(FunctionalHelpers.noSuchBrowserNotification(self, 'fxaccounts:sync_preferences'))

            // user should be able to click on a sync preferences button.
            .findByCssSelector('#sync-preferences')
              // user wants to open sync preferences.
              .click()
            .end()

            // browser is notified of desire to open Sync preferences
            .then(FunctionalHelpers.testIsBrowserNotified(self, 'fxaccounts:sync_preferences'));

        });
    },

    'sign in unverified': function () {
      var self = this;

      return createUser(false)
        .then(function () {
          return FunctionalHelpers.openPage(self, PAGE_URL, '#fxa-signin-header')
            .execute(listenForFxaCommands)
            .then(respondToWebChannelMessage(self, 'fxaccounts:can_link_account', { ok: true } ))

            .then(function () {
              return FunctionalHelpers.fillOutSignIn(self, email, PASSWORD);
            })

            .findByCssSelector('#fxa-confirm-header')
            .end()

            .then(FunctionalHelpers.testIsBrowserNotified(self, 'fxaccounts:can_link_account'))
            .then(FunctionalHelpers.testIsBrowserNotified(self, 'fxaccounts:login'));
        });
    }
  });
});
