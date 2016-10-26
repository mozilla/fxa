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
  var closeCurrentWindow = FunctionalHelpers.closeCurrentWindow;
  var createUser = FunctionalHelpers.createUser;
  var fillOutSignIn = thenify(FunctionalHelpers.fillOutSignIn);
  var fillOutSignInUnblock = FunctionalHelpers.fillOutSignInUnblock;
  var noEmailExpected = FunctionalHelpers.noEmailExpected;
  var noPageTransition = FunctionalHelpers.noPageTransition;
  var openPage = thenify(FunctionalHelpers.openPage);
  var openVerificationLinkDifferentBrowser = thenify(FunctionalHelpers.openVerificationLinkDifferentBrowser);
  var openVerificationLinkInNewTab = thenify(FunctionalHelpers.openVerificationLinkInNewTab);
  var respondToWebChannelMessage = FunctionalHelpers.respondToWebChannelMessage;
  var testElementExists = FunctionalHelpers.testElementExists;
  var testEmailExpected = FunctionalHelpers.testEmailExpected;
  var testIsBrowserNotified = FunctionalHelpers.testIsBrowserNotified;
  var visibleByQSA = FunctionalHelpers.visibleByQSA;

  var setupTest = thenify(function (options) {
    options = options || {};

    const successSelector = options.blocked ? '#fxa-signin-unblock-header' :
                            options.preVerified ? '#fxa-confirm-signin-header' :
                            '#fxa-confirm-header';

    return this.parent
      .then(clearBrowserState(this.parent, { force: true }))
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
      })

      .then(testElementExists(successSelector));
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
        .then(setupTest({ preVerified: true }))

        .then(openVerificationLinkInNewTab(this, email, 0))
        .switchToWindow('newwindow')
          .then(testElementExists('#fxa-sign-in-complete-header'))
          .then(closeCurrentWindow())

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition('#fxa-confirm-signin-header'));
    },

    'verified, resend email, verify same browser': function () {
      return this.remote
        .then(setupTest({ preVerified: true }))

        .then(click('#resend'))
        .then(visibleByQSA('.success'))

        // email 0 is the original signin email, open the resent email instead
        .then(openVerificationLinkInNewTab(this, email, 1))
        .switchToWindow('newwindow')
          .then(testElementExists('#fxa-sign-in-complete-header'))
          .then(closeCurrentWindow())

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition('#fxa-confirm-signin-header'));
    },

    'verified, verify different browser - from original tab\'s P.O.V.': function () {
      return this.remote
        .then(setupTest({ preVerified: true }))

        .then(openVerificationLinkDifferentBrowser(email))

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition('#fxa-confirm-signin-header'));
    },

    'unverified': function () {
      // this test does a lot of waiting around, give it a little extra time
      this.timeout = 60 * 1000;

      return this.remote
        .then(setupTest({ preVerified: false }))

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
          .then(closeCurrentWindow())

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition('#fxa-confirm-header'));
    },

    'verified, blocked': function () {
      email = TestHelpers.createEmail('blocked{id}');

      return this.remote
        .then(setupTest({ blocked: true, preVerified: true }))

        .then(fillOutSignInUnblock(email, 0))
        .then(testIsBrowserNotified(this, 'fxaccounts:login'))

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition('#fxa-signin-unblock-header'));
    }
  });
});
