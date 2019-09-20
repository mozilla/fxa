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
const PASSWORD = '12345678';
const SIGNIN_URL = `${
  intern._config.fxaContentRoot
}signin?context=fx_desktop_v3&service=sync&automatedBrowser=true&forceAboutAccounts=true&forceUA=${encodeURIComponent(
  uaStrings.desktop_firefox_56
)}`; //eslint-disable-line max-len
const SIGNUP_URL = `${
  intern._config.fxaContentRoot
}signup?context=fx_desktop_v3&service=sync&automatedBrowser=true&forceAboutAccounts=true&forceUA=${encodeURIComponent(
  uaStrings.desktop_firefox_56
)}`; //eslint-disable-line max-len

const {
  clearBrowserState,
  click,
  closeCurrentWindow,
  createUser,
  fillOutEmailFirstSignIn,
  fillOutSignUp,
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
          openPage(SIGNUP_URL, selectors.SIGNUP.HEADER, {
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

  afterEach: function() {
    return this.remote.then(clearBrowserState());
  },

  tests: {
    'sign up, bounce email at /choose_what_to_sync, allow user to restart flow but force a different email': function() {
      const client = getFxaClient();

      return (
        this.remote
          .then(fillOutSignUp(bouncedEmail, PASSWORD))
          .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))

          .then(() => client.accountDestroy(bouncedEmail, PASSWORD))

          .then(testElementExists(selectors.SIGNUP.HEADER))
          // The first can_link_account handler is removed, hook up another.
          .then(
            respondToWebChannelMessage('fxaccounts:can_link_account', {
              ok: true,
            })
          )
          // expect an error message to already be present on redirect
          .then(visibleByQSA(selectors.SIGNUP.TOOLTIP_BOUNCED_EMAIL))
          .then(type(selectors.SIGNUP.EMAIL, bouncedEmail))
          // user must change the email address
          .then(click(selectors.SIGNUP.SUBMIT))
          // error message should still be around
          .then(visibleByQSA(selectors.SIGNUP.TOOLTIP_BOUNCED_EMAIL))
          .then(type(selectors.SIGNUP.EMAIL, deliveredEmail))
          .then(
            click(selectors.SIGNUP.SUBMIT, selectors.CHOOSE_WHAT_TO_SYNC.HEADER)
          )

          .then(
            click(
              selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT,
              selectors.CONFIRM_SIGNUP.HEADER
            )
          )
      );
    },

    'sign up, bounce email at /confirm': function() {
      const client = getFxaClient();

      return (
        this.remote
          .then(fillOutSignUp(bouncedEmail, PASSWORD))

          .then(testElementExists(selectors.CHOOSE_WHAT_TO_SYNC.HEADER))
          .then(
            click(
              selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT,
              selectors.CONFIRM_SIGNUP.HEADER
            )
          )

          .then(() => client.accountDestroy(bouncedEmail, PASSWORD))

          .then(testElementExists(selectors.SIGNUP.HEADER))
          // The first can_link_account handler is removed, hook up another.
          .then(
            respondToWebChannelMessage('fxaccounts:can_link_account', {
              ok: true,
            })
          )
          // expect an error message to already be present on redirect
          .then(visibleByQSA(selectors.SIGNUP.TOOLTIP_BOUNCED_EMAIL))
          .then(type(selectors.SIGNUP.EMAIL, bouncedEmail))
          // user must change the email address
          .then(click(selectors.SIGNUP.SUBMIT))
          // error message should still be around
          .then(visibleByQSA(selectors.SIGNUP.TOOLTIP_BOUNCED_EMAIL))
          .then(type(selectors.SIGNUP.EMAIL, deliveredEmail))
          .then(
            click(selectors.SIGNUP.SUBMIT, selectors.CHOOSE_WHAT_TO_SYNC.HEADER)
          )

          .then(
            click(
              selectors.CHOOSE_WHAT_TO_SYNC.SUBMIT,
              selectors.CONFIRM_SIGNUP.HEADER
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
      openPage(SIGNIN_URL, selectors.SIGNIN.HEADER, {
        webChannelResponses: {
          'fxaccounts:can_link_account': { ok: true },
          'fxaccounts:fxa_status': { capabilities: null, signedInUser: null },
        },
      })
    )
    .then(fillOutEmailFirstSignIn(email, PASSWORD))
    .then(testElementExists(selectors.CONFIRM_SIGNIN.HEADER))
    .then(testIsBrowserNotified('fxaccounts:can_link_account'))
    .then(testIsBrowserNotified('fxaccounts:login'))
    .then(() => client.accountDestroy(email, PASSWORD))
    .then(testElementExists(selectors.SIGNIN_BOUNCED.HEADER))
    .then(testElementExists(selectors.SIGNIN_BOUNCED.CREATE_ACCOUNT))
    .then(testElementExists(selectors.SIGNIN_BOUNCED.BACK))
    .then(testElementExists(selectors.SIGNIN_BOUNCED.SUPPORT));
});

registerSuite('signin with an email that bounces', {
  afterEach: function() {
    return this.remote.then(clearBrowserState());
  },
  tests: {
    'click create-account': function() {
      return this.remote
        .then(setUpBouncedSignIn())
        .then(click(selectors.SIGNIN_BOUNCED.CREATE_ACCOUNT))
        .then(testElementExists(selectors.SIGNUP.HEADER))
        .then(testElementValueEquals(selectors.SIGNUP.EMAIL, ''))
        .then(testElementValueEquals(selectors.SIGNUP.PASSWORD, ''));
    },

    'click back': function() {
      const email = TestHelpers.createEmail('sync{id}');
      return this.remote
        .then(setUpBouncedSignIn(email))
        .then(click(selectors.SIGNIN_BOUNCED.BACK))
        .then(testElementExists(selectors.SIGNIN.HEADER))
        .then(testElementValueEquals(selectors.SIGNIN.EMAIL, email))
        .then(testElementValueEquals(selectors.SIGNIN.PASSWORD, PASSWORD));
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
        .then(testElementExists(selectors.SIGNIN.HEADER));
    },
  },
});
