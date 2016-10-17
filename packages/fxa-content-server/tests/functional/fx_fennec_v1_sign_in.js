/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, TestHelpers, FunctionalHelpers) {
  var config = intern.config;
  var PAGE_URL = config.fxaContentRoot + 'signin?context=fx_fennec_v1&service=sync';

  var email;
  var PASSWORD = '12345678';

  var thenify = FunctionalHelpers.thenify;

  var clearBrowserState = thenify(FunctionalHelpers.clearBrowserState);
  var click = FunctionalHelpers.click;
  var closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
  var createUser = FunctionalHelpers.createUser;
  var fillOutSignIn = thenify(FunctionalHelpers.fillOutSignIn);
  var fillOutSignInUnblock = FunctionalHelpers.fillOutSignInUnblock;
  var noSuchBrowserNotification = FunctionalHelpers.noSuchBrowserNotification;
  var openPage = thenify(FunctionalHelpers.openPage);
  var openVerificationLinkDifferentBrowser = thenify(FunctionalHelpers.openVerificationLinkDifferentBrowser);
  var openVerificationLinkInNewTab = thenify(FunctionalHelpers.openVerificationLinkInNewTab);
  var respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testElementTextInclude = FunctionalHelpers.testElementTextInclude;
  var testIsBrowserNotified = FunctionalHelpers.testIsBrowserNotified;

  var setupTest = thenify(function (options) {
    options = options || {};

    return this.parent
      .then(clearBrowserState(this.parent))
      .then(createUser(email, PASSWORD, { preVerified: options.preVerified }))
      .then(openPage(this.parent, PAGE_URL, '#fxa-signin-header'))
      .then(respondToWebChannelMessage(this.parent, 'fxaccounts:can_link_account', { ok: true } ))
      .then(fillOutSignIn(this.parent, email, PASSWORD))
      .then(testIsBrowserNotified(this.parent, 'fxaccounts:can_link_account'))
      .then(() => {
        if (! options.blocked) {
          return this.parent
            .then(testIsBrowserNotified(this.parent, 'fxaccounts:login'));
        }
      });
  });

  registerSuite({
    name: 'Fx Fennec Sync v1 sign_in',

    beforeEach: function () {
      email = TestHelpers.createEmail('sync{id}');
    },

    'verified, verify same browser': function () {
      return this.remote
        .then(setupTest({ preVerified: true }))

        .then(testElementExists('#fxa-confirm-signin-header'))

        .then(openVerificationLinkInNewTab(this, email, 0))
        .switchToWindow('newwindow')
          .then(testElementExists('#fxa-sign-in-complete-header'))
          .then(noSuchBrowserNotification(this, 'fxaccounts:sync_preferences'))
          // user wants to open sync preferences.
          .then(click('#sync-preferences'))

          // browser is notified of desire to open Sync preferences
          .then(testIsBrowserNotified(this, 'fxaccounts:sync_preferences'))
          .then(closeCurrentWindow())

        .then(testElementExists('#fxa-sign-in-complete-header'))

        .then(noSuchBrowserNotification(this, 'fxaccounts:sync_preferences'))
        // user wants to open sync preferences.
        .then(click('#sync-preferences'))

        // browser is notified of desire to open Sync preferences
        .then(testIsBrowserNotified(this, 'fxaccounts:sync_preferences'));
    },

    'verified, verify different browser - from original tab\'s P.O.V.': function () {
      return this.remote
        .then(setupTest({ preVerified: true }))

        .then(openVerificationLinkDifferentBrowser(email))

        .then(testElementExists('#fxa-sign-in-complete-header'));
    },

    'unverified': function () {
      return this.remote
        .then(setupTest({ preVerified: false }))

        .then(testElementExists('#fxa-confirm-header'))
        .then(testIsBrowserNotified(this, 'fxaccounts:can_link_account'))
        .then(testIsBrowserNotified(this, 'fxaccounts:login'))

        // email 0 - initial sign up email
        // email 1 - sign in w/ unverified address email
        // email 2 - "You have verified your Firefox Account"
        .then(openVerificationLinkInNewTab(this, email, 1))
        .switchToWindow('newwindow')
          .then(testElementExists('#fxa-sign-up-complete-header'))
          .then(closeCurrentWindow())

        .then(testElementExists('#fxa-sign-up-complete-header'));
    },

    'blocked, valid code entered': function () {
      email = TestHelpers.createEmail('block{id}');

      return this.remote
        .then(setupTest({ blocked: true, preVerified: true }))

        .then(testElementExists('#fxa-signin-unblock-header'))
        .then(testElementTextInclude('.verification-email-message', email))
        .then(fillOutSignInUnblock(email, 0))

        .then(testIsBrowserNotified(this, 'fxaccounts:login'))
        .then(testElementExists('#fxa-sign-in-complete-header'));
    }
  });
});
