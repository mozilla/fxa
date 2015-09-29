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
], function (intern, registerSuite, nodeXMLHttpRequest, FxaClient, TestHelpers, FunctionalHelpers, FxDesktopHelpers) {
  var config = intern.config;
  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var FORCE_AUTH_URL = config.fxaContentRoot + 'force_auth?context=fx_desktop_v1&service=sync';

  var PASSWORD = 'password';
  var email;
  var client;
  var url;

  var listenForFxaCommands = FxDesktopHelpers.listenForFxaCommands;
  registerSuite({
    name: 'Firefox Desktop Sync force_auth',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      url = FORCE_AUTH_URL + '&email=' + encodeURIComponent(email);

      client = new FxaClient(AUTH_SERVER_ROOT, {
        xhr: nodeXMLHttpRequest.XMLHttpRequest
      });

      return FunctionalHelpers.clearBrowserState(this);
    },

    'verified': function () {
      var self = this;
      return client.signUp(email, PASSWORD, { preVerified: true })
        .then(function () {
          return FunctionalHelpers.openPage(self, url, '#fxa-force-auth-header')
            .execute(listenForFxaCommands)

            .then(function () {
              return FunctionalHelpers.fillOutForceAuth(self, PASSWORD);
            })

            // add a slight delay to ensure the page does not transition
            .sleep(1000)

            // the page does not transition.
            .findByCssSelector('#fxa-force-auth-header')
            .end()

            .then(function () {
              return FxDesktopHelpers.testIsBrowserNotifiedOfMessage(
                          self, 'can_link_account');
            })
            .then(function () {
              return FxDesktopHelpers.testIsBrowserNotifiedOfMessage(
                          self, 'login');
            });
        });
    },

    'unverified': function () {
      var self = this;

      return client.signUp(email, PASSWORD, { preVerified: false})
        .then(function () {
          return FunctionalHelpers.openPage(self, url, '#fxa-force-auth-header')
            .execute(listenForFxaCommands)

            .then(function () {
              return FunctionalHelpers.fillOutForceAuth(self, PASSWORD);
            })

            .findByCssSelector('#fxa-confirm-header')
            .end()

            .then(function () {
              return FxDesktopHelpers.testIsBrowserNotifiedOfMessage(
                          self, 'can_link_account');
            })
            .then(function () {
              return FxDesktopHelpers.testIsBrowserNotifiedOfMessage(
                          self, 'login');
            });
        });
    }
  });
});
