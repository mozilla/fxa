/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');
const uaStrings = require('./lib/ua-strings');

const config = intern._config;
const ENTER_EMAIL_URL = `${config.fxaContentRoot}?context=fx_desktop_v3&service=sync`;

let email;
const PASSWORD = '12345678';

const {
  clearBrowserState,
  click,
  createEmail,
  createUser,
  fillOutEmailFirstSignIn,
  fillOutSignInTokenCode,
  fillOutSignInUnblock,
  noEmailExpected,
  openPage,
  respondToWebChannelMessage,
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
    ? selectors.SIGNIN_TOKEN_CODE.HEADER
    : selectors.CONFIRM_SIGNUP_CODE.HEADER;

  const query = options.query || {
    forceUA: uaStrings['desktop_firefox_58'],
  };
  return this.parent
    .then(
      createUser(signUpEmail, PASSWORD, { preVerified: options.preVerified })
    )
    .then(
      openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
        query,
      })
    )
    .then(fillOutEmailFirstSignIn(signInEmail, PASSWORD))
    .then(testElementExists(successSelector))
    .then(testIsBrowserNotified('fxaccounts:can_link_account'));
});

registerSuite('Firefox Desktop Sync v3 signin', {
  beforeEach: function() {
    email = createEmail('sync{id}');

    return this.remote.then(clearBrowserState({ force: true }));
  },

  tests: {
    'verified, does not need to confirm ': function() {
      email = createEmail();
      const query = {
        forceUA: uaStrings['desktop_firefox_58'],
      };
      return this.remote
        .then(createUser(email, PASSWORD, { preVerified: true }))
        .then(
          openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
            query,
          })
        )
        .then(fillOutEmailFirstSignIn(email, PASSWORD))

        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
        .then(testIsBrowserNotified('fxaccounts:login'));
    },

    verified: function() {
      return this.remote
        .then(setupTest({ preVerified: true }))
        .then(fillOutSignInTokenCode(email, 0))
        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
        .then(testIsBrowserNotified('fxaccounts:login'));
    },

    'verified, resend': function() {
      return (
        this.remote
          .then(setupTest({ preVerified: true }))

          .then(click(selectors.SIGNIN_TOKEN_CODE.LINK_RESEND))
          .then(visibleByQSA(selectors.SIGNIN_TOKEN_CODE.SUCCESS))

          // email 0 is the original signin email, open the resent email instead
          .then(fillOutSignInTokenCode(email, 1))

          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
          .then(testIsBrowserNotified('fxaccounts:login'))
      );
    },

    'verified - invalid code': function() {
      return (
        this.remote
          .then(setupTest({ preVerified: true }))

          // Displays invalid code errors
          .then(type(selectors.SIGNIN_TOKEN_CODE.INPUT, 'INVALID'))
          .then(click(selectors.SIGNIN_TOKEN_CODE.SUBMIT))
          .then(visibleByQSA(selectors.SIGNIN_TOKEN_CODE.TOOLTIP))
          .then(fillOutSignInTokenCode(email, 0))

          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
          .then(testIsBrowserNotified('fxaccounts:login'))
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
          .then(fillOutSignInTokenCode(email, 1))
          .then(testEmailExpected(email, 2))

          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
          .then(testIsBrowserNotified('fxaccounts:login'))
      );
    },

    'verified, blocked': function() {
      email = createEmail('blocked{id}');
      return this.remote
        .then(setupTest({ blocked: true, preVerified: true }))

        .then(fillOutSignInUnblock(email, 0))

        .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
        .then(testIsBrowserNotified('fxaccounts:login'));
    },

    'verified, blocked, incorrect email case': function() {
      const signUpEmail = createEmail('blocked{id}');
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

          .then(testElementExists(selectors.CONNECT_ANOTHER_DEVICE.HEADER))
          .then(testIsBrowserNotified('fxaccounts:login'))
      );
    },
  },
});
