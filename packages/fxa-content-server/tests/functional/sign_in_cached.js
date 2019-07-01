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

// The automatedBrowser query param tells signin/up to stub parts of the flow
// that require a functioning desktop channel
const PAGE_SIGNIN = config.fxaContentRoot + 'signin';
const PAGE_SIGNIN_SYNC_DESKTOP =
  PAGE_SIGNIN +
  '?context=' +
  FX_DESKTOP_V3_CONTEXT +
  '&service=sync&forceAboutAccounts=true';
const PAGE_SIGNUP = config.fxaContentRoot + 'signup';
const PAGE_SIGNUP_SYNC_DESKTOP =
  config.fxaContentRoot +
  'signup?context=' +
  FX_DESKTOP_V3_CONTEXT +
  '&service=sync';

const PASSWORD = 'password';
let email;
let email2;

const {
  clearBrowserState,
  clearSessionStorage,
  click,
  createUser,
  denormalizeStoredEmail,
  destroySessionForEmail,
  fillOutSignIn,
  fillOutSignUp,
  getStoredAccountByEmail,
  openPage,
  openVerificationLinkInDifferentBrowser,
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
          .then(openPage(PAGE_SIGNIN, selectors.SIGNIN.HEADER))
          .then(fillOutSignIn(email, PASSWORD))

          .then(testElementExists(selectors.SETTINGS.HEADER))
          // reset prefill and context
          .then(clearSessionStorage())

          .then(openPage(PAGE_SIGNIN, selectors.SIGNIN.HEADER))
          .then(type(selectors.SIGNIN.PASSWORD, PASSWORD))
          .then(click(selectors.SIGNIN.SUBMIT))

          .then(testElementExists(selectors.SETTINGS.HEADER))
      );
    },

    'sign in with incorrect email case before normalization fix, on second attempt canonical form is used': function() {
      return (
        this.remote
          .then(openPage(PAGE_SIGNIN, selectors.SIGNIN.HEADER))
          .then(fillOutSignIn(email, PASSWORD))

          .then(testElementExists(selectors.SETTINGS.HEADER))

          // reset prefill and context
          .then(clearSessionStorage())

          .then(openPage(PAGE_SIGNIN, selectors.SIGNIN.HEADER))
          // synthesize signin pre-#4470 with incorrect email case.
          // to avoid a timing issue where the de-normalized email was
          // being overwritten in localStorage when denormalization was
          // done on the settings page, wait for the signin page to load,
          // denormalize, then refresh. See #4711
          .then(denormalizeStoredEmail(email))
          .refresh()
          .then(testElementExists(selectors.SIGNIN.HEADER))

          // email is not yet denormalized :(
          .then(
            testElementValueEquals(selectors.SIGNIN.EMAIL, email.toUpperCase())
          )
          .then(type(selectors.SIGNIN.PASSWORD, PASSWORD))
          .then(click(selectors.SIGNIN.SUBMIT))

          .then(testElementExists(selectors.SETTINGS.HEADER))
          // email is normalized!
          .then(testElementTextEquals('.card-header', email))
      );
    },

    'sign in first in sync context, on second attempt credentials will be cached': function() {
      return this.remote
        .then(openPage(PAGE_SIGNIN_SYNC_DESKTOP, selectors.SIGNIN.HEADER))
        .then(
          respondToWebChannelMessage('fxaccounts:can_link_account', {
            ok: true,
          })
        )
        .then(fillOutSignIn(email, PASSWORD))

        .then(testElementExists(selectors.CONFIRM_SIGNIN.HEADER))
        .then(testIsBrowserNotified('fxaccounts:login'))
        .then(openVerificationLinkInDifferentBrowser(email))

        .then(openPage(PAGE_SIGNIN, selectors.SIGNIN.HEADER))

        .then(click(selectors.SIGNIN.SUBMIT_USE_SIGNED_IN))
        .then(testElementExists(selectors.SETTINGS.HEADER));
    },

    'sign in once, use a different account': function() {
      return (
        this.remote
          .then(openPage(PAGE_SIGNIN, selectors.SIGNIN.HEADER))
          .then(fillOutSignIn(email, PASSWORD))

          .then(testElementExists(selectors.SETTINGS.HEADER))

          .then(openPage(PAGE_SIGNIN, selectors.SIGNIN.HEADER))
          // testing to make sure "Use different account" button works
          .then(click(selectors.SIGNIN.LINK_USE_DIFFERENT))

          // the form should not be prefilled
          .then(testElementValueEquals(selectors.SIGNIN.EMAIL, ''))

          .then(fillOutSignIn(email2, PASSWORD))

          .then(testElementExists(selectors.SETTINGS.HEADER))

          // testing to make sure cached signin comes back after a refresh
          .then(openPage(PAGE_SIGNIN, selectors.SIGNIN.HEADER))

          .then(click(selectors.SIGNIN.LINK_USE_DIFFERENT))
          .then(testElementExists(selectors.SIGNIN.EMAIL))

          .then(openPage(PAGE_SIGNIN, selectors.SIGNIN.HEADER))
          .then(testElementValueEquals(selectors.SIGNIN.EMAIL, ''))
      );
    },

    'sign in with cached credentials but with an expired session': function() {
      return (
        this.remote
          .then(openPage(PAGE_SIGNIN_SYNC_DESKTOP, selectors.SIGNIN.HEADER))
          .then(
            respondToWebChannelMessage('fxaccounts:can_link_account', {
              ok: true,
            })
          )
          .then(fillOutSignIn(email, PASSWORD))
          .then(testElementExists(selectors.CONFIRM_SIGNIN.HEADER))
          .then(testIsBrowserNotified('fxaccounts:login'))

          .then(destroySessionForEmail(email))

          .then(openPage(PAGE_SIGNIN, selectors.SIGNIN.HEADER))
          .then(click(selectors.SIGNIN.SUBMIT_USE_SIGNED_IN))

          // Session expired error should show.
          .then(visibleByQSA('.error'))

          .then(testElementValueEquals(selectors.SIGNIN.EMAIL, email))
          .then(type('input.password', PASSWORD))
          .then(click(selectors.SIGNIN.SUBMIT))

          .then(testElementExists(selectors.SETTINGS.HEADER))
      );
    },

    'unverified cached signin with sync context redirects to confirm email': function() {
      const email = TestHelpers.createEmail();
      return (
        this.remote
          .then(openPage(PAGE_SIGNUP_SYNC_DESKTOP, selectors.SIGNUP.HEADER))
          .then(
            respondToWebChannelMessage('fxaccounts:can_link_account', {
              ok: true,
            })
          )
          .then(fillOutSignUp(email, PASSWORD))

          .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
          .then(click(selectors.SIGNIN.SUBMIT))

          .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))
          // reset prefill and context
          .then(clearSessionStorage())

          .then(openPage(PAGE_SIGNIN, selectors.SIGNIN.HEADER))
          // cached login should still go to email confirmation screen for unverified accounts
          .then(click(selectors.SIGNIN.SUBMIT_USE_SIGNED_IN))

          .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))
      );
    },

    'unverified cached signin redirects to confirm email': function() {
      const email = TestHelpers.createEmail();

      return (
        this.remote
          .then(openPage(PAGE_SIGNUP, selectors.SIGNUP.HEADER))
          .then(fillOutSignUp(email, PASSWORD))

          .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))

          .then(openPage(PAGE_SIGNIN, selectors.SIGNIN.HEADER))
          .then(type(selectors.SIGNIN.PASSWORD, PASSWORD))
          .then(click(selectors.SIGNIN.SUBMIT))

          // cached login should still go to email confirmation screen for unverified accounts
          .then(testElementExists(selectors.CONFIRM_SIGNUP.HEADER))
      );
    },

    'sign in on desktop then sign in with prefill does not show picker': function() {
      return (
        this.remote
          .then(openPage(PAGE_SIGNIN_SYNC_DESKTOP, selectors.SIGNIN.HEADER))
          .then(
            respondToWebChannelMessage('fxaccounts:can_link_account', {
              ok: true,
            })
          )
          .then(fillOutSignIn(email, PASSWORD))
          .then(testElementExists(selectors.CONFIRM_SIGNIN.HEADER))
          .then(testIsBrowserNotified('fxaccounts:login'))

          .then(
            openPage(PAGE_SIGNIN + '?email=' + email2, selectors.SIGNIN.HEADER)
          )
          /*.then(testElementValueEquals('input.email.prefilled', email2))*/
          .then(type(selectors.SIGNIN.PASSWORD, PASSWORD))
          .then(click(selectors.SIGNIN.SUBMIT))

          .then(testElementExists(selectors.SETTINGS.HEADER))

          // reset prefill and context
          .then(clearSessionStorage())

          // testing to make sure cached signin comes back after a refresh
          .then(openPage(PAGE_SIGNIN, selectors.SIGNIN.HEADER))
          .then(
            testElementTextEquals(selectors.SIGNIN.EMAIL_NOT_EDITABLE, email)
          )
          .then(click(selectors.SIGNIN.LINK_USE_DIFFERENT))

          .then(testElementExists(selectors.SIGNIN.EMAIL))
      );
    },

    'sign in with desktop context then no context, desktop credentials should not persist': function() {
      return (
        this.remote
          .then(openPage(PAGE_SIGNIN_SYNC_DESKTOP, selectors.SIGNIN.HEADER))
          .then(
            respondToWebChannelMessage('fxaccounts:can_link_account', {
              ok: true,
            })
          )
          .then(fillOutSignIn(email, PASSWORD))
          .then(testElementExists(selectors.CONFIRM_SIGNIN.HEADER))
          .then(testIsBrowserNotified('fxaccounts:login'))

          // ensure signin page is visible otherwise credentials might
          // not be cleared by clicking .use-different
          .then(openPage(PAGE_SIGNIN, selectors.SIGNIN.LINK_USE_DIFFERENT))
          .then(visibleByQSA(selectors.SIGNIN.HEADER))
          // This will clear the desktop credentials
          .then(click(selectors.SIGNIN.LINK_USE_DIFFERENT))
          // need to wait for the email field to be visible
          // before attempting to sign-in.
          .then(visibleByQSA(selectors.SIGNIN.EMAIL))

          .then(fillOutSignIn(email2, PASSWORD))
          .then(testElementExists(selectors.SETTINGS.HEADER))

          // reset prefill and context
          .then(clearSessionStorage())

          // testing to make sure cached signin comes back after a refresh
          .then(openPage(PAGE_SIGNIN, selectors.SIGNIN.HEADER))
          .then(
            testElementTextEquals(selectors.SIGNIN.EMAIL_NOT_EDITABLE, email2)
          )

          .refresh()

          .then(testElementExists(selectors.SIGNIN.LINK_USE_DIFFERENT))
          .then(
            testElementTextEquals(selectors.SIGNIN.EMAIL_NOT_EDITABLE, email2)
          )
      );
    },

    'sign in then use cached credentials to sign in again, existing session token should be re-authenticated': function() {
      let accountData1, accountData2;
      return this.remote
        .then(openPage(PAGE_SIGNIN, selectors.SIGNIN.HEADER))
        .then(fillOutSignIn(email, PASSWORD))

        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(getStoredAccountByEmail(email))
        .then(accountData => {
          assert.ok(accountData.sessionToken);
          accountData1 = accountData;
        })

        .then(openPage(PAGE_SIGNIN, selectors.SIGNIN.HEADER))
        .then(type(selectors.SIGNIN.PASSWORD, PASSWORD))
        .then(click(selectors.SIGNIN.SUBMIT))

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
        .then(openPage(PAGE_SIGNIN, selectors.SIGNIN.HEADER))
        .then(fillOutSignIn(email, PASSWORD))

        .then(testElementExists(selectors.SETTINGS.HEADER))
        .then(getStoredAccountByEmail(email))
        .then(accountData => {
          assert.ok(accountData.sessionToken);
          accountData1 = accountData;
        })

        .then(openPage(PAGE_SIGNIN_SYNC_DESKTOP, selectors.SIGNIN.HEADER))
        .then(
          respondToWebChannelMessage('fxaccounts:can_link_account', {
            ok: true,
          })
        )
        .then(type(selectors.SIGNIN.PASSWORD, PASSWORD))
        .then(click(selectors.SIGNIN.SUBMIT))

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
