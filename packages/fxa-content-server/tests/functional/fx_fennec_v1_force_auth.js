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
], function (intern, registerSuite, nodeXMLHttpRequest, FxaClient, TestHelpers, FunctionalHelpers) {
  var config = intern.config;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var FORCE_AUTH_URL = config.fxaContentRoot + 'force_auth?context=fx_fennec_v1&service=sync';

  var PASSWORD = 'password';
  var email;
  var client;

  var listenForFxaCommands = FunctionalHelpers.listenForWebChannelMessage;
  var respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;

  registerSuite({
    name: 'Fx Fennec Sync v1 force_auth',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });
      var self = this;
      return client.signUp(email, PASSWORD, { preVerified: true })
        .then(function () {
          // clear localStorage to avoid polluting other tests.
          return FunctionalHelpers.clearBrowserState(self);
        });
    },

    'sign in via force-auth': function () {
      var self = this;
      var url = FORCE_AUTH_URL + '&email=' + encodeURIComponent(email);
      return FunctionalHelpers.openPage(self, url, '#fxa-force-auth-header')
        .execute(listenForFxaCommands)
        .then(respondToWebChannelMessage(self, 'fxaccounts:can_link_account', { ok: true } ))

        .then(function () {
          return FunctionalHelpers.fillOutForceAuth(self, PASSWORD);
        })

        .findById('fxa-force-auth-complete-header')
        .end()

        .then(FunctionalHelpers.testIsBrowserNotified(self, 'fxaccounts:can_link_account'))
        .then(FunctionalHelpers.testIsBrowserNotified(self, 'fxaccounts:login'))

        .then(FunctionalHelpers.noSuchBrowserNotification(self, 'fxaccounts:sync_preferences'))

        // user should be able to open sync preferences
        .findByCssSelector('#sync-preferences')
          // user wants to open sync preferences.
          .click()
        .end()

        // browser is notified of desire to open Sync preferences
        .then(FunctionalHelpers.testIsBrowserNotified(self, 'fxaccounts:sync_preferences'));
    }
  });
});
