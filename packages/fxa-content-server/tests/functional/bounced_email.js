/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { registerSuite } = intern.getInterface('object');
const TestHelpers = require('../lib/helpers');
const FunctionalHelpers = require('./lib/helpers');
const selectors = require('./lib/selectors');
const uaStrings = require('./lib/ua-strings');
let bouncedEmail;
let deliveredEmail;
const PASSWORD = 'password12345678';
const ENTER_EMAIL_URL = `${
  intern._config.fxaContentRoot
}?context=fx_desktop_v3&service=sync&forceAboutAccounts=true&forceUA=${encodeURIComponent(
  uaStrings.desktop_firefox_56
)}`; //eslint-disable-line max-len

const {
  clearBrowserState,
  click,
  closeCurrentWindow,
  createUser,
  fillOutEmailFirstSignIn,
  fillOutEmailFirstSignUp,
  getFxaClient,
  openPage,
  pollUntil,
  respondToWebChannelMessage,
  switchToWindow,
  testElementExists,
  testElementValueEquals,
  testIsBrowserNotified,
  thenify,
  type,
  visibleByQSA,
} = FunctionalHelpers;

registerSuite('signup with an email that bounces', {
  beforeEach: function() {
    bouncedEmail = TestHelpers.createEmail();
    deliveredEmail = TestHelpers.createEmail();
    return (
      this.remote
        .then(clearBrowserState())
        // ensure a fresh signup page is loaded. If this suite is
        // run after a Sync suite, these tests try to use a Sync broker
        // which results in a channel timeout.
        .then(
          openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
            webChannelResponses: {
              'fxaccounts:can_link_account': { ok: true },
              'fxaccounts:fxa_status': {
                capabilities: null,
                signedInUser: null,
              },
            },
          })
        )
    );
  },

  tests: {
    'sign up, bounce email at /choose_what_to_sync, allow user to restart flow but force a different email': function() {
      const client = getFxaClient();

      return (
        this.remote
          .then(fillOutEmailFirstSignUp(bouncedEmail, PASSWORD))
          .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))

          .then(() => client.accountDestroy(bouncedEmail, PASSWORD))

          .then(testElementExists(selectors.ENTER_EMAIL.HEADER))
          // The first can_link_account handler is removed, hook up another.
          .then(
            respondToWebChannelMessage('fxaccounts:can_link_account', {
              ok: true,
            })
          )
          // expect an error message to already be present on redirect
          .then(visibleByQSA(selectors.ENTER_EMAIL.TOOLTIP_BOUNCED_EMAIL))
          .then(type(selectors.ENTER_EMAIL.EMAIL, bouncedEmail))
          // user must change the email address
          .then(click(selectors.ENTER_EMAIL.SUBMIT))
          // error message should still be around
          .then(visibleByQSA(selectors.ENTER_EMAIL.TOOLTIP_BOUNCED_EMAIL))
          .then(type(selectors.ENTER_EMAIL.EMAIL, deliveredEmail))
          .then(
            click(
              selectors.ENTER_EMAIL.SUBMIT,
              selectors.SIGNUP_PASSWORD.HEADER
            )
          )

          // password is remembered
          .then(
            click(
              selectors.SIGNUP_PASSWORD.SUBMIT,
              selectors.CHOOSE_WHAT_TO_SYNC.HEADER
            )
          )

          .then(
            click(
              selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT,
              selectors.CONFIRM_SIGNUP_CODE.HEADER
            )
          )
      );
    },
  },
});

const setUpBouncedSignIn = thenify(function(email) {
  const client = getFxaClient();
  email = email || TestHelpers.createEmail('sync{id}');

  return this.parent
    .then(clearBrowserState({ force: true }))
    .then(createUser(email, PASSWORD, { preVerified: true }))
    .then(
      openPage(ENTER_EMAIL_URL, selectors.ENTER_EMAIL.HEADER, {
        webChannelResponses: {
          'fxaccounts:can_link_account': { ok: true },
          'fxaccounts:fxa_status': { capabilities: null, signedInUser: null },
        },
      })
    )
    .then(fillOutEmailFirstSignIn(email, PASSWORD))
    .then(testElementExists(selectors.SIGNIN_TOKEN_CODE.HEADER))
    .then(testIsBrowserNotified('fxaccounts:can_link_account'))
    .then(() => client.accountDestroy(email, PASSWORD))
    .then(testElementExists(selectors.SIGNIN_BOUNCED.HEADER))
    .then(testElementExists(selectors.SIGNIN_BOUNCED.CREATE_ACCOUNT))
    .then(testElementExists(selectors.SIGNIN_BOUNCED.BACK))
    .then(testElementExists(selectors.SIGNIN_BOUNCED.SUPPORT));
});

registerSuite('signin with an email that bounces', {
  tests: {
    'click create-account': function() {
      return this.remote
        .then(setUpBouncedSignIn())
        .then(click(selectors.SIGNIN_BOUNCED.CREATE_ACCOUNT))
        .then(testElementExists(selectors.ENTER_EMAIL.HEADER))
        .then(testElementValueEquals(selectors.ENTER_EMAIL.EMAIL, ''));
    },

    'click back': function() {
      const email = TestHelpers.createEmail('sync{id}');
      return this.remote
        .then(setUpBouncedSignIn(email))
        .then(click(selectors.SIGNIN_BOUNCED.BACK))
        .then(testElementExists(selectors.SIGNIN_PASSWORD.HEADER))
        .then(testElementValueEquals(selectors.SIGNIN_PASSWORD.EMAIL, email))
        .then(
          testElementValueEquals(selectors.SIGNIN_PASSWORD.PASSWORD, PASSWORD)
        );
    },

    'click support': function() {
      return this.remote
        .then(setUpBouncedSignIn())
        .then(click(selectors.SIGNIN_BOUNCED.SUPPORT))
        .then(switchToWindow(1))
        .then(
          pollUntil(() =>
            window.location.href.startsWith('https://support.mozilla.org/')
          )
        )
        .then(closeCurrentWindow());
    },

    refresh: function() {
      return this.remote
        .then(setUpBouncedSignIn())
        .refresh()
        .then(
          respondToWebChannelMessage('fxaccounts:fxa_status', {
            capabilities: null,
            signedInUser: null,
          })
        )
        .then(testElementExists(selectors.SIGNIN_PASSWORD.HEADER));
    },
  },
});
