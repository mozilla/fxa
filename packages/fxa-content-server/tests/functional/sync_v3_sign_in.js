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
  var PAGE_URL = config.fxaContentRoot + 'signin?context=fx_desktop_v3&service=sync&forceAboutAccounts=true';

  var email;
  var PASSWORD = '12345678';

  var thenify = FunctionalHelpers.thenify;

  var clearBrowserState = thenify(FunctionalHelpers.clearBrowserState);
  var click = FunctionalHelpers.click;
  var createUser = FunctionalHelpers.createUser;
  var fillOutSignIn = thenify(FunctionalHelpers.fillOutSignIn);
  var noEmailExpected = FunctionalHelpers.noEmailExpected;
  var noPageTransition = FunctionalHelpers.noPageTransition;
  var noSuchBrowserNotification = FunctionalHelpers.noSuchBrowserNotification;
  var openPage = thenify(FunctionalHelpers.openPage);
  var openVerificationLinkDifferentBrowser = thenify(FunctionalHelpers.openVerificationLinkDifferentBrowser);
  var openVerificationLinkInNewTab = thenify(FunctionalHelpers.openVerificationLinkInNewTab);
  var respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testEmailExpected = FunctionalHelpers.testEmailExpected;
  var testIsBrowserNotified = FunctionalHelpers.testIsBrowserNotified;
  var visibleByQSA = FunctionalHelpers.visibleByQSA;

  var setupTest = thenify(function (context, isUserVerified) {
    return this.parent
      .then(clearBrowserState(context, { force: true }))
      .then(createUser(email, PASSWORD, { preVerified: isUserVerified }))
      .then(openPage(context, PAGE_URL, '#fxa-signin-header'))
      .then(respondToWebChannelMessage(context, 'fxaccounts:can_link_account', { ok: true } ))
      .then(fillOutSignIn(context, email, PASSWORD))

      .then(testIsBrowserNotified(context, 'fxaccounts:can_link_account'))
      .then(testIsBrowserNotified(context, 'fxaccounts:login'))

      // Sync users must always re-verify their email
      .then(testElementExists(isUserVerified ? '#fxa-confirm-signin-header' : '#fxa-confirm-header'));
  });

  registerSuite({
    name: 'Firefox Desktop Sync v3 sign_in',

    beforeEach: function () {
      email = TestHelpers.createEmail('sync{id}');

      return this.remote
        .then(clearBrowserState(this));
    },

    'verified, verify same browser': function () {
      return this.remote
        .then(setupTest(this, true))

        .then(openVerificationLinkInNewTab(this, email, 0))
        .switchToWindow('newwindow')
          .then(testElementExists('#fxa-sign-in-complete-header'))
          .then(noSuchBrowserNotification(this, 'fxaccounts:sync_preferences'))
          // user should be able to click on a sync preferences button.
          .then(click('#sync-preferences'))
          // browser is notified of desire to open Sync preferences
          .then(testIsBrowserNotified(this, 'fxaccounts:sync_preferences'))
          .closeCurrentWindow()
        .switchToWindow('')

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition('#fxa-confirm-signin-header'));
    },

    'verified, resend email, verify same browser': function () {
      return this.remote
        .then(setupTest(this, true))

        .then(click('#resend'))
        .then(visibleByQSA('.success'))

        // email 0 is the original signin email, open the resent email instead
        .then(openVerificationLinkInNewTab(this, email, 1))
        .switchToWindow('newwindow')
          .then(testElementExists('#fxa-sign-in-complete-header'))
          .closeCurrentWindow()
        .switchToWindow('')

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition('#fxa-confirm-signin-header'));
    },

    'verified, verify different browser - from original tab\'s P.O.V.': function () {
      return this.remote
        .then(setupTest(this, true))

        .then(openVerificationLinkDifferentBrowser(email))

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition('#fxa-confirm-signin-header'));
    },

    'unverified': function () {
      // this test does a lot of waiting around, give it a little extra time
      this.timeout = 60 * 1000;

      return this.remote
        .then(setupTest(this, false))

        // email 0 - initial sign up email
        // email 1 - sign in w/ unverified address email
        // email 2 - "You have verified your Firefox Account"

        // there was a problem with 2 emails being sent on signin,
        // ensure only one is sent. See #3890. Check for extra email
        // must be done before opening the verification link,
        // otherwise the "Account verified!" email is sent.

        // maxAttempts is set to avoid intererence from
        // the verification reminder emails. 5 attempts occur in 5 seconds,
        // the first verification reminder is set after 10 seconds.
        .then(noEmailExpected(email, 2, { maxAttempts: 5 }))
        .then(openVerificationLinkInNewTab(this, email, 1))
        .then(testEmailExpected(email, 2))

        .switchToWindow('newwindow')
          .then(testElementExists('#fxa-sign-up-complete-header'))
          .then(noSuchBrowserNotification(this, 'fxaccounts:sync_preferences'))
          // user should be able to click on a sync preferences button.
          .then(click('#sync-preferences'))
          // browser is notified of desire to open Sync preferences
          .then(testIsBrowserNotified(this, 'fxaccounts:sync_preferences'))
          .closeCurrentWindow()
        .switchToWindow('')

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition('#fxa-confirm-header'));
    }
  });
});
