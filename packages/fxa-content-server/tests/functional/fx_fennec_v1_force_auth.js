/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (registerSuite, TestHelpers, FunctionalHelpers) {
  var thenify = FunctionalHelpers.thenify;

  var clearBrowserState = thenify(FunctionalHelpers.clearBrowserState);
  var click = FunctionalHelpers.click;
  var createUser = FunctionalHelpers.createUser;
  var fillOutForceAuth = FunctionalHelpers.fillOutForceAuth;
  var noSuchBrowserNotification = FunctionalHelpers.noSuchBrowserNotification;
  var openForceAuth = FunctionalHelpers.openForceAuth;
  var respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testIsBrowserNotified = FunctionalHelpers.testIsBrowserNotified;

  var PASSWORD = 'password';
  var email;

  registerSuite({
    name: 'Fx Fennec Sync v1 force_auth',

    beforeEach: function () {
      email = TestHelpers.createEmail();
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(clearBrowserState(this));
    },

    'sign in via force-auth': function () {
      return this.remote
        .then(openForceAuth({ query: {
          context: 'fx_fennec_v1',
          email: email,
          service: 'sync'
        }}))
        .then(respondToWebChannelMessage(this, 'fxaccounts:can_link_account', { ok: true } ))
        .then(fillOutForceAuth(PASSWORD))

        .then(testElementExists('#fxa-force-auth-complete-header'))
        .then(testIsBrowserNotified(this, 'fxaccounts:can_link_account'))
        .then(testIsBrowserNotified(this, 'fxaccounts:login'))
        .then(noSuchBrowserNotification(this, 'fxaccounts:sync_preferences'))
        // user wants to open sync preferences.
        .then(click('#sync-preferences'))

        // browser is notified of desire to open Sync preferences
        .then(testIsBrowserNotified(this, 'fxaccounts:sync_preferences'));
    }
  });
});
