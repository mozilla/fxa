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
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var PAGE_URL = config.fxaContentRoot + 'signin?context=iframe&service=sync';

  var email;
  var PASSWORD = '12345678';
  var client;

  var listenForFxaCommands = FunctionalHelpers.listenForWebChannelMessage;
  var respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;

  registerSuite({
    name: 'Firstrun sign_in',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      return client.signUp(email, PASSWORD, { preVerified: true });
    },

    afterEach: function () {
      return FunctionalHelpers.clearBrowserState(this);
    },

    'sign in with an already existing account': function () {
      var self = this;

      return FunctionalHelpers.openPage(this, PAGE_URL, '#fxa-signin-header')
        .execute(listenForFxaCommands)

        .then(respondToWebChannelMessage(self, 'fxaccounts:can_link_account', { ok: true } ))


        .then(function () {
          return FunctionalHelpers.fillOutSignIn(self, email, PASSWORD);
        })

        .then(FunctionalHelpers.testIsBrowserNotified(self, 'fxaccounts:can_link_account'))
        .then(FunctionalHelpers.testIsBrowserNotified(self, 'fxaccounts:login'))

        .findByCssSelector('#fxa-settings-header')
        .end()

        // user should be unable to sign out.
        .then(FunctionalHelpers.noSuchElement(self, '#signout'))
        .end();
    },

    'sign in, cancel merge warning': function () {
      var self = this;
      return FunctionalHelpers.openPage(this, PAGE_URL, '#fxa-signin-header')
        .execute(listenForFxaCommands)

        .then(respondToWebChannelMessage(self, 'fxaccounts:can_link_account', { ok: false } ))


        .then(function () {
          return FunctionalHelpers.fillOutSignIn(self, email, PASSWORD);
        })

        .then(FunctionalHelpers.testIsBrowserNotified(self, 'fxaccounts:can_link_account'))

        // user should not transition to the next screen
        .then(FunctionalHelpers.noSuchElement(self, '#fxa-settings-header'))
        .end();
    }
  });
});
