/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (registerSuite, TestHelpers, FunctionalHelpers) {
  var email;
  var PASSWORD = '12345678';

  var createUser = FunctionalHelpers.createUser;
  var fillOutForceAuth = FunctionalHelpers.fillOutForceAuth;
  var noSuchBrowserNotification = FunctionalHelpers.noSuchBrowserNotification;
  var openForceAuth = FunctionalHelpers.openForceAuth;
  var respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testIsBrowserNotified = FunctionalHelpers.testIsBrowserNotified;

  registerSuite({
    name: 'Firefox Desktop Sync v2 force_auth',

    beforeEach: function () {
      email = TestHelpers.createEmail();

      return FunctionalHelpers.clearBrowserState(this);
    },

    'verified': function () {
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(openForceAuth({ query: {
          context: 'fx_desktop_v2',
          email: email,
          service: 'sync'
        }}))
        .then(noSuchBrowserNotification(this, 'fxaccounts:logout'))
        .then(respondToWebChannelMessage(this, 'fxaccounts:can_link_account', { ok: true } ))
        .then(fillOutForceAuth(PASSWORD))

        // add a slight delay to ensure the page does not transition
        .sleep(2000)

        // the page does not transition.
        .then(testElementExists('#fxa-force-auth-header'))
        .then(testIsBrowserNotified(this, 'fxaccounts:can_link_account'))
        .then(testIsBrowserNotified(this, 'fxaccounts:login'));
    }
  });
});
