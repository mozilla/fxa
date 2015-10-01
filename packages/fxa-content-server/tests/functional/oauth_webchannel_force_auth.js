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
  'tests/functional/lib/webchannel-helpers'
], function (intern, registerSuite, nodeXMLHttpRequest, FxaClient, TestHelpers,
  FunctionalHelpers, WebChannelHelpers) {
  var config = intern.config;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;

  var PASSWORD = 'password';
  var email;
  var client;

  var testIsBrowserNotifiedOfLogin = WebChannelHelpers.testIsBrowserNotifiedOfLogin;
  var openFxaFromRp = WebChannelHelpers.openFxaFromRp;

  registerSuite({
    name: 'oauth webchannel force_auth',
    beforeEach: function () {
      email = TestHelpers.createEmail();

      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      return FunctionalHelpers.clearBrowserState(this);
    },

    'verified': function () {
      var self = this;
      return client.signUp(email, PASSWORD, { preVerified: true })
        .then(function () {
          return openFxaFromRp(self, 'force_auth', { email: email })
            .execute(FunctionalHelpers.listenForWebChannelMessage)

            .then(function () {
              return FunctionalHelpers.fillOutForceAuth(self, PASSWORD);
            })

            // the page does not transition, loop will close the screen
            .findByCssSelector('#fxa-force-auth-header')
            .end()

            .then(testIsBrowserNotifiedOfLogin(self, { shouldCloseTab: true }));
        });
    },

    'unverified': function () {
      var self = this;

      return client.signUp(email, PASSWORD, { preVerified: false})
        .then(function () {
          return openFxaFromRp(self, 'force_auth', { email: email })
            .then(function () {
              return FunctionalHelpers.fillOutForceAuth(self, PASSWORD);
            })

            .findByCssSelector('#fxa-confirm-header')
            .end();
        });
    }
  });
});
