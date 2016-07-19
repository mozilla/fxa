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
  var openVerificationLinkDifferentBrowser = thenify(FunctionalHelpers.openVerificationLinkDifferentBrowser);
  var openVerificationLinkInNewTab = thenify(FunctionalHelpers.openVerificationLinkInNewTab);
  var respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testIsBrowserNotified = FunctionalHelpers.testIsBrowserNotified;

  var PASSWORD = 'password';
  var email;

  var setupTest = thenify(function (context, preVerified) {
    return this.parent
      .then(clearBrowserState(context))
      .then(createUser(email, PASSWORD, { preVerified: preVerified }))
      .then(openForceAuth({ query: {
        context: 'fx_fennec_v1',
        email: email,
        service: 'sync'
      }}))
      .then(respondToWebChannelMessage(context, 'fxaccounts:can_link_account', { ok: true } ))
      .then(fillOutForceAuth(PASSWORD))

      .then(testElementExists(preVerified ? '#fxa-confirm-signin-header' : '#fxa-confirm-header'))
      .then(testIsBrowserNotified(context, 'fxaccounts:can_link_account'))
      .then(testIsBrowserNotified(context, 'fxaccounts:login'));
  });

  registerSuite({
    name: 'Fx Fennec Sync v1 force_auth',

    beforeEach: function () {
      email = TestHelpers.createEmail('sync{id}');
    },

    'verified, verify same browser': function () {
      return this.remote
        .then(setupTest(this, true))

        .then(openVerificationLinkInNewTab(this, email, 0))
        .switchToWindow('newwindow')
          .then(testElementExists('#fxa-sign-in-complete-header'))
          .then(noSuchBrowserNotification(this, 'fxaccounts:sync_preferences'))
          // user wants to open sync preferences.
          .then(click('#sync-preferences'))

          // browser is notified of desire to open Sync preferences
          .then(testIsBrowserNotified(this, 'fxaccounts:sync_preferences'))
          .closeCurrentWindow()
        .switchToWindow('')

        .then(testElementExists('#fxa-sign-in-complete-header'))

        .then(noSuchBrowserNotification(this, 'fxaccounts:sync_preferences'))
        // user wants to open sync preferences.
        .then(click('#sync-preferences'))

        // browser is notified of desire to open Sync preferences
        .then(testIsBrowserNotified(this, 'fxaccounts:sync_preferences'));
    },

    'verified, verify different browser - from original tab\'s P.O.V.': function () {
      return this.remote
        .then(setupTest(this, true))

        .then(openVerificationLinkDifferentBrowser(email))

        .then(testElementExists('#fxa-sign-in-complete-header'));
    },

    'unverified': function () {
      return this.remote
        .then(setupTest(this, false));
    }
  });
});
