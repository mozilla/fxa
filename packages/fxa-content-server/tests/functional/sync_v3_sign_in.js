/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');
const uaStrings = require('./lib/ua-strings');

const config = intern._config;
const ENTER_EMAIL_URL = `${config.fxaContentRoot}?context=fx_desktop_v3&service=sync&forceAboutAccounts=true&automatedBrowser=true`;
const TOKEN_CODE_PAGE_URL = `${config.fxaContentRoot}?context=fx_desktop_v3&service=sync&automatedBrowser=true`;

let email;
const PASSWORD = '12345678';

const {
  clearBrowserState,
  click,
  closeCurrentWindow,
  createUser,
  fillOutEmailFirstSignIn,
  fillOutSignInTokenCode,
  fillOutSignInUnblock,
  noEmailExpected,
  noPageTransition,
  openPage,
  openVerificationLinkInDifferentBrowser,
  openVerificationLinkInNewTab,
  respondToWebChannelMessage,
  switchToWindow,
  testElementExists,
  testEmailExpected,
  testIsBrowserNotified,
  thenify,
  type,
  visibleByQSA,
} = FunctionalHelpers;

const setupTest = thenify(function(options = {}) {
  const signInEmail = options.signInEmail || email;
  const signUpEmail = options.signUpEmail || email;

  const successSelector = options.blocked
    ? selectors.SIGNIN_UNBLOCK.HEADER
    : options.preVerified
      ? selectors.CONFIRM_SIGNIN.HEADER
      : selectors.CONFIRM_SIGNUP.HEADER;

  return this.parent
    .then(
      createUser(signUpEmail, PASSWORD, { preVerified: options.preVerified })
    )
    .then(
      openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
        query: options.query,
        webChannelResponses: {
          'fxaccounts:can_link_account': { ok: true },
          'fxaccounts:fxa_status': { capabilities: null, signedInUser: null },
        },
      })
    )
    .then(fillOutEmailFirstSignIn(signInEmail, PASSWORD))
    .then(testElementExists(successSelector))
    .then(testIsBrowserNotified('fxaccounts:can_link_account'))
    .then(() => {
      if (! options.blocked) {
        return this.parent.then(testIsBrowserNotified('fxaccounts:login'));
      }
    });
});

registerSuite('Firefox Desktop Sync v3 signin', {
  beforeEach: function() {
    email = TestHelpers.createEmail('sync{id}');

    return this.remote.then(clearBrowserState({ force: true }));
  },
  tests: {
    'Fx >= 58, verified, does not need to confirm ': function() {
      const forceUA = uaStrings['desktop_firefox_58'];
      const query = { forceUA };

      email = TestHelpers.createEmail();

      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(
          openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
            query,
            webChannelResponses: {
              'fxaccounts:can_link_account': { ok: true },
              'fxaccounts:fxa_status': {
                capabilities: null,
                signedInUser: null,
              },
            },
          })
        )
        .then(fillOutEmailFirstSignIn(email, PASSWORD))

        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER));
    },

    "verified, verify same browser, new tab's P.O.V ": function() {
      return this.remote
        .then(setupTest({ preVerified: true }))
        .then(openVerificationLinkInNewTab(email, 0))
        .then(switchToWindow(1))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
        .then(closeCurrentWindow());
      // tests for the original tab are below.
    },

    "Fx <= 57, verified, verify same browser, original tab's P.O.V.": function() {
      const forceUA = uaStrings['desktop_firefox_57'];
      const query = { forceUA };

      return (
        this.remote
          .then(setupTest({ preVerified: true, query }))

          .then(openVerificationLinkInDifferentBrowser(email, 0))

          // about:accounts will take over post-verification, no transition
          .then(noPageTransition(selectors.CONFIRM_SIGNIN.HEADER))
      );
    },

    "Fx >= 58, verified, verify same browser, original tab's P.O.V.": function() {
      const forceUA = uaStrings['desktop_firefox_58'];
      const query = { forceUA };

      return (
        this.remote
          .then(setupTest({ preVerified: true, query }))

          .then(openVerificationLinkInDifferentBrowser(email, 0))
          // about:accounts does not take over post-verification in Fx >= 57
          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
      );
    },

    'verified, resend email, verify same browser': function() {
      return (
        this.remote
          .then(setupTest({ preVerified: true }))

          .then(click(selectors.CONFIRM_SIGNIN.LINK_RESEND))
          .then(visibleByQSA(selectors.CONFIRM_SIGNIN.RESEND_SUCCESS))

          // email 0 is the original signin email, open the resent email instead
          .then(openVerificationLinkInNewTab(email, 1))
          .then(switchToWindow(1))
          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
          .then(closeCurrentWindow())

          // about:accounts will take over post-verification, no transition
          .then(noPageTransition(selectors.CONFIRM_SIGNIN.HEADER))
      );
    },

    unverified: function() {
      // this test does a lot of waiting around, give it a little extra time
      this.timeout = 60 * 1000;

      return (
        this.remote
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

          .then(switchToWindow(1))
          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
          .then(closeCurrentWindow())

          // about:accounts will take over post-verification, no transition
          .then(noPageTransition(selectors.CONFIRM_SIGNUP.HEADER))
      );
    },

    'Fx <= 57, verified, blocked': function() {
      email = TestHelpers.createEmail('blocked{id}');
      const forceUA = uaStrings['desktop_firefox_57'];
      const query = { forceUA };

      return (
        this.remote
          .then(setupTest({ blocked: true, preVerified: true, query }))

          .then(fillOutSignInUnblock(email, 0))

          // about:accounts will take over post-verification, no transition
          .then(noPageTransition(selectors.SIGNIN_UNBLOCK.HEADER))
          .then(testIsBrowserNotified('fxaccounts:login'))
      );
    },

    'Fx >= 58, verified, blocked': function() {
      email = TestHelpers.createEmail('blocked{id}');
      const forceUA = uaStrings['desktop_firefox_58'];
      const query = { forceUA };

      return (
        this.remote
          .then(setupTest({ blocked: true, preVerified: true, query }))

          .then(fillOutSignInUnblock(email, 0))

          // about:accounts does not take over post-verification in Fx >= 58
          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
          .then(testIsBrowserNotified('fxaccounts:login'))
      );
    },

    'verified, blocked, incorrect email case': function() {
      const signUpEmail = TestHelpers.createEmail('blocked{id}');
      const signInEmail = signUpEmail.toUpperCase();
      return (
        this.remote
          .then(
            setupTest({
              blocked: true,
              preVerified: true,
              signInEmail: signInEmail,
              signUpEmail: signUpEmail,
            })
          )

          // a second `can_link_account` request is sent to the browser after the
          // unblock code is filled in, this time with the canonicalized email address.
          // If a different user was signed in to the browser, two "merge" dialogs
          // are presented, the first for the non-canonicalized email, the 2nd for
          // the canonicalized email. Ugly UX, but at least the user can proceed.
          .then(
            respondToWebChannelMessage('fxaccounts:can_link_account', {
              ok: true,
            })
          )
          .then(fillOutSignInUnblock(signUpEmail, 0))

          // about:accounts will take over post-verification, no transition
          .then(noPageTransition(selectors.SIGNIN_UNBLOCK.HEADER))
          .then(testIsBrowserNotified('fxaccounts:login'))
      );
    },
  },
});

