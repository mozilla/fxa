/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/selectors',
  'tests/functional/lib/ua-strings',
], function (intern, registerSuite, TestHelpers, FunctionalHelpers, selectors, uaStrings) {
  'use strict';

  const config = intern.config;
  const PAGE_URL = `${config.fxaContentRoot}signin?context=fx_desktop_v3&service=sync&forceAboutAccounts=true&automatedBrowser=true`;

  let email;
  const PASSWORD = '12345678';

  const {
    clearBrowserState,
    click,
    closeCurrentWindow,
    createUser,
    fillOutSignIn,
    fillOutSignInUnblock,
    noEmailExpected,
    noPageTransition,
    openPage,
    openVerificationLinkInNewTab,
    respondToWebChannelMessage,
    testElementExists,
    testEmailExpected,
    testIsBrowserNotified,
    thenify,
    visibleByQSA,
  } = FunctionalHelpers;

  const setupTest = thenify(function (options = {}) {
    const signInEmail = options.signInEmail || email;
    const signUpEmail = options.signUpEmail || email;

    const successSelector = options.blocked ? selectors.SIGNIN_UNBLOCK.HEADER :
                            options.preVerified ? selectors.CONFIRM_SIGNIN.HEADER :
                            selectors.CONFIRM_SIGNUP.HEADER;

    return this.parent
      .then(clearBrowserState({ force: true }))
      .then(createUser(signUpEmail, PASSWORD, { preVerified: options.preVerified }))
      .then(openPage(PAGE_URL, selectors.SIGNIN.HEADER, { query: options.query, webChannelResponses: {
        'fxaccounts:can_link_account': { ok: true },
        'fxaccounts:fxa_status': { capabilities: null, signedInUser: null },
      }}))
      .then(fillOutSignIn(signInEmail, PASSWORD))
      .then(testElementExists(successSelector))
      .then(testIsBrowserNotified('fxaccounts:can_link_account'))
      .then(() => {
        if (! options.blocked) {
          return this.parent
            .then(testIsBrowserNotified('fxaccounts:login'));
        }
      });
  });

  registerSuite({
    name: 'Firefox Desktop Sync v3 signin',

    beforeEach: function () {
      email = TestHelpers.createEmail('sync{id}');

      return this.remote
        .then(clearBrowserState());
    },

    'verified, verify same browser, Fx <= 56': function () {
      const forceUA = uaStrings['desktop_firefox_56'];
      const query = { forceUA };

      return this.remote
        .then(setupTest({ preVerified: true, query }))

        .then(openVerificationLinkInNewTab(email, 0))
        .switchToWindow('newwindow')
          .then(testElementExists(selectors.SIGNIN_COMPLETE.HEADER))
          .then(closeCurrentWindow())

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition(selectors.CONFIRM_SIGNIN.HEADER));
    },

    'verified, verify same browser, Fx >= 57': function () {
      const forceUA = uaStrings['desktop_firefox_57'];
      const query = { forceUA };

      return this.remote
        .then(setupTest({ preVerified: true, query }))

        .then(openVerificationLinkInNewTab(email, 0))
        .switchToWindow('newwindow')
          .then(testElementExists(selectors.SIGNIN_COMPLETE.HEADER))
          .then(closeCurrentWindow())

        .then(testElementExists(selectors.SIGNIN_COMPLETE.HEADER));
    },

    'verified, resend email, verify same browser': function () {
      return this.remote
        .then(setupTest({ preVerified: true }))

        .then(click('#resend'))
        .then(visibleByQSA('.success'))

        // email 0 is the original signin email, open the resent email instead
        .then(openVerificationLinkInNewTab(email, 1))
        .switchToWindow('newwindow')
          .then(testElementExists(selectors.SIGNIN_COMPLETE.HEADER))
          .then(closeCurrentWindow())

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition(selectors.CONFIRM_SIGNIN.HEADER));
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
        .then(openVerificationLinkInNewTab(email, 1))
        .then(testEmailExpected(email, 2))

        .switchToWindow('newwindow')
          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
          .then(closeCurrentWindow())

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition(selectors.CONFIRM_SIGNUP.HEADER));
    },

    'verified, blocked': function () {
      email = TestHelpers.createEmail('blocked{id}');

      return this.remote
        .then(setupTest({ blocked: true, preVerified: true }))

        .then(fillOutSignInUnblock(email, 0))

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition(selectors.SIGNIN_UNBLOCK.HEADER))
        .then(testIsBrowserNotified('fxaccounts:login'));
    },

    'verified, blocked, incorrect email case': function () {
      const signUpEmail = TestHelpers.createEmail('blocked{id}');
      const signInEmail = signUpEmail.toUpperCase();
      return this.remote
        .then(setupTest({
          blocked: true,
          preVerified: true,
          signInEmail: signInEmail,
          signUpEmail: signUpEmail
        }))

        // a second `can_link_account` request is sent to the browser after the
        // unblock code is filled in, this time with the canonicalized email address.
        // If a different user was signed in to the browser, two "merge" dialogs
        // are presented, the first for the non-canonicalized email, the 2nd for
        // the canonicalized email. Ugly UX, but at least the user can proceed.
        .then(respondToWebChannelMessage('fxaccounts:can_link_account', { ok: true } ))
        .then(fillOutSignInUnblock(signUpEmail, 0))

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition(selectors.SIGNIN_UNBLOCK.HEADER))
        .then(testIsBrowserNotified('fxaccounts:login'));
    }
  });
});
