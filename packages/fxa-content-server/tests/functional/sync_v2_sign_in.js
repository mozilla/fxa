/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'tests/lib/helpers',
  'tests/functional/lib/helpers',
  'tests/functional/lib/selectors'
], function (intern, registerSuite, TestHelpers, FunctionalHelpers, selectors) {
  var config = intern.config;
  var PAGE_URL = config.fxaContentRoot + 'signin?context=fx_desktop_v2&service=sync&forceAboutAccounts=true';

  var email;
  var PASSWORD = '12345678';

  const {
    clearBrowserState,
    closeCurrentWindow,
    createUser,
    fillOutSignIn,
    fillOutSignInUnblock,
    noPageTransition,
    openPage,
    openVerificationLinkInDifferentBrowser,
    openVerificationLinkInNewTab,
    respondToWebChannelMessage,
    switchToWindow,
    testElementExists,
    testIsBrowserNotified,
    thenify,
  } = FunctionalHelpers;

  var setupTest = thenify(function (options) {
    options = options || {};
    const signInEmail = options.signInEmail || email;
    const signUpEmail = options.signUpEmail || email;

    const successSelector = options.blocked ? '#fxa-signin-unblock-header' :
                            options.preVerified ? '#fxa-confirm-signin-header' :
                            '#fxa-confirm-header';

    return this.parent
      .then(clearBrowserState({ force: true }))
      .then(createUser(signUpEmail, PASSWORD, { preVerified: options.preVerified }))
      .then(openPage(PAGE_URL, '#fxa-signin-header'))
      .then(respondToWebChannelMessage('fxaccounts:can_link_account', { ok: true } ))
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
    name: 'Firefox Desktop Sync v2 sign_in',

    beforeEach: function () {
      email = TestHelpers.createEmail('sync{id}');
    },

    'verified, verify same browser': function () {
      return this.remote
        .then(setupTest({ preVerified: true }))

        .then(openVerificationLinkInNewTab(email, 0))
        .then(switchToWindow(1))
          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
          .then(closeCurrentWindow())

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition('#fxa-confirm-signin-header'));
    },

    'verified, verify different browser - from original tab\'s P.O.V.': function () {
      return this.remote
        .then(setupTest({ preVerified: true }))

        .then(openVerificationLinkInDifferentBrowser(email))

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition('#fxa-confirm-signin-header'));
    },

    'unverified': function () {
      return this.remote
        .then(setupTest({ preVerified: false }));
    },

    'verified, blocked': function () {
      email = TestHelpers.createEmail('blocked{id}');

      return this.remote
        .then(setupTest({ blocked: true, preVerified: true }))

        .then(fillOutSignInUnblock(email, 0))

        // about:accounts will take over post-verification, no transition
        .then(noPageTransition('#fxa-signin-unblock-header'))
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
        .then(noPageTransition('#fxa-signin-unblock-header'))
        .then(testIsBrowserNotified('fxaccounts:login'));
    }
  });
});
