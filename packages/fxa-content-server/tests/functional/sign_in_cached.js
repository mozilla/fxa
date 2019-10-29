/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const { FX_DESKTOP_V3_CONTEXT } = require('../../app/scripts/lib/constants');
const selectors = require('./lib/selectors');

const config = intern._config;

const ENTER_EMAIL_URL = config.fxaContentRoot;
// The automatedBrowser query param tells signin/up to stub parts of the flow
// that require a functioning desktop channel
const PAGE_ENTER_EMAIL_SYNC_DESKTOP = `${config.fxaContentRoot}?context=${FX_DESKTOP_V3_CONTEXT}&service=sync&forceAboutAccounts=true`;

const PASSWORD = 'password12345678';
let email;
let email2;

const {
  clearBrowserState,
  clearSessionStorage,
  click,
  createUser,
  denormalizeStoredEmail,
  destroySessionForEmail,
  fillOutEmailFirstSignIn,
  fillOutEmailFirstSignUp,
  getStoredAccountByEmail,
  openPage,
  respondToWebChannelMessage,
  testElementExists,
  testElementTextEquals,
  testElementValueEquals,
  testIsBrowserNotified,
  type,
  visibleByQSA,
} = FunctionalHelpers;

registerSuite('cached signin', {
  beforeEach: function() {
    email = TestHelpers.createEmail('sync{id}');
    email2 = TestHelpers.createEmail();
    return this.remote
      .then(clearBrowserState({ force: true }))
      .then(createUser(email, PASSWORD, { preVerified: true }))
      .then(createUser(email2, PASSWORD, { preVerified: true }));
  },
  tests: {
    'sign in twice, on second attempt email will be cached': function() {
      return (
        this.remote
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, PASSWORD))

          .then(testElementExists(selectors.SETTINGS.HEADER))
          // reset prefill and context
          .then(clearSessionStorage())

          .then(openPage(ENTER_EMAIL_URL, selectors.SIGNIN_PASSWORD.HEADER))
          .then(click(selectors.SIGNIN_PASSWORD.SUBMIT_USE_SIGNED_IN))

          .then(testElementExists(selectors.SETTINGS.HEADER))
      );
    },

    'sign in with incorrect email case before normalization fix, on second attempt canonical form is used': function() {
      return (
        this.remote
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, PASSWORD))

          .then(testElementExists(selectors.SETTINGS.HEADER))

          // reset prefill and context
          .then(clearSessionStorage())

          .then(openPage(ENTER_EMAIL_URL, selectors.SIGNIN_PASSWORD.HEADER))
          // synthesize signin pre-#4470 with incorrect email case.
          // to avoid a timing issue where the de-normalized email was
          // being overwritten in localStorage when denormalization was
          // done on the settings page, wait for the signin page to load,
          // denormalize, then refresh. See #4711
          .then(denormalizeStoredEmail(email))
          .refresh()
          .then(testElementExists(selectors.SIGNIN_PASSWORD.HEADER))

          // email is not yet normalized :(
          .then(
            testElementTextEquals(
              selectors.SIGNIN_PASSWORD.EMAIL_NOT_EDITABLE,
              email.toUpperCase()
            )
          )
          .then(click(selectors.SIGNIN_PASSWORD.SUBMIT_USE_SIGNED_IN))

          .then(testElementExists(selectors.SETTINGS.HEADER))
          // email is normalized!
          .then(testElementTextEquals(selectors.SETTINGS.PROFILE_HEADER, email))
      );
    },

    'sign in once, use a different account': function() {
      return (
        this.remote
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, PASSWORD))

          .then(testElementExists(selectors.SETTINGS.HEADER))

          .then(openPage(ENTER_EMAIL_URL, selectors.SIGNIN_PASSWORD.HEADER))
          // testing to make sure "Use different account" button works
          .then(click(selectors.SIGNIN_PASSWORD.LINK_USE_DIFFERENT))

          .then(testElementValueEquals(selectors.ENTER_EMAIL.EMAIL, email))

          .then(fillOutEmailFirstSignIn(email2, PASSWORD))

          .then(testElementExists(selectors.SETTINGS.HEADER))

          // testing to make sure cached signin comes back after a refresh
          .then(openPage(ENTER_EMAIL_URL, selectors.SIGNIN_PASSWORD.HEADER))

          .then(click(selectors.SIGNIN_PASSWORD.LINK_USE_DIFFERENT))
          .then(testElementExists(selectors.ENTER_EMAIL.EMAIL))
          .then(testElementValueEquals(selectors.ENTER_EMAIL.EMAIL, email2))

          .then(openPage(ENTER_EMAIL_URL, selectors.SIGNIN_PASSWORD.HEADER))
          .then(
            testElementTextEquals(
              selectors.SIGNIN_PASSWORD.EMAIL_NOT_EDITABLE,
              email2
            )
          )
      );
    },

    'expired cached credentials': function() {
      return this.remote
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email, PASSWORD))

        .then(testElementExists(selectors.SETTINGS.HEADER))

        .then(destroySessionForEmail(email))

        .then(openPage(ENTER_EMAIL_URL, selectors.SIGNIN_PASSWORD.HEADER))
        .then(
          testElementTextEquals(
            selectors.SIGNIN_PASSWORD.EMAIL_NOT_EDITABLE,
            email
          )
        )
        .then(type(selectors.SIGNIN_PASSWORD.PASSWORD, PASSWORD))
        .then(click(selectors.SIGNIN_PASSWORD.SUBMIT))

        .then(testElementExists(selectors.SETTINGS.HEADER));
    },

    'cached credentials that expire while on page': function() {
      return (
        this.remote
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignIn(email, PASSWORD))

          .then(testElementExists(selectors.SETTINGS.HEADER))

          .then(openPage(ENTER_EMAIL_URL, selectors.SIGNIN_PASSWORD.HEADER))
          .then(testElementExists(selectors.SIGNIN_PASSWORD.EMAIL_NOT_EDITABLE))

          .then(destroySessionForEmail(email))

          .then(click(selectors.SIGNIN_PASSWORD.SUBMIT_USE_SIGNED_IN))

          // Session expired error should show.
          .then(visibleByQSA(selectors.SIGNIN_PASSWORD.ERROR))

          .then(
            testElementTextEquals(
              selectors.SIGNIN_PASSWORD.EMAIL_NOT_EDITABLE,
              email
            )
          )
          .then(testElementValueEquals(selectors.SIGNIN_PASSWORD.EMAIL, email))
          .then(type(selectors.SIGNIN_PASSWORD.PASSWORD, PASSWORD))
          .then(click(selectors.SIGNIN_PASSWORD.SUBMIT))

          .then(testElementExists(selectors.SETTINGS.HEADER))
      );
    },

    'unverified cached signin redirects to confirm email': function() {
      const email = TestHelpers.createEmail();

      return (
        this.remote
          .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
          .then(fillOutEmailFirstSignUp(email, PASSWORD))

          .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))

          .then(openPage(ENTER_EMAIL_URL, selectors.SIGNIN_PASSWORD.HEADER))
          .then(click(selectors.SIGNIN_PASSWORD.SUBMIT_USE_SIGNED_IN))

          // cached login should still go to email confirmation screen for unverified accounts
          .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))
      );
    },

    'sign in on desktop then specify a different email on query parameter continues to cache desktop signin': function() {
      return (
        this.remote
          .then(
            openPage(
              PAGE_ENTER_EMAIL_SYNC_DESKTOP,
              selectors.ENTER_EMAIL.HEADER
            )
          )
          .then(
            respondToWebChannelMessage('fxaccounts:can_link_account', {
              ok: true,
            })
          )
          .then(fillOutEmailFirstSignIn(email, PASSWORD))
          .then(testElementExists(selectors.CONFIRM_SIGNIN.HEADER))
          .then(testIsBrowserNotified('fxaccounts:login'))

          .then(
            openPage(
              ENTER_EMAIL_URL + '?email=' + email2,
              selectors.SIGNIN_PASSWORD.HEADER
            )
          )
          .then(testElementValueEquals(selectors.SIGNIN_PASSWORD.EMAIL, email2))
          .then(type(selectors.SIGNIN_PASSWORD.PASSWORD, PASSWORD))
          .then(click(selectors.SIGNIN_PASSWORD.SUBMIT))

          .then(testElementExists(selectors.SETTINGS.HEADER))

          // reset prefill and context
          .then(clearSessionStorage())

          // testing to make sure cached signin comes back after a refresh
          .then(openPage(ENTER_EMAIL_URL, selectors.SIGNIN_PASSWORD.HEADER))
          .then(
            testElementTextEquals(
              selectors.SIGNIN_PASSWORD.EMAIL_NOT_EDITABLE,
              email
            )
          )
          .then(click(selectors.SIGNIN_PASSWORD.LINK_USE_DIFFERENT))

          .then(testElementExists(selectors.ENTER_EMAIL.EMAIL))
      );
    },

    'sign in with desktop context then no context, desktop credentials should persist': function() {
      return (
        this.remote
          .then(
            openPage(
              PAGE_ENTER_EMAIL_SYNC_DESKTOP,
              selectors.ENTER_EMAIL.HEADER
            )
          )
          .then(
            respondToWebChannelMessage('fxaccounts:can_link_account', {
              ok: true,
            })
          )
          .then(fillOutEmailFirstSignIn(email, PASSWORD))
          .then(testElementExists(selectors.CONFIRM_SIGNIN.HEADER))
          .then(testIsBrowserNotified('fxaccounts:login'))

          // ensure signin page is visible otherwise credentials might
          // not be cleared by clicking .use-different
          .then(
            openPage(
              ENTER_EMAIL_URL,
              selectors.SIGNIN_PASSWORD.LINK_USE_DIFFERENT
            )
          )
          .then(visibleByQSA(selectors.SIGNIN_PASSWORD.HEADER))
          .then(click(selectors.SIGNIN_PASSWORD.LINK_USE_DIFFERENT))
          // need to wait for the email field to be visible
          // before attempting to sign-in.
          .then(visibleByQSA(selectors.ENTER_EMAIL.EMAIL))

          .then(fillOutEmailFirstSignIn(email2, PASSWORD))
          .then(testElementExists(selectors.SETTINGS.HEADER))

          // reset prefill and context
          .then(clearSessionStorage())

          // testing to make sure cached signin comes back after a refresh
          .then(openPage(ENTER_EMAIL_URL, selectors.SIGNIN_PASSWORD.HEADER))
          .then(
            testElementTextEquals(
              selectors.SIGNIN_PASSWORD.EMAIL_NOT_EDITABLE,
              email
            )
          )

          .refresh()

          .then(testElementExists(selectors.SIGNIN_PASSWORD.LINK_USE_DIFFERENT))
          .then(
            testElementTextEquals(
              selectors.SIGNIN_PASSWORD.EMAIL_NOT_EDITABLE,
              email
            )
          )
      );
    },

    'sign in then use cached credentials to sign in again, existing session token should be re-authenticated': function() {
      let accountData1, accountData2;
      return this.remote
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email, PASSWORD))

        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(getStoredAccountByEmail(email))
        .then(accountData => {
          assert.ok(accountData.sessionToken);
          accountData1 = accountData;
        })

        .then(openPage(ENTER_EMAIL_URL, selectors.SIGNIN_PASSWORD.HEADER))
        .then(click(selectors.SIGNIN_PASSWORD.SUBMIT_USE_SIGNED_IN))

        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(getStoredAccountByEmail(email))
        .then(accountData => {
          assert.ok(accountData.sessionToken);
          accountData2 = accountData;
        })

        .then(() => {
          assert.equal(accountData1.uid, accountData2.uid);
          assert.equal(accountData1.sessionToken, accountData2.sessionToken);
        });
    },

    'sign in then use cached credentials to sign in to sync, a new session token should be created': function() {
      let accountData1, accountData2;
      return this.remote
        .then(openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER))
        .then(fillOutEmailFirstSignIn(email, PASSWORD))

        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(getStoredAccountByEmail(email))
        .then(accountData => {
          assert.ok(accountData.sessionToken);
          accountData1 = accountData;
        })

        .then(
          openPage(
            PAGE_ENTER_EMAIL_SYNC_DESKTOP,
            selectors.SIGNIN_PASSWORD.HEADER
          )
        )
        .then(
          respondToWebChannelMessage('fxaccounts:can_link_account', {
            ok: true,
          })
        )
        .then(type(selectors.SIGNIN_PASSWORD.PASSWORD, PASSWORD))
        .then(click(selectors.SIGNIN_PASSWORD.SUBMIT))

        .then(testIsBrowserNotified('fxaccounts:login'))
        .then(getStoredAccountByEmail(email))
        .then(accountData => {
          assert.ok(accountData.sessionToken);
          accountData2 = accountData;
        })

        .then(() => {
          assert.equal(accountData1.uid, accountData2.uid);
          assert.notEqual(accountData1.sessionToken, accountData2.sessionToken);
        });
    },
  },
});