registerSuite('Firefox Desktop Sync v3 signin - token code', {
  beforeEach: function() {
    email = TestHelpers.createEmail('sync{id}');

    return this.remote
      .then(clearBrowserState({ force: true }))
      .then(createUser(email, PASSWORD, { preVerified: true }));
  },

  tests: {
    'verified - control': function() {
      const query = {
        forceExperiment: 'tokenCode',
        forceExperimentGroup: 'control',
      };
      return (
        this.remote
          .then(
            openPage(TOKEN_CODE_PAGE_URL, selectors.ENTER_EMAIL.HEADER, {
              query,
              webChannelResponses: {
                'fxaccounts:can_link_account': { ok: true },
                'fxaccounts:fxa_status': {
                  capabilities: null,
                  signedInUser: null,
                },
              },
            })
          )

          .then(fillOutEmailFirstSignIn(email, PASSWORD))

          // about:accounts will take over post-verification, no transition
          .then(testIsBrowserNotified('fxaccounts:login'))
      );
    },

    'verified - treatment-code - valid code': function() {
      const query = {
        forceExperiment: 'tokenCode',
        forceExperimentGroup: 'treatment-code',
      };
      return (
        this.remote
          .then(
            openPage(TOKEN_CODE_PAGE_URL, selectors.ENTER_EMAIL.HEADER, {
              query,
              webChannelResponses: {
                'fxaccounts:can_link_account': { ok: true },
                'fxaccounts:fxa_status': { signedInUser: null },
              },
            })
          )
          .then(fillOutEmailFirstSignIn(email, PASSWORD))

          // Correctly submits the token code
          .then(testElementExists(selectors.SIGNIN_TOKEN_CODE.HEADER))
          .then(fillOutSignInTokenCode(email, 0))

          // about:accounts will take over post-verification, no transition
          .then(testIsBrowserNotified('fxaccounts:login'))
      );
    },

    'verified - treatment-code - invalid code': function() {
      const query = {
        forceExperiment: 'tokenCode',
        forceExperimentGroup: 'treatment-code',
      };
      return (
        this.remote
          .then(
            openPage(TOKEN_CODE_PAGE_URL, selectors.ENTER_EMAIL.HEADER, {
              query,
              webChannelResponses: {
                'fxaccounts:can_link_account': { ok: true },
                'fxaccounts:fxa_status': { signedInUser: null },
              },
            })
          )
          .then(fillOutEmailFirstSignIn(email, PASSWORD))

          // Displays invalid code errors
          .then(testElementExists(selectors.SIGNIN_TOKEN_CODE.HEADER))
          .then(type(selectors.SIGNIN_TOKEN_CODE.INPUT, 'INVALID'))
          .then(click(selectors.SIGNIN_TOKEN_CODE.SUBMIT))
      );
    },

    'verified - treatment-link - open link new tab': function() {
      const query = {
        forceExperiment: 'tokenCode',
        forceExperimentGroup: 'treatment-link',
      };
      return this.remote
        .then(
          openPage(TOKEN_CODE_PAGE_URL, selectors.ENTER_EMAIL.HEADER, {
            query,
            webChannelResponses: {
              'fxaccounts:can_link_account': { ok: true },
              'fxaccounts:fxa_status': { signedInUser: null },
            },
          })
        )
        .then(fillOutEmailFirstSignIn(email, PASSWORD))

        .then(testElementExists(selectors.CONFIRM_SIGNIN.HEADER))
        .then(openVerificationLinkInNewTab(email, 0))

        .then(testIsBrowserNotified('fxaccounts:login'));
    },
  },
});
