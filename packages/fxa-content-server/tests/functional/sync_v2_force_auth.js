/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'app/bower_components/fxa-js-client/fxa-client',
  'intern',
  'intern!object',
  'intern/node_modules/dojo/node!xmlhttprequest',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (FxaClient, intern, registerSuite, nodeXMLHttpRequest,
  TestHelpers, FunctionalHelpers) {
  var config = intern.config;

  var AUTH_SERVER_ROOT = config.fxaAuthRoot;
  var FORCE_AUTH_URL = config.fxaContentRoot + 'force_auth?context=fx_desktop_v2&service=sync';

  var client;
  var email;
  var PASSWORD = '12345678';
  var url;

  var noSuchBrowserNotification = FunctionalHelpers.noSuchBrowserNotification;
  var respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;
  var testIsBrowserNotified = FunctionalHelpers.testIsBrowserNotified;

  registerSuite({
    name: 'Firefox Desktop Sync v2 force_auth',

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
            .then(noSuchBrowserNotification(self, 'fxaccounts:logout'))

            .then(respondToWebChannelMessage(self, 'fxaccounts:can_link_account', { ok: true } ))

            .then(function () {
              return FunctionalHelpers.fillOutForceAuth(self, PASSWORD);
            })

            // add a slight delay to ensure the page does not transition
            .sleep(2000)

            // the page does not transition.
            .findByCssSelector('#fxa-force-auth-header')
            .end()

            .then(testIsBrowserNotified(self, 'fxaccounts:can_link_account'))
            .then(testIsBrowserNotified(self, 'fxaccounts:login'));
        });
    }
  });
});
